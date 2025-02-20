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
    operating_hours = CarWashOperatingHoursSerializer(source='carwashoperatinghours_set', many=True)
    images = CarWashImageSerializer(source='carwashimage_set', many=True)

    class Meta:
        model = CarWash
        fields = '__all__'

    def create(self, validated_data):
        operating_hours_data = validated_data.pop('carwashoperatinghours_set', [])
        images_data = validated_data.pop('carwashimage_set', [])

        car_wash = CarWash.objects.create(**validated_data)

        for hours_data in operating_hours_data:
            CarWashOperatingHours.objects.create(car_wash=car_wash, **hours_data)

        for image_data in images_data:
            CarWashImage.objects.create(car_wash=car_wash, **image_data)

        return car_wash