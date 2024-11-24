from django.contrib import admin
from .models import TestResult, User, PatientProfile, DoctorProfile, Prediction, TreatmentPlan, Notification

# Register your models here.
admin.site.register([User, PatientProfile, DoctorProfile, Prediction, TreatmentPlan, TestResult, Notification])
