# Generated by Django 5.1.6 on 2025-04-24 12:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('carwash', '0020_payment'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='carwash_code',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='carwash.carwashcode'),
        ),
    ]
