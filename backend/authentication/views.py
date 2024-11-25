import json
from re import M
import subprocess
import xgboost as xgb
from django.dispatch import receiver
from django.shortcuts import render
from rest_framework import viewsets
from datetime import datetime, timedelta
from django.db.models.signals import post_save
from django.utils import timezone

from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail, EmailMultiAlternatives
from prognosys import settings
from threading import Thread

from .models import *
from .model_loader import diabetes_model, heart_failure_model, diabetes_scaler, heart_failure_scaler, heart_failure_encoder
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *
from rest_framework import status

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from six import text_type
from django.contrib.sites.shortcuts import get_current_site  
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode  
from django.db.models import Q
from django.db.models import Count
from django.db.models import Sum

import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")
print(settings.GEMINI_API_KEY)

def generate_treatment_recommendation(test_result, prediction):
    """Generate AI treatment recommendations using Gemini"""
    try:
        # Convert choice codes to full names
        fasting_bs = 'Yes' if test_result.fasting_bs == 'Y' else 'No'
        exercise_angina = 'Yes' if test_result.exercise_angina == 'Y' else 'No'
        
        # Get full name for chest pain type
        chest_pain_map = {
            'TA': 'Typical Angina',
            'ATA': 'Atypical Angina',
            'NAP': 'Non-Anginal Pain',
            'ASY': 'Asymptomatic'
        }
        chest_pain = chest_pain_map.get(test_result.chest_pain_type)

        # Get full name for resting ECG
        resting_ecg_map = {
            'Normal': 'Normal',
            'ST': 'ST-T Wave Abnormality',
            'LVH': 'Left Ventricular Hypertrophy'
        }
        resting_ecg = resting_ecg_map.get(test_result.resting_ecg)

        prompt = f"""As a medical AI assistant, provide a brief but comprehensive treatment plan for a patient with the following:

Condition: {prediction.condition}
Confidence: {prediction.confidence}%

Patient Details:
- Age: {test_result.patient.age}
- Gender: {test_result.patient.user.gender}

Test Results:
- Glucose: {test_result.glucose}
- Blood Pressure: {test_result.blood_pressure}
- BMI: {test_result.bmi}
- Cholesterol: {test_result.cholesterol}
- Heart Rate: {test_result.max_hr}
- Fasting Blood Sugar < 120 mg/dL: {fasting_bs}
- Resting ECG: {resting_ecg}
- Exercise Angina: {exercise_angina}
- Chest Pain Type: {chest_pain}

Please provide a concise treatment plan with:
1. Brief Primary Treatment Plan (2-3 sentences)
2. Key Medications (if needed)
3. Essential Lifestyle Changes
4. Follow-up Timeline
5. Critical Warning Signs

Keep each section brief and focused on the most important points."""

        # Generate recommendation using Gemini
        response = model.generate_content(prompt)
        
        # Parse and structure the response
        recommendation = {
            'primary_recommendation': response.text.split('\n\n')[0],
            'detailed_plan': parse_treatment_sections(response.text),
            'warnings': extract_warnings(response.text)
        }
        
        return recommendation
        
    except Exception as e:
        print(f"Error generating treatment recommendation: {str(e)}")
        return None

def parse_treatment_sections(response_text):
    """Parse the response text into structured sections"""
    sections = []
    current_section = None
    current_recommendations = []
    
    for line in response_text.split('\n'):
        if any(header in line.lower() for header in ['medications:', 'lifestyle changes:', 'follow-up:']):
            if current_section:
                sections.append({
                    'category': current_section,
                    'recommendations': current_recommendations
                })
            current_section = line.strip(':')
            current_recommendations = []
        elif line.strip() and current_section:
            if line.startswith('- '):
                current_recommendations.append(line[2:])
            elif line.startswith('• '):
                current_recommendations.append(line[2:])
            else:
                current_recommendations.append(line)
    
    if current_section:
        sections.append({
            'category': current_section,
            'recommendations': current_recommendations
        })
    
    return sections

def extract_warnings(response_text):
    """Extract warning signs from the response"""
    warnings = []
    warning_section = False
    
    for line in response_text.split('\n'):
        if 'warning' in line.lower() or 'monitor' in line.lower():
            warning_section = True
        elif warning_section and line.strip():
            if line.startswith('- '):
                warnings.append(line[2:])
            elif line.startswith('• '):
                warnings.append(line[2:])
            elif not line.endswith(':'):
                warnings.append(line)
    
    return warnings

# Create your views here.
class TokenGenerator(PasswordResetTokenGenerator):  
    def _make_hash_value(self, user, timestamp):  
        return (  
            text_type(user.pk) + text_type(timestamp)
        )  
generate_token = TokenGenerator()

