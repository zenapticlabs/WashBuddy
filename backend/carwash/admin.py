from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CarWash, CarWashOperatingHours, CarWashImage

@admin.register(CarWash)
class CarWashAdmin(ModelAdmin):
    pass