from django.db import models

class CarWash(models.Model):
    car_wash_name = models.CharField(max_length=255)
    car_wash_address = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    reviews_count = models.IntegerField()
    reviews_average = models.DecimalField(max_digits=3, decimal_places=2)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=10, decimal_places=8)
    altitude = models.DecimalField(max_digits=10, decimal_places=8)
    automatic_car_wash = models.BooleanField()
    self_service_car_wash = models.BooleanField()
    open_24_hours = models.BooleanField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.car_wash_name

class CarWashOperatingHours(models.Model):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE)
    day_of_week = models.SmallIntegerField()
    is_closed = models.BooleanField(default=False)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)

    class Meta:
        unique_together = ('car_wash', 'day_of_week')
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(is_closed=True, opening_time__isnull=True, closing_time__isnull=True) |
                    models.Q(is_closed=False, opening_time__isnull=False, closing_time__isnull=False)
                ),
                name='check_opening_closing_times'
            )
        ]

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.day_of_week}"

class CarWashImage(models.Model):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE)
    image_type = models.CharField(max_length=255)
    image_key = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.image_type}"