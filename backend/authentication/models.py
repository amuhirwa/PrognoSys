from django.db import models

from django.contrib.auth.models import AbstractUser, BaseUserManager

from django.utils.translation import gettext_lazy as _

from datetime import datetime

from django.contrib import admin

from django.urls import reverse

from django.utils.html import format_html

from django.db.models.signals import post_save
from django.dispatch import receiver



# Create your models here.
class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user



    def create_user(self, email, password, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)


    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)



        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)





class UserRoleChoices(models.TextChoices):
    """
    Enum representing the roles of a user.

    Choices:
        health_professional (String): The name of the health professional role.
        patient (String): The name of the patient User role.
        admin_user (String): The name of the Admin User role.
    """
    health_professional = "Health Professional"
    patient = "Patient"
    admin_user = "admin"

class GenderChoices(models.TextChoices):
    """
    Enum representing the genders of a user.

    Choices:
        male (String): The name of the Male gender.
        female (String): The name of the Female gender.
        other (String): The name of the Other gender.
    """
    Male = "Male"
    Female = "Female"
    other = "Other"

    



class User(AbstractUser):
    """
    Model representing a User.

    Attributes:
        id (Integer): The primary key and unique identifier of the user.
        email (String): The email of the user.
        phone_number (String): The phone number of the user.
        first_name (String): The first name of the user.
        last_name (String): The last name of the user.
        password (String): The password of the user.
        user_role (String): The role of the user.
        created_at (DateTime): The date and time when the user was created.
    """
    username = None
    USERNAME_FIELD = 'email'
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

    REQUIRED_FIELDS = []

    user_role = models.CharField(max_length=20, choices=UserRoleChoices.choices, default=UserRoleChoices.patient)
    gender = models.CharField(max_length=10, choices=GenderChoices.choices, null=True, blank=True)
    dob = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    objects = UserManager()

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        verbose_name=_('groups'),
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text=_('Specific permissions for this user.'),
        verbose_name=_('user permissions'),
    )
    def __str__(self):
        return self.first_name + " " + self.last_name



class NotificationType(models.TextChoices):
    TEST_RESULTS = 'test_results', 'New Test Results Available'
    APPOINTMENT = 'appointment', 'Appointment Reminder/Update'
    CRITICAL_ALERT = 'critical_alert', 'Critical Patient Alert'
    PRESCRIPTION = 'prescription', 'Prescription Update'
    PATIENT_UPDATE = 'patient_update', 'Patient Information Update'
    TREATMENT_PLAN = 'treatment_plan', 'Treatment Plan Update'



class Notification(models.Model):
    """
    Model representing a Notification.

    Attributes:
        id (Integer): The primary key and unique identifier of the notification.
        user (Relationship): Foreign key referencing the User.
        message (String): The message of the notification.
        seen (Boolean): The status of the notification (seen or not).
        created (DateTime): When the notification was created.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.PATIENT_UPDATE
    )
    created = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('urgent', 'Urgent')
        ],
        default='medium'
    )

    related_patient = models.ForeignKey(
        'PatientProfile', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )



class DoctorProfile(models.Model):

    """

    Model representing a doctor profile.



    Attributes:

        id (Integer): The primary key and unique identifier of the doctor profile.

        user (Relationship): Foreign key referencing the User.

        specialization (String): The specialization of the doctor.

        available (Boolean): Whether the doctor is available or not.

        created_at (DateTime): The date and time when the doctor profile was created.

    """

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    specialization = models.CharField(max_length=100)

    license_number = models.CharField(max_length=50)

    patients = models.ManyToManyField('PatientProfile', related_name='doctors', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):

        return f"Dr. {self.user.first_name} {self.user.last_name}"

    



class PatientProfile(models.Model):

    """

    Model representing a patient profile.



    Attributes:

        id (Integer): The primary key and unique identifier of the patient profile.

        user (Relationship): Foreign key referencing the User.

        weight (Float): The weight of the patient.

        height (Float): The height of the patient.

        blood_glucose (Float): The blood glucose level of the patient.

        blood_pressure (Float): The blood pressure of the patient.

        allergies (Relationship): The allergies of the patient.

        created_at (DateTime): The date and time when the patient profile was created.

    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    age = models.IntegerField()

    weight = models.FloatField(blank=True, null=True)

    height = models.FloatField(blank=True, null=True)

    emergency_contact = models.CharField(max_length=20)

    medical_history = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):

        return f"{self.user.first_name} {self.user.last_name}"

    



class MedicalRecord(models.Model):

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)

    predicted_diagnosis = models.CharField(max_length=20)

    confirmed_diagnosis = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)





