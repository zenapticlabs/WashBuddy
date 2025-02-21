from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class CarWash(models.Model):
    car_wash_name = models.CharField(max_length=255, db_index=True)
    car_wash_address = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    reviews_count = models.IntegerField(default=0)
    reviews_average = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, db_index=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=8, db_index=True)
    altitude = models.DecimalField(max_digits=10, decimal_places=8)
    automatic_car_wash = models.BooleanField()
    self_service_car_wash = models.BooleanField()
    open_24_hours = models.BooleanField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add direct relationships
    wash_types = models.ManyToManyField(
        'WashType', 
        through='CarWashWashTypeMapping',
        related_name='car_washes'
    )
    amenities = models.ManyToManyField(
        'Amenity', 
        through='AmenityCarWashMapping',
        related_name='car_washes'
    )

    def __str__(self):
        return self.car_wash_name

    class Meta:
        indexes = [
            models.Index(fields=['automatic_car_wash', 'self_service_car_wash']),
            models.Index(fields=['open_24_hours']),
        ]

class CarWashOperatingHours(models.Model):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE)
    day_of_week = models.SmallIntegerField(
        validators=[
            MinValueValidator(0, "Day must be at least 0"),
            MaxValueValidator(6, "Day must be at most 6")
        ]
    )
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
        indexes = [
            models.Index(fields=['day_of_week', 'is_closed']),
        ]

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.day_of_week}"

class CarWashImage(models.Model):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE)
    image_type = models.SmallIntegerField(
        validators=[
            MinValueValidator(0, "Image type must be at least 0"),
            MaxValueValidator(7, "Image type must be at most 7")
        ]
    )
    image_key = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.image_type}"

class WashType(models.Model):
    SUBCLASS_CHOICES = [
        ('Clean', 'Clean'),
        ('Polish', 'Polish'),
        ('Shine/Dry', 'Shine/Dry')
    ]
    CATEGORY_CHOICES = [
        ('automatic', 'Automatic Car Wash'),
        ('selfservice', 'Self Service Car Wash')
    ]
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    subclass = models.CharField(
        max_length=20,
        choices=SUBCLASS_CHOICES,
        db_index=True
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category} - {self.subclass})"

class CarWashWashTypeMapping(models.Model):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE)
    wash_type = models.ForeignKey(WashType, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('car_wash', 'wash_type')

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.wash_type.name}"

class Amenity(models.Model):
    CATEGORY_CHOICES = [
        ('automatic', 'Automatic Car Wash'),
        ('selfservice', 'Self Service Car Wash')
    ]

    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category})"

class AmenityCarWashMapping(models.Model):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE)
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('car_wash', 'amenity')

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.amenity.name}"