from django.db import models
from carwash.models import CarWash

class Amenity(models.Model):
    amenity_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "amenities"

    def __str__(self):
        return self.amenity_name

class WashType(models.Model):
    wash_type_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.wash_type_name

class CarWashAmenityMapping(models.Model):
    car_wash = models.ForeignKey(
        CarWash, 
        on_delete=models.CASCADE,
        related_name='amenity_mappings'
    )
    amenity = models.ForeignKey(
        Amenity, 
        on_delete=models.CASCADE,
        related_name='car_wash_mappings'
    )

    class Meta:
        unique_together = ('car_wash', 'amenity')
        verbose_name = "Car Wash Amenity Mapping"
        verbose_name_plural = "Car Wash Amenity Mappings"

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.amenity.amenity_name}"

class CarWashWashTypeMapping(models.Model):
    car_wash = models.ForeignKey(
        CarWash, 
        on_delete=models.CASCADE,
        related_name='wash_type_mappings'
    )
    wash_type = models.ForeignKey(
        WashType, 
        on_delete=models.CASCADE,
        related_name='car_wash_mappings'
    )

    class Meta:
        unique_together = ('car_wash', 'wash_type')
        verbose_name = "Car Wash Type Mapping"
        verbose_name_plural = "Car Wash Type Mappings"

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.wash_type.wash_type_name}"