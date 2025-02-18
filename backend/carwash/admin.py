from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CarWash, CarWashOperatingHours, CarWashImage

@admin.register(CarWash)
class CarWashAdmin(ModelAdmin):
    pass

@admin.register(CarWashOperatingHours)
class CarWashOperatingHoursAdmin(ModelAdmin):
    pass

@admin.register(CarWashImage)
class CarWashImageAdmin(ModelAdmin):
    pass