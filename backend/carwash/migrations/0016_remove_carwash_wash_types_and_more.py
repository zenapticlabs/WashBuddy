# Generated by Django 5.1.6 on 2025-04-02 17:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('carwash', '0015_carwashreview_carwashreviewimage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='carwash',
            name='wash_types',
        ),
        migrations.RemoveField(
            model_name='carwashpackage',
            name='amenities',
        ),
        migrations.DeleteModel(
            name='CarWashWashTypeMapping',
        ),
    ]