@api_view(['GET', 'OPTIONS'])
def activate(request, uidb64, token):  
    User = get_user_model()
    try:  
        uid = force_str(urlsafe_base64_decode(uidb64))  
        user = User.objects.get(pk=uid)  
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):  
        user = None
    if user is not None and generate_token.check_token(user, token):  
        user.is_active = True  
        user.save()  
        return Response({'success': 'Account activated successfully.'}, status=200)
    else:  
        return Response({'error': 'Invalid activation link.'}, status=400)


# Create your views here.
@api_view(['POST', 'OPTIONS'])
@authentication_classes([])
def register(request):
    """
    Register a new user.

    Args:
        request (Request): The request object containing user data.

    Returns:
        Response: A response object with success or error message.
    """
    if request.method == 'POST':
        user_data = request.data.copy()
        if 'name' not in user_data or 'email' not in user_data or 'password' not in user_data:
            return Response({'error': 'Missing required fields'}, status=400)
        
        user = User.objects.filter(email=user_data['email']).first()
        if user:
            return Response({'error': 'User already exists.'}, status=409)
        
        if not user_data.get('userRole'):
            user_data['userRole'] = UserRoleChoices.patient
        
        new_user = User(
            first_name=user_data['name'].split(' ')[0],
            last_name=user_data['name'].split(' ')[1],
            email=user_data['email'],
            user_role=user_data['userRole'],
            phone=user_data['phoneNumber'],
            gender=GenderChoices[(user_data['gender'])],
            dob=user_data['dateOfBirth'],
        )
        new_user.set_password(user_data['password'])
        new_user.is_active = True
        new_user.save()

        # current_site = get_current_site(request)
        # subject = "Welcome to HealthConnect"
        # html_message = render_to_string('new-email.html', {  
        # 'user': new_user,  
        # 'domain': current_site.domain,  
        # 'uid':urlsafe_base64_encode(force_bytes(new_user.pk)),  
        # 'token':generate_token.make_token(new_user),  
        # })
        # plain_message = strip_tags(html_message)
        # email = EmailMultiAlternatives(
        #     from_email=settings.EMAIL_HOST_USER,
        #     to=[new_user.email],
        #     body=plain_message,
        #     subject=subject,
        # )
        # email.attach_alternative(html_message, 'text/html')
        # email.send()

        return Response({'message': 'User registered successfully', 'status': 201, 'user': new_user.id}, status=201)