class TestResult(models.Model):

    """

    Model representing test results for a patient.



    Attributes:

        patient (Relationship): Foreign key referencing the PatientProfile.

        glucose (Float): Blood glucose level.

        blood_pressure (Float): Blood pressure reading.

        skin_thickness (Float): Skin thickness measurement.

        insulin (Float): Insulin level.

        bmi (Float): Body Mass Index.

        cholesterol (Float): Cholesterol level.

        fasting_bs (Boolean): Fasting blood sugar level.

        resting_ecg (String): Resting electrocardiogram results.

        max_hr (Integer): Maximum heart rate.

        exercise_angina (Boolean): Exercise-induced angina.

        chest_pain_type (String): Type of chest pain.

        created_at (DateTime): When the test results were recorded.

    """

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)

    glucose = models.FloatField()

    blood_pressure = models.FloatField()

    skin_thickness = models.FloatField()

    insulin = models.FloatField()

    bmi = models.FloatField()

    cholesterol = models.FloatField()

    fasting_bs = models.CharField(

        max_length=1,

        choices=[

            ('Y', 'Yes'),

            ('N', 'No')

        ]

    )

    resting_ecg = models.CharField(

        max_length=50,

        choices=[

            ('Normal', 'Normal'),

            ('ST', 'ST-T Wave Abnormality'),

            ('LVH', 'Left Ventricular Hypertrophy')

        ]

    )

    max_hr = models.IntegerField()

    exercise_angina = models.CharField(

        max_length=1,

        choices=[

            ('Y', 'Yes'),

            ('N', 'No')

        ]

    )

    chest_pain_type = models.CharField(

        max_length=3,

        choices=[

            ('TA', 'Typical Angina'),

            ('ATA', 'Atypical Angina'),

            ('NAP', 'Non-Anginal Pain'),

            ('ASY', 'Asymptomatic')

        ]

    )

    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):

        return f"Test Results for {self.patient.user.get_full_name()} on {self.created_at.strftime('%Y-%m-%d')}"





class PastMetrics(models.Model):

    """

    Model representing a past metrics.



    Attributes:

        id (Integer): The primary key and unique identifier of the past metrics.

        user (Relationship): Foreign key referencing the User.

        height (Float): The height of the patient.

        weight (Float): The weight of the patient.

        blood_glucose (Float): The blood glucose level of the patient.

        blood_pressure (Float): The blood pressure of the patient.

        created_at (DateTime): The date and time when the patient profile was created.

    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    height = models.FloatField(blank=True, null=True)

    weight = models.FloatField(blank=True, null=True)

    blood_glucose = models.FloatField(blank=True, null=True)

    blood_pressure = models.TextField(blank=True, null=True)

    updated_field = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now=True)



    @property

    def bmi(self):

        if self.height and self.weight:

            return round(self.weight / ((self.height / 100) ** 2), 2)

        return None





    def __str__(self):

        return f"{self.user.first_name} {self.user.last_name}"



class Resource(models.Model):

    name = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    quantity = models.IntegerField(default=1)

    available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)



    def __str__(self):

        return self.name



class ResourceAllocation(models.Model):

    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)

    allocated_to = models.ForeignKey(User, on_delete=models.CASCADE)

    quantity = models.IntegerField(default=1)

    allocated_at = models.DateTimeField(auto_now_add=True)

    return_date = models.DateTimeField(null=True, blank=True)

    status = models.CharField(

        max_length=20,

        choices=[

            ('pending', 'Pending'),

            ('approved', 'Approved'),

            ('rejected', 'Rejected'),

            ('returned', 'Returned')

        ],

        default='pending'

    )



    def __str__(self):

        return f"{self.resource.name} - {self.allocated_to.username}"



class Prediction(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    condition = models.CharField(max_length=255)
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    test_result = models.ForeignKey(TestResult, on_delete=models.CASCADE, related_name='predictions')
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('incorrect', 'Incorrect')
        ],
        default='pending'
    )

    def __str__(self):
        return f"{self.condition} - {self.patient.user.get_full_name()}"



class TreatmentPlan(models.Model):
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, null=True)
    primary_recommendation = models.TextField()
    detailed_plan = models.JSONField(default=list)
    warnings = models.JSONField(default=list)
    doctor_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Treatment Plan for {self.patient.user.get_full_name()}"

class RoomType(models.TextChoices):
    LAB = 'lab', 'Laboratory'
    PATIENT = 'patient', 'Patient Room'
    SURGERY = 'surgery', 'Surgery Room'
    ICU = 'icu', 'ICU'
    EMERGENCY = 'emergency', 'Emergency Room'
    CONSULTATION = 'consultation', 'Consultation Room'

class Room(models.Model):
    name = models.CharField(max_length=200)  # e.g., "Surgery Room 101"
    room_type = models.CharField(
        max_length=20,
        choices=RoomType.choices,
        default=RoomType.PATIENT
    )
    description = models.TextField(blank=True)
    is_occupied = models.BooleanField(default=False)
    current_occupant = models.ForeignKey(
        DoctorProfile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='occupied_rooms'
    )
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_rooms'
    )
    floor = models.IntegerField()
    capacity = models.IntegerField(default=1)
    equipment = models.TextField(blank=True)  # List of available equipment in the room
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('occupied', 'Occupied'),
            ('maintenance', 'Under Maintenance'),
            ('cleaning', 'Being Cleaned'),
            ('reserved', 'Reserved')
        ],
        default='available'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_room_type_display()})"

class RoomBooking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    purpose = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('scheduled', 'Scheduled'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled')
        ],
        default='scheduled'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room.name} - {self.doctor.user.get_full_name()}"

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    room_updates = models.BooleanField(default=True)
    system_updates = models.BooleanField(default=False)
    
    # Appearance settings
    theme = models.CharField(
        max_length=20,
        choices=[
            ('light', 'Light'),
            ('dark', 'Dark'),
            ('system', 'System')
        ],
        default='light'
    )
    compact_mode = models.BooleanField(default=False)
    
    # Profile settings
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.user.email}"

# Signal to create settings when a user is created
@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    """Create settings for new users"""
    if created:
        UserSettings.objects.get_or_create(user=instance)
