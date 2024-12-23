from django.utils.timezone import make_aware, get_current_timezone
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.

    Meta:
        model (User): The User model.
        fields (list): The fields to include in the serialized data.
    """
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'user_role', 'is_active', 'phone', 'date_joined', 'password']
        extra_kwargs = {'password': {'write_only': True}}
        
    def get_name(self, obj):
        if obj.user_role == UserRoleChoices.health_professional:
            return f"Dr. {obj.first_name} {obj.last_name}"
        return f"{obj.first_name} {obj.last_name}"

    def create(self, validated_data):
        name = self.context['request'].data.get('name', '')
        first_name, last_name = '', ''
        if name:
            name_parts = name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            email=validated_data.get('email'),
            password=validated_data.get('password'),
            first_name=first_name,
            last_name=last_name,
            user_role=validated_data.get('user_role'),
            phone=validated_data.get('phone'),
            is_active=validated_data.get('is_active', True)
        )
        return user

    def update(self, instance, validated_data):
        name = self.context['request'].data.get('name', '')
        if name:
            name_parts = name.split(' ', 1)
            instance.first_name = name_parts[0]
            instance.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        for attr, value in validated_data.items():
            if attr != 'password':
                setattr(instance, attr, value)
            else:
                instance.set_password(value)
        
        instance.save()
        return instance


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization']


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'age', 'weight', 'height', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 
            'message', 
            'notification_type', 
            'created', 
            'seen', 
            'priority',
            'patient_name'
        ]
    
    def get_patient_name(self, obj):
        if obj.related_patient:
            return obj.related_patient.user.get_full_name()
        return None


class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'predicted_diagnosis', 'confirmed_diagnosis', 'created_at']


class PredictionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    vitals = serializers.SerializerMethodField()
    
    class Meta:
        model = Prediction
        fields = ['id', 'condition', 'confidence', 'created_at', 'status', 'patient_name', 'vitals']
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    
    def get_vitals(self, obj):
        test_result = obj.test_result
        return {
            'heartRate': test_result.max_hr,
            'bloodPressure': f"{int(test_result.blood_pressure)}/75",
            'bloodGlucose': test_result.glucose
        }


class TreatmentPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentPlan
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'id', 'name', 'category', 'quantity', 'available', 
            'unit_cost', 'location', 'last_restocked', 'minimum_stock',
            'description', 'status'
        ]


class RoomSerializer(serializers.ModelSerializer):
    current_occupant_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    room_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'room_type', 'room_type_display', 'description', 
            'is_occupied', 'current_occupant', 'current_occupant_name',
            'patient', 'patient_name', 'floor', 'capacity', 'equipment',
            'status', 'created_at', 'updated_at'
        ]

    def get_current_occupant_name(self, obj):
        return obj.current_occupant.user.get_full_name() if obj.current_occupant else None

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() if obj.patient else None

    def get_room_type_display(self, obj):
        return obj.get_room_type_display()


class RoomBookingSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    room_name = serializers.SerializerMethodField()

    class Meta:
        model = RoomBooking
        fields = [
            'id', 'room', 'room_name', 'doctor', 'doctor_name',
            'patient', 'patient_name', 'start_time', 'end_time',
            'purpose', 'status', 'created_at'
        ]

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name()

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() if obj.patient else None

    def get_room_name(self, obj):
        return obj.room.name


class UserSettingsSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()
    appearance = serializers.SerializerMethodField()

    class Meta:
        model = UserSettings
        fields = ['profile', 'notifications', 'appearance']

    def get_profile(self, obj):
        return {
            'name': f"{obj.user.first_name} {obj.user.last_name}",
            'email': obj.user.email,
            'phone': obj.user.phone or '',
            'department': obj.department or ''
        }

    def get_notifications(self, obj):
        return {
            'email': obj.email_notifications,
            'push': obj.push_notifications,
            'roomUpdates': obj.room_updates,
            'systemUpdates': obj.system_updates
        }

    def get_appearance(self, obj):
        return {
            'theme': obj.theme,
            'compactMode': obj.compact_mode
        }

    def update(self, instance, validated_data):
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
            user = instance.user
            user.first_name = profile_data.get('name', '').split()[0]
            user.last_name = ' '.join(profile_data.get('name', '').split()[1:])
            user.phone = profile_data.get('phone', user.phone)
            user.save()
            instance.department = profile_data.get('department', instance.department)

        if 'notifications' in validated_data:
            notifications = validated_data.pop('notifications')
            instance.email_notifications = notifications.get('email', instance.email_notifications)
            instance.push_notifications = notifications.get('push', instance.push_notifications)
            instance.room_updates = notifications.get('roomUpdates', instance.room_updates)
            instance.system_updates = notifications.get('systemUpdates', instance.system_updates)

        if 'appearance' in validated_data:
            appearance = validated_data.pop('appearance')
            instance.theme = appearance.get('theme', instance.theme)
            instance.compact_mode = appearance.get('compactMode', instance.compact_mode)

        instance.save()
        return instance


        # Update user profile data if provided
        user = instance.user
        if 'phone' in validated_data:
            user.phone = validated_data.pop('phone')
        if hasattr(user, 'doctorprofile') and 'department' in validated_data:
            user.doctorprofile.specialization = validated_data.pop('department')
            user.doctorprofile.save()
            
        # Update the rest of the settings
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