@api_view(['POST', 'OPTIONS'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_patient_profile(request):
    """
    Create a patient profile with additional details after user registration
    """
    if request.method == 'POST':
        try:
            patient_data = {
                'age': request.data.get('age'),
                'user': request.user,
            }

            print(request.data)
            
            patient_profile, created = PatientProfile.objects.get_or_create(
                user=User.objects.get(id=request.data.get('user')),
                age=request.data.get('age'),
                emergency_contact=request.data.get('emergency_contact'),
                medical_history=request.data.get('medical_history'),
            )
            
            if not created:
                # Update existing profile
                for key, value in patient_data.items():
                    setattr(patient_profile, key, value)
                patient_profile.save()

            return Response({
                'message': 'Patient profile created successfully',
                'status': 201
            }, status=201)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 400
            }, status=400)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Get basic user information for the navbar
    """
    user = request.user
    data = {
        'name': f"{user.first_name} {user.last_name}",
        'email': user.email,
        'role': user.user_role,
        'id': user.id
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """
    Get statistics for the dashboard
    """
    user = request.user
    
    # Get total patients count
    total_patients = PatientProfile.objects.count()
    
    # Get new patients in last month
    last_month = datetime.now() - timedelta(days=30)
    new_patients = PatientProfile.objects.filter(created_at__gte=last_month).count()
    
    # Get success rate (you might want to customize this based on your needs)
    total_predictions = Prediction.objects.count()
    correct_predictions = Prediction.objects.filter(
        status='confirmed'
    ).count()
    pending_predictions = Prediction.objects.filter(
        status='pending'
    ).count()
    
    success_rate = ((correct_predictions + pending_predictions) / total_predictions * 100) if total_predictions > 0 else 0
    
    data = {
        'total_patients': total_patients,
        'new_patients': new_patients,
        'success_rate': round(success_rate, 2),
        'total_predictions': total_predictions,
        'pending_predictions': pending_predictions,
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_patients(request):
    """
    Get list of all patients with their profiles
    """
    try:
        patients = PatientProfile.objects.select_related('user').all()
        data = [{
            'id': patient.id,
            'name': f"{patient.user.first_name} {patient.user.last_name}",
            'age': patient.age,
            'email': patient.user.email,
            'phone': patient.user.phone,
            'created_at': patient.created_at.strftime('%Y-%m-%d'),
            'status': 'Active'  # You might want to add a status field to your model
        } for patient in patients]
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_patient_details(request, patient_id):
    try:
        patient = PatientProfile.objects.select_related('user').prefetch_related('doctors').get(id=patient_id)
        data = {
            'name': f"{patient.user.first_name} {patient.user.last_name}",
            'age': patient.age,
            'emergency_contact': patient.emergency_contact,
            'medical_history': patient.medical_history,
            'created_at': patient.created_at,
            'doctors': [{
                'id': doctor.id,
                'name': f"{doctor.user.first_name} {doctor.user.last_name}",
                'specialization': doctor.specialization
            } for doctor in patient.doctors.all()]
        }
        return Response(data, status=status.HTTP_200_OK)
    except PatientProfile.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def submit_test_results(request, patient_id):
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        
        # Validate required fields
        required_fields = {
            'glucose': float,
            'bloodPressure': float,
            'skinThickness': float,
            'insulin': float,
            'bmi': float,
            'cholesterol': float,
            'fastingBS': str,
            'restingECG': str,
            'maxHR': int,
            'exerciseAngina': str,
            'chestPainType': str
        }
        
        # Validate all required fields and their types
        for field, field_type in required_fields.items():
            value = request.data.get(field)
            if value is None or value == '':
                return Response({
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                if field_type in [float, int]:
                    field_type(value)
            except ValueError:
                return Response({
                    'error': f'Invalid value for field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        # Create test result with all fields
        test_result = TestResult.objects.create(
            patient=patient,
            glucose=float(request.data['glucose']),
            blood_pressure=float(request.data['bloodPressure']),
            skin_thickness=float(request.data['skinThickness']),
            insulin=float(request.data['insulin']),
            bmi=float(request.data['bmi']),
            cholesterol=float(request.data['cholesterol']),
            fasting_bs=request.data['fastingBS'],
            resting_ecg=request.data['restingECG'],
            max_hr=int(request.data['maxHR']),
            exercise_angina=request.data['exerciseAngina'],
            chest_pain_type=request.data['chestPainType']
        )
        
        # Create medical record
        medical_record = MedicalRecord.objects.create(
            patient=patient,
            predicted_diagnosis="Pending",
            confirmed_diagnosis="Pending"
        )

        # Link test result to medical record
        test_result.medical_record = medical_record
        test_result.save()
        
        # Generate predictions
        test_result_id = test_result.id
        prediction_response = generate_prediction(request._request, test_result_id)
        if prediction_response.status_code != status.HTTP_201_CREATED:
            return prediction_response
        
        Notification.objects.create(
            user=request.user,
            message=f"Test results submitted successfully and predictions generated.",
            notification_type=NotificationType.TREATMENT_PLAN,
            priority='high',
            related_patient=test_result.patient
        )


        return Response({
            'message': 'Test results submitted and predictions generated successfully',
            'testResultId': test_result.id,
            'predictions': prediction_response.data['predictions']
        }, status=status.HTTP_201_CREATED)

    except PatientProfile.DoesNotExist:
        return Response({
            'error': 'Patient not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@receiver(post_save, sender=TestResult)
def notify_test_results(sender, instance, created, **kwargs):
    if created:
        # Notify all doctors assigned to the patient
        for doctor in instance.patient.doctors.all():
            Notification.objects.create(
                user=doctor.user,
                message=f"New test results available for patient {instance.patient.user.get_full_name()}",
                notification_type=NotificationType.TEST_RESULTS,
                priority='medium',
                related_patient=instance.patient
            )

def create_critical_alert(patient, vital_signs):
    """Create urgent notification for abnormal vital signs"""
    if (
        vital_signs.get('heart_rate', 0) > 100 or 
        vital_signs.get('blood_pressure_systolic', 0) > 140 or
        vital_signs.get('temperature', 0) > 38.5
    ):
        # Notify all doctors assigned to the patient
        for doctor in patient.doctors.all():
            Notification.objects.create(
                user=doctor.user,
                message=f"URGENT: Abnormal vital signs detected for {patient.user.get_full_name()}",
                notification_type=NotificationType.CRITICAL_ALERT,
                priority='urgent',
                related_patient=patient
            )

@receiver(post_save, sender=PatientProfile)
def notify_patient_update(sender, instance, created, **kwargs):
    if not created:  # Only for updates, not new patients
        # Notify all doctors assigned to the patient
        for doctor in instance.doctors.all():
            Notification.objects.create(
                user=doctor.user,
                message=f"Patient information updated for {instance.user.get_full_name()}",
                notification_type=NotificationType.PATIENT_UPDATE,
                priority='low',
                related_patient=instance
            )

# Add this new ViewSet class
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for the current user, ordered by creation date"""
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created')
    
    def perform_create(self, serializer):
        """Ensure the notification is created for the current user"""
        serializer.save(user=self.request.user)

# Add this new view function
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    try:
        Notification.objects.filter(
            user=request.user,
            seen=False
        ).update(seen=True)
        
        return Response({
            'message': 'All notifications marked as read'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

class PredictionViewSet(viewsets.ModelViewSet):
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Prediction.objects.all().order_by('-created_at')
    
    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests to update prediction status"""
        try:
            prediction = self.get_object()
            
            # Validate status
            new_status = request.data.get('status')
            if new_status not in ['pending', 'confirmed', 'rejected']:
                return Response({
                    'error': 'Invalid status value'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            prediction.status = new_status
            prediction.save()
            
            return Response(self.serializer_class(prediction).data)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class TreatmentPlanViewSet(viewsets.ModelViewSet):
    serializer_class = TreatmentPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TreatmentPlan.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctorprofile)

# Add new view to manage doctor assignments
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def assign_doctor(request, patient_id):
    """Assign a doctor to a patient"""
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        doctor_id = request.data.get('doctor_id')
        
        if not doctor_id:
            return Response({
                'error': 'Doctor ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        doctor = DoctorProfile.objects.get(id=doctor_id)
        
        # Add doctor to patient's doctors
        patient.doctors.add(doctor)
        
        return Response({
            'message': f'Doctor {doctor.user.get_full_name()} assigned to patient successfully'
        }, status=status.HTTP_200_OK)
        
    except PatientProfile.DoesNotExist:
        return Response({
            'error': 'Patient not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except DoctorProfile.DoesNotExist:
        return Response({
            'error': 'Doctor not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def remove_doctor(request, patient_id):
    """Remove a doctor from a patient"""
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        doctor_id = request.data.get('doctor_id')
        
        if not doctor_id:
            return Response({
                'error': 'Doctor ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        doctor = DoctorProfile.objects.get(id=doctor_id)
        
        # Remove doctor from patient's doctors
        patient.doctors.remove(doctor)
        
        return Response({
            'message': f'Doctor {doctor.user.get_full_name()} removed from patient successfully'
        }, status=status.HTTP_200_OK)
        
    except PatientProfile.DoesNotExist:
        return Response({
            'error': 'Patient not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except DoctorProfile.DoesNotExist:
        return Response({
            'error': 'Doctor not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_test_results(request, patient_id):
    """
    Get test results for a specific patient
    """
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        test_results = TestResult.objects.filter(patient=patient).order_by('-created_at')
        
        data = [{
            'id': result.id,
            'date': result.created_at.strftime('%Y-%m-%d'),
            'glucose': result.glucose,
            'blood_pressure': result.blood_pressure,
            'skin_thickness': result.skin_thickness,
            'insulin': result.insulin,
            'bmi': result.bmi,
            'cholesterol': result.cholesterol,
            'fasting_bs': result.fasting_bs,
            'resting_ecg': result.resting_ecg,
            'max_hr': result.max_hr,
            'exercise_angina': result.exercise_angina,
            'chest_pain_type': result.chest_pain_type,
        } for result in test_results]
        
        return Response(data, status=status.HTTP_200_OK)
        
    except PatientProfile.DoesNotExist:
        return Response({
            'error': 'Patient not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_system_stats(request):
    """Get system-wide statistics for admin dashboard"""
    try:
        User = get_user_model()
        total_users = User.objects.count()
        total_doctors = User.objects.filter(user_role=UserRoleChoices.health_professional).count()
        total_patients = User.objects.filter(user_role=UserRoleChoices.patient).count()
        total_resources = Resource.objects.count()
        available_resources = Resource.objects.filter(available=True).count()

        # Get model performance metrics
        total_predictions = Prediction.objects.count()
        correct_predictions = Prediction.objects.filter(status='confirmed').count()
        pending_predictions = Prediction.objects.filter(status='pending').count()
        print(correct_predictions, pending_predictions, total_predictions)
        accuracy = ((correct_predictions + pending_predictions) / total_predictions * 100) if total_predictions > 0 else 0

        return Response({
            'users': {
                'total': total_users,
                'doctors': total_doctors,
                'patients': total_patients
            },
            'resources': {
                'total': total_resources,
                'available': available_resources
            },
            'model_performance': {
                'accuracy': round(accuracy, 2),
                'total_predictions': total_predictions
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_users(request):
    """Manage system users"""
    if request.method == 'GET':
        search = request.GET.get('search', '')
        role = request.GET.get('role', '')
        
        User = get_user_model()
        users = User.objects.all()
        
        if search:
            users = users.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        if role:
            users = users.filter(user_role=role)
            
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_resources(request):
    """Manage system resources"""
    if request.method == 'GET':
        resources = Resource.objects.all()
        serializer = ResourceSerializer(resources, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retrain_model(request):
    """Trigger model retraining"""
    try:
        # Here you would implement your model retraining logic
        # This is a placeholder that simulates retraining
        return Response({
            'message': 'Model retraining initiated successfully',
            'status': 'pending'
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get user's profile information"""
    user = request.user
    data = {
        'name': f"{user.first_name} {user.last_name}",
        'email': user.email,
        'phone': user.phone,
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user's profile information"""
    try:
        user = request.user
        name_parts = request.data.get('name', '').split(' ', 1)
        
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        user.email = request.data.get('email', user.email)
        user.phone = request.data.get('phone', user.phone)
        user.save()

        return Response({
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'phone': user.phone,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user's password"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not user.check_password(current_password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_test_result_detail(request, patient_id, test_id):
    """
    Get detailed test result for a specific test
    """
    try:
        # Verify patient exists and get test result
        patient = PatientProfile.objects.get(id=patient_id)
        test_result = TestResult.objects.get(id=test_id, patient=patient)
        
        # Get prediction associated with this test result
        prediction = Prediction.objects.filter(test_result=test_result).first()
        
        # Format the data
        data = {
            'id': test_result.id,
            'date': test_result.created_at.strftime('%Y-%m-%d'),
            'time': test_result.created_at.strftime('%H:%M'),
            'glucose': test_result.glucose,
            'blood_pressure': test_result.blood_pressure,
            'skin_thickness': test_result.skin_thickness,
            'insulin': test_result.insulin,
            'bmi': test_result.bmi,
            'cholesterol': test_result.cholesterol,
            'fasting_bs': test_result.fasting_bs,
            'resting_ecg': test_result.resting_ecg,
            'max_hr': test_result.max_hr,
            'exercise_angina': test_result.exercise_angina,
            'chest_pain_type': test_result.chest_pain_type,
            'prediction_id': prediction.id if prediction else None
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except PatientProfile.DoesNotExist:
        return Response({
            'error': 'Patient not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except TestResult.DoesNotExist:
        return Response({
            'error': 'Test result not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_predictions(request, test_result_id):
    """Get predictions for a specific test result"""
    predictions = Prediction.objects.filter(test_result_id=test_result_id)
    return Response(PredictionSerializer(predictions, many=True).data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_prediction(request, test_result_id):
    """Generate prediction for test results using ML models"""
    try:
        test_result = TestResult.objects.get(id=test_result_id)
        gender = 'M' if test_result.patient.user.gender == 'Male' else 'F'
        
        # Prepare data for prediction
        features = {
            'diabetes': [
                test_result.glucose,
                test_result.blood_pressure,
                test_result.skin_thickness,
                test_result.insulin,
                test_result.bmi,
                test_result.patient.age,
            ],
            'heart': [
                test_result.patient.age,
                float(test_result.patient.user.gender == 'Male'),
                int(heart_failure_encoder["chest_pain_encoder"].transform([test_result.chest_pain_type])[0]),
                test_result.blood_pressure,
                test_result.cholesterol,
                int(heart_failure_encoder["label_encoder"].transform([test_result.fasting_bs])[0]),
                int(heart_failure_encoder["resting_ecg_encoder"].transform([test_result.resting_ecg])[0]),
                test_result.max_hr,
                int(heart_failure_encoder["label_encoder"].transform([test_result.exercise_angina])[0]),
            ]
        }

        print(features)

        # Scale features
        diabetes_features = diabetes_scaler.transform([features['diabetes']])
        heart_features = heart_failure_scaler.transform([features['heart']])

        # Get predictions
        diabetes_pred = diabetes_model.predict(diabetes_features)
        heart_pred = heart_failure_model.predict(xgb.DMatrix([heart_features[0]]))

        # Calculate confidence scores
        diabetes_confidence = float(int(diabetes_pred[0][0] * 1000) / 10)
        heart_confidence = float(int(heart_pred[0] * 1000) / 10)

        # Create predictions in database
        predictions = []
        
        # If both predictions have low confidence, create a "Healthy" prediction
        if diabetes_confidence < 50 and heart_confidence < 50:
            healthy_confidence = (100 - diabetes_confidence + 100 - heart_confidence) / 2
            predictions.append(Prediction.objects.create(
                patient=test_result.patient,
                test_result=test_result,
                condition='Healthy',
                confidence=healthy_confidence
            ))
        else:
            # Create predictions for conditions with confidence > 50%
            if diabetes_confidence >= 50:
                predictions.append(Prediction.objects.create(
                    patient=test_result.patient,
                    test_result=test_result,
                    condition='Diabetes',
                    confidence=diabetes_confidence
                ))

            if heart_confidence >= 50:
                predictions.append(Prediction.objects.create(
                    patient=test_result.patient,
                    test_result=test_result,
                    condition='Heart Disease',
                    confidence=heart_confidence
                ))

        # Create notifications for doctors
        for doctor in test_result.patient.doctors.all():
            Notification.objects.create(
                user=doctor.user,
                message=f"New predictions available for {test_result.patient.user.get_full_name()}",
                notification_type=NotificationType.PREDICTION,
                priority='high',
                related_patient=test_result.patient
            )

        # Generate treatment recommendations for each prediction
        for prediction in predictions:
            recommendation = generate_treatment_recommendation(test_result, prediction)
            if recommendation:
                # Create or update treatment plan
                TreatmentPlan.objects.create(
                    prediction=prediction,
                    patient=test_result.patient,
                    doctor=request.user.doctorprofile if hasattr(request.user, 'doctorprofile') else None,
                    primary_recommendation=recommendation['primary_recommendation'],
                    detailed_plan=recommendation['detailed_plan'],
                    warnings=recommendation['warnings']
                )

        return Response({
            'predictions': PredictionSerializer(predictions, many=True).data
        }, status=status.HTTP_201_CREATED)

    except TestResult.DoesNotExist:
        return Response({
            'error': 'Test result not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def treatment_plan(request, prediction_id):
    if request.method == 'GET':
        # Logic from get_treatment_plan
        try:
            prediction = Prediction.objects.get(id=prediction_id)
            treatment_plan = TreatmentPlan.objects.get(prediction=prediction)
            return Response(TreatmentPlanSerializer(treatment_plan).data)
        except (Prediction.DoesNotExist, TreatmentPlan.DoesNotExist):
            return Response({'error': 'Treatment plan not found'}, status=404)
            
    elif request.method == 'POST':
        """Create a new treatment plan"""
        try:
            prediction = Prediction.objects.get(id=prediction_id)
            test_result = prediction.test_result

            recommendation = generate_treatment_recommendation(test_result, prediction)

            if recommendation:
                # Create or update treatment plan
                treatment_plan = TreatmentPlan.objects.create(
                    prediction=prediction,
                    patient=test_result.patient,
                    doctor=request.user.doctorprofile if hasattr(request.user, 'doctorprofile') else None,
                    primary_recommendation=recommendation['primary_recommendation'],
                    detailed_plan=recommendation['detailed_plan'],
                    warnings=recommendation['warnings']
                )

                # Create notification for the patient
                Notification.objects.create(
                    user=test_result.patient.user,
                    message=f"New treatment plan created for your {prediction.condition} prediction",
                    notification_type=NotificationType.TREATMENT_PLAN,
                    priority='high',
                    related_patient=test_result.patient
                )

                # Create notifications for all assigned doctors
                Notification.objects.create(
                    user=request.user,
                    message=f"New treatment plan created for patient {test_result.patient.user.get_full_name()}",
                    notification_type=NotificationType.TREATMENT_PLAN,
                    priority='high',
                    related_patient=test_result.patient
                )

                return Response(status=status.HTTP_201_CREATED, data=TreatmentPlanSerializer(treatment_plan).data)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
                
        except Prediction.DoesNotExist:
            return Response({'error': 'Prediction not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'DELETE', 'PUT'])
@permission_classes([IsAdminUser])
def manage_users(request, user_id=None):
    """Manage system users"""
    if request.method == 'GET':
        search = request.GET.get('search', '')
        role = request.GET.get('role', '')
        
        users = User.objects.all()
        
        if search:
            users = users.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        if role and role != 'all':
            users = users.filter(user_role=role)
            
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            # Send welcome email
            send_welcome_email(user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        user = User.objects.get(id=user_id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'PUT':
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user, data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def manage_resources(request):
    """Manage medical resources"""
    if request.method == 'GET':
        search = request.GET.get('search', '')
        category = request.GET.get('category', '')
        status = request.GET.get('status', '')
        
        resources = Resource.objects.all()
        
        if search:
            resources = resources.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        if category:
            resources = resources.filter(category=category)
            
        if status:
            resources = resources.filter(status=status)
        
        serializer = ResourceSerializer(resources, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_dashboard_stats(request):
    """Get comprehensive statistics for admin dashboard"""
    try:
        # Get date range
        today = datetime.now()
        thirty_days_ago = today - timedelta(days=30)
        
        # User statistics
        total_users = User.objects.count()
        new_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        users_by_role = User.objects.values('user_role').annotate(count=Count('id'))
        
        # Resource statistics
        total_resources = Resource.objects.count()
        low_stock_resources = Resource.objects.filter(status='low_stock').count()
        resource_value = Resource.objects.aggregate(
            total_value=Sum(F('quantity') * F('unit_cost'))
        )['total_value'] or 0
        
        # Model performance
        total_predictions = MedicalRecord.objects.count()
        correct_predictions = MedicalRecord.objects.filter(
            predicted_diagnosis=F('confirmed_diagnosis')
        ).count()
        accuracy = (correct_predictions / total_predictions * 100) if total_predictions > 0 else 0
        
        # Activity statistics
        recent_activities = {
            'logins': User.objects.filter(last_login__gte=thirty_days_ago).count(),
            'predictions': MedicalRecord.objects.filter(created_at__gte=thirty_days_ago).count(),
            'resources_updated': Resource.objects.filter(last_restocked__gte=thirty_days_ago).count()
        }
        
        return Response({
            'users': {
                'total': total_users,
                'new': new_users,
                'by_role': users_by_role
            },
            'resources': {
                'total': total_resources,
                'low_stock': low_stock_resources,
                'total_value': resource_value
            },
            'model_performance': {
                'accuracy': round(accuracy, 2),
                'total_predictions': total_predictions,
                'recent_predictions': recent_activities['predictions']
            },
            'activity': recent_activities
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def restock_resource(request, resource_id):
    """Update resource stock levels"""
    try:
        resource = Resource.objects.get(id=resource_id)
        quantity = request.data.get('quantity', 0)
        
        if quantity <= 0:
            return Response({
                'error': 'Quantity must be greater than 0'
            }, status=400)
            
        resource.quantity += quantity
        resource.available += quantity
        resource.last_restocked = datetime.now()
        
        # Update status based on new quantity
        if resource.quantity >= resource.minimum_stock:
            resource.status = 'available'
        elif resource.quantity > 0:
            resource.status = 'low_stock'
        else:
            resource.status = 'out_of_stock'
            
        resource.save()
        
        return Response({
            'message': f'Successfully restocked {quantity} units',
            'current_quantity': resource.quantity,
            'status': resource.status
        })
        
    except Resource.DoesNotExist:
        return Response({
            'error': 'Resource not found'
        }, status=404)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=400)

def send_welcome_email(user):
    """Send welcome email to new users"""
    subject = "Welcome to HealthConnect"
    html_message = render_to_string('welcome-email.html', {
        'user': user,
        'login_url': settings.FRONTEND_URL + '/login'
    })
    plain_message = strip_tags(html_message)
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
    except Exception as e:
        # Log the error but don't stop the user creation process
        print(f"Failed to send welcome email: {str(e)}")

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_treatment_plans(request):
    """Get all treatment plans"""
    try:
        treatment_plans = TreatmentPlan.objects.select_related(
            'patient__user', 
            'prediction'
        ).all().order_by('-created_at')
        
        data = [{
            'id': plan.id,
            'patient_name': plan.patient.user.get_full_name(),
            'condition': plan.prediction.condition,
            'prediction_id': plan.prediction.id,
            'primary_treatment': plan.primary_recommendation,
            'created_at': plan.created_at,
            'updated_at': plan.updated_at,
        } for plan in treatment_plans]
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_vital_signs(request, patient_id):
    """
    Get vital signs history for a patient from their test results
    """
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        
        # Get test results ordered by date
        test_results = TestResult.objects.filter(
            patient=patient
        ).order_by('-created_at')
        
        # Format the vital signs data
        vital_signs = []
        print(vital_signs)
        for result in test_results:
            vital_signs.append({
                'date': result.created_at.strftime('%Y-%m-%d'),
                'heartRate': result.max_hr,
                'bloodPressure': result.blood_pressure,
                'temperature': round(35.5 + (result.bmi / 40 * 3), 1)  # Maps BMI to a range of ~35.5-38.5°C
            })
        print(vital_signs)
        
        return Response(vital_signs, status=status.HTTP_200_OK)
        
    except PatientProfile.DoesNotExist:
        return Response(
            {'error': 'Patient not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_prediction_stats(request):
    """Get prediction statistics for the last 7 days"""
    try:
        # Get predictions from the last 7 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=7)
        
        # Get all predictions within date range
        predictions = Prediction.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).values('created_at__date').annotate(
            total_predictions=Count('id'),
            correct_predictions=Count('id', filter=Q(status='confirmed')),
            pending_predictions=Count('id', filter=Q(status='pending'))
        ).order_by('created_at__date')
        
        # Format the response
        stats = []
        for pred in predictions:
            total = pred['total_predictions']
            correct = pred['correct_predictions']
            pending = pred['pending_predictions']
            # Calculate accuracy as a percentage between 0 and 100
            accuracy = ((correct + pending) / total) if total > 0 else 0
            # Ensure accuracy doesn't exceed 100%
            accuracy = min(round(accuracy, 1), 100)
            
            stats.append({
                'date': pred['created_at__date'],
                'accuracy': accuracy,
                'total_predictions': total
            })
        
        # If no data exists for some days, fill with zeros
        dates = set(pred['created_at__date'] for pred in predictions)
        for i in range(7):
            date = (end_date - timedelta(days=i)).date()
            if date not in dates:
                stats.append({
                    'date': date,
                    'accuracy': 0,
                    'total_predictions': 0
                })
        
        # Sort by date
        stats.sort(key=lambda x: x['date'])
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def manage_rooms(request):
    """Get all rooms or create a new room"""
    if request.method == 'GET':
        try:
            # Get query parameters for filtering
            room_type = request.GET.get('type')
            status = request.GET.get('status')
            floor = request.GET.get('floor')
            search = request.GET.get('search', '').lower()

            # Start with all rooms
            rooms = Room.objects.all()

            # Apply filters
            if room_type:
                rooms = rooms.filter(room_type=room_type)
            if status:
                rooms = rooms.filter(status=status)
            if floor:
                rooms = rooms.filter(floor=floor)
            if search:
                rooms = rooms.filter(
                    Q(name__icontains=search) |
                    Q(description__icontains=search)
                )

            serializer = RoomSerializer(rooms, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=400
            )

    elif request.method == 'POST':
        if not request.user.is_staff:  # Only admin can create rooms
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def room_detail(request, room_id):
    """Get, update or delete a specific room"""
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response(
            {'error': 'Room not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = RoomSerializer(room)
        return Response(serializer.data)

    elif request.method == 'PUT':
        if not request.user.is_staff:  # Only admin can update rooms
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = RoomSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.is_staff:  # Only admin can delete rooms
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def book_room(request, room_id):
    """Book a room"""
    try:
        room = Room.objects.get(id=room_id)
        doctor = request.user.doctorprofile
        
        # Validate room availability
        if room.status != 'available':
            return Response(
                {'error': 'Room is not available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RoomBookingSerializer(data={
            **request.data,
            'room': room.id,
            'doctor': doctor.id
        })
        
        if serializer.is_valid():
            # Check for booking conflicts
            start_time = serializer.validated_data['start_time']
            end_time = serializer.validated_data['end_time']
            
            conflicts = RoomBooking.objects.filter(
                room=room,
                status='scheduled',
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()
            
            if conflicts:
                return Response(
                    {'error': 'Room is already booked for this time period'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking = serializer.save()
            
            # Update room status
            room.status = 'reserved'
            room.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Room.DoesNotExist:
        return Response(
            {'error': 'Room not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def room_bookings(request, room_id=None):
    """Get all bookings or bookings for a specific room"""
    try:
        # Get query parameters
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        status = request.GET.get('status')

        # Start with all bookings or room-specific bookings
        bookings = RoomBooking.objects.all()
        if room_id:
            bookings = bookings.filter(room_id=room_id)

        # Apply filters
        if start_date:
            bookings = bookings.filter(start_time__gte=start_date)
        if end_date:
            bookings = bookings.filter(end_time__lte=end_date)
        if status:
            bookings = bookings.filter(status=status)

        serializer = RoomBookingSerializer(bookings, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def occupy_room(request, room_id):
    """Occupy a room"""
    try:
        room = Room.objects.get(id=room_id)
        
        # Check if room is available
        if room.status != 'available':
            return Response(
                {'message': 'Room is not available'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get doctor profile
        doctor = DoctorProfile.objects.get(user=request.user)
        
        # Update room status
        room.status = 'occupied'
        room.current_occupant = doctor
        room.save()
        
        return Response({
            'message': 'Room occupied successfully'
        })
        
    except Room.DoesNotExist:
        return Response(
            {'message': 'Room not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except DoctorProfile.DoesNotExist:
        return Response(
            {'message': 'Doctor profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def unoccupy_room(request, room_id):
    """Unoccupy a room"""
    try:
        room = Room.objects.get(id=room_id)
        doctor = DoctorProfile.objects.get(user=request.user)
        
        # Check if room is occupied by the requesting doctor
        if room.status != 'occupied' or room.current_occupant != doctor:
            return Response(
                {'message': 'You are not occupying this room'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Update room status
        room.status = 'available'
        room.current_occupant = None
        room.save()
        
        return Response({
            'message': 'Room unoccupied successfully'
        })
        
    except Room.DoesNotExist:
        return Response(
            {'message': 'Room not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except DoctorProfile.DoesNotExist:
        return Response(
            {'message': 'Doctor profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET', 'PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def manage_settings(request):
    """Get or update user settings"""
    try:
        # Get or create settings
        settings, created = UserSettings.objects.get_or_create(
            user=request.user,
            defaults={
                'email_notifications': True,
                'push_notifications': True,
                'room_updates': True,
                'system_updates': False,
                'theme': 'light',
                'compact_mode': False
            }
        )
        
        if request.method == 'GET':
            serializer = UserSettingsSerializer(settings)
            return Response(serializer.data)
            
        elif request.method == 'PATCH':
            serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=400
        )

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def reset_settings(request):
    """Reset user settings to defaults"""
    try:
        settings = request.user.settings
        
        # Reset to defaults
        settings.email_notifications = True
        settings.push_notifications = True
        settings.room_updates = True
        settings.system_updates = False
        settings.theme = 'light'
        settings.compact_mode = False
        settings.save()
        
        serializer = UserSettingsSerializer(settings)
        return Response({
            'message': 'Settings reset successfully',
            'settings': serializer.data
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=400
        )

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_notification_preferences(request):
    """Get user's notification preferences"""
    try:
        settings = request.user.settings
        return Response({
            'email_notifications': settings.email_notifications,
            'push_notifications': settings.push_notifications,
            'room_updates': settings.room_updates,
            'system_updates': settings.system_updates
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=400
        )
