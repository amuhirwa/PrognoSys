# Generated by Django 5.1.2 on 2024-11-19 10:00

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0003_resource_patientprofile_emergency_contact_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('test_results', 'New Test Results Available'), ('appointment', 'Appointment Reminder/Update'), ('critical_alert', 'Critical Patient Alert'), ('prescription', 'Prescription Update'), ('patient_update', 'Patient Information Update')], default='patient_update', max_length=50),
        ),
        migrations.AddField(
            model_name='notification',
            name='priority',
            field=models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium', max_length=20),
        ),
        migrations.AddField(
            model_name='notification',
            name='related_patient',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='authentication.patientprofile'),
        ),
    ]
