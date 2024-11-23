# Generated by Django 5.1.2 on 2024-11-23 12:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0007_doctorprofile_license_number_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prediction',
            name='test_result',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='authentication.testresult'),
        ),
    ]
