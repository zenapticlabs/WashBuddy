from rest_framework import serializers
from rest_framework.exceptions import ValidationError
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
        extra_kwargs = {
            'verified': {'read_only': True},
            'reviews_count': {'read_only': True},
            'reviews_average': {'read_only': True}
        }

    def validate_operating_hours(self, value):
        if len(value) != 7:
            raise ValidationError("Must provide exactly 7 days of operating hours")
        days = sorted(hour['day_of_week'] for hour in value)
        if days != list(range(7)):
            raise ValidationError("Must provide operating hours for all days 0-6 without duplicates")
        
        return value

    def validate_images(self, value):
        if len(value) != 8:
            raise ValidationError("Must provide exactly 8 images")
        image_types = sorted(image['image_type'] for image in value)
        if image_types != list(range(8)):
            raise ValidationError("Must provide exactly one image for each type 0-7")
        
        return value

    def create(self, validated_data):
        operating_hours_data = validated_data.pop('carwashoperatinghours_set', [])
        images_data = validated_data.pop('carwashimage_set', [])

        car_wash = CarWash.objects.create(**validated_data)

        for hours_data in operating_hours_data:
            CarWashOperatingHours.objects.create(car_wash=car_wash, **hours_data)

        for image_data in images_data:
            CarWashImage.objects.create(car_wash=car_wash, **image_data)

        return car_wash