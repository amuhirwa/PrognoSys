import json
import subprocess
from django.dispatch import receiver
from django.shortcuts import render
from rest_framework import viewsets
from datetime import datetime, timedelta
from django.db.models.signals import post_save

from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail, EmailMultiAlternatives
from prognosys import settings
from threading import Thread

from .models import *
from .model_loader import diabetes_model, heart_failure_model, diabetes_scaler, heart_failure_scaler
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
                user=request.data.get('user'),
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
    total_predictions = MedicalRecord.objects.count()
    correct_predictions = MedicalRecord.objects.filter(
        predicted_diagnosis=models.F('confirmed_diagnosis')
    ).count()
    
    success_rate = (correct_predictions / total_predictions * 100) if total_predictions > 0 else 0
    
    data = {
        'total_patients': total_patients,
        'new_patients': new_patients,
        'success_rate': round(success_rate, 2),
        'total_predictions': total_predictions,
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
        prediction_response = generate_prediction(request, test_result.id)
        if prediction_response.status_code != status.HTTP_201_CREATED:
            return prediction_response

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
        total_predictions = MedicalRecord.objects.count()
        correct_predictions = MedicalRecord.objects.filter(
            predicted_diagnosis=models.F('confirmed_diagnosis')
        ).count()
        accuracy = (correct_predictions / total_predictions * 100) if total_predictions > 0 else 0

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

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_prediction(request, test_result_id):
    """Generate prediction for test results using ML models"""
    try:
        test_result = TestResult.objects.get(id=test_result_id)
        
        # Prepare data for prediction
        features = {
            'diabetes': [
                test_result.glucose,
                test_result.blood_pressure,
                test_result.skin_thickness,
                test_result.insulin,
                test_result.bmi,
            ],
            'heart': [
                test_result.blood_pressure,
                test_result.cholesterol,
                float(test_result.fasting_bs == 'Y'),
                float(test_result.resting_ecg == 'Normal'),
                test_result.max_hr,
                float(test_result.exercise_angina == 'Y'),
                float({'TA': 0, 'ATA': 1, 'NAP': 2, 'ASY': 3}[test_result.chest_pain_type])
            ]
        }

        # Scale features
        diabetes_features = diabetes_scaler.transform([features['diabetes']])
        heart_features = heart_failure_scaler.transform([features['heart']])

        # Get predictions
        diabetes_pred = diabetes_model.predict(diabetes_features)
        heart_pred = heart_failure_model.predict(xgb.DMatrix([heart_features[0]]))

        # Calculate confidence scores
        diabetes_confidence = float(abs(diabetes_pred[0][0] - 0.5) * 2 * 100)
        heart_confidence = float(abs(heart_pred[0] - 0.5) * 2 * 100)

        # Create predictions in database
        predictions = []
        if diabetes_confidence > 60:
            predictions.append(Prediction.objects.create(
                patient=test_result.patient,
                test_result=test_result,
                condition='Diabetes' if diabetes_pred[0][0] > 0.5 else 'No Diabetes',
                confidence=diabetes_confidence
            ))

        if heart_confidence > 60:
            predictions.append(Prediction.objects.create(
                patient=test_result.patient,
                test_result=test_result,
                condition='Heart Disease' if heart_pred[0] > 0.5 else 'No Heart Disease',
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
