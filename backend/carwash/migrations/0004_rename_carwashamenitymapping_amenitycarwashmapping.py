# Generated by Django 5.1.6 on 2025-02-21 19:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('carwash', '0003_washtype_subclass'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='CarWashAmenityMapping',
            new_name='AmenityCarWashMapping',
        ),
    ]
