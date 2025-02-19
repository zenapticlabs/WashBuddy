# filepath: /D:/K-project/projects/New folder/WashBuddy/backend/washbuddy/carwash/serializers.py
from rest_framework import serializers
from .models import CarWash, CarWashOperatingHours, CarWashImage

class CarWashOperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        exclude = ('car_wash',)

class CarWashImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashImage
        exclude = ('car_wash',)

class CarWashSerializer(serializers.ModelSerializer):
    operating_hours = CarWashOperatingHoursSerializer(many=True)
    images = CarWashImageSerializer(many=True)

    class Meta:
        model = CarWash
        fields = '__all__'

    def create(self, validated_data):
        operating_hours_data = validated_data.pop('operating_hours')
        images_data = validated_data.pop('images')

        # Create CarWash instance
        car_wash = CarWash.objects.create(**validated_data)

        # Create Operating Hours
        for hours_data in operating_hours_data:
            CarWashOperatingHours.objects.create(car_wash=car_wash, **hours_data)

        # Create Images
        for image_data in images_data:
            CarWashImage.objects.create(car_wash=car_wash, **image_data)

        return car_wash

    def update(self, instance, validated_data):
        operating_hours_data = validated_data.pop('operating_hours', [])
        images_data = validated_data.pop('images', [])

        # Update CarWash fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Operating Hours
        instance.carwashoperatinghours_set.all().delete()
        for hours_data in operating_hours_data:
            CarWashOperatingHours.objects.create(car_wash=instance, **hours_data)

        # Update Images
        instance.carwashimage_set.all().delete()
        for image_data in images_data:
            CarWashImage.objects.create(car_wash=instance, **image_data)

        return instance