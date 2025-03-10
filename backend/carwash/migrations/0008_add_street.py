from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('carwash', '0007_remove_carwash_altitude_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='carwash',
            name='street',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
    ]
