# filepath: /D:/K-project/projects/New folder/WashBuddy/backend/washbuddy/carwash/serializers.py
from rest_framework import serializers
from .models import CarWash, CarWashOperatingHours, CarWashImage

class CarWashSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWash
        fields = '__all__'

class CarWashOperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        fields = '__all__'

class CarWashImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashImage
        fields = '__all__'