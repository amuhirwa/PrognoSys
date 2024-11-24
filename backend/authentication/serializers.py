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

