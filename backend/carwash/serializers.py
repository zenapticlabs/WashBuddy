from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import CarWash, CarWashOperatingHours, CarWashImage

class CarWashOperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        exclude = ('car_wash',)

    def validate(self, data):
        if data.get('is_closed'):
            if data.get('opening_time') is not None or data.get('closing_time') is not None:
                raise ValidationError("When is_closed is True, opening_time and closing_time must be null")
        else:
            if data.get('opening_time') is None or data.get('closing_time') is None:
                raise ValidationError("When is_closed is False, opening_time and closing_time are required")
        return data

class CarWashImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashImage
        exclude = ('car_wash',)

class CarWashCreateSerializer(serializers.ModelSerializer):
    operating_hours = CarWashOperatingHoursSerializer(source='carwashoperatinghours_set', many=True)
    images = CarWashImageSerializer(source='carwashimage_set', many=True)

    class Meta:
        model = CarWash
        exclude = ('verified', 'reviews_count', 'reviews_average')

    def validate(self, data):
        open_24_hours = data.get('open_24_hours')
        operating_hours = data.get('carwashoperatinghours_set', [])

        if open_24_hours:
            # Check if all days are 24 hours
            for hours in operating_hours:
                if (hours['is_closed'] or 
                    hours['opening_time'].strftime('%H:%M') != '00:00' or 
                    hours['closing_time'].strftime('%H:%M') != '24:00'):
                    raise ValidationError(
                        "When open_24_hours is True, all days must be open 00:00-24:00"
                    )

        # Validate operating hours count and sequence
        if len(operating_hours) != 7:
            raise ValidationError("Must provide exactly 7 days of operating hours")
        
        days = sorted(hour['day_of_week'] for hour in operating_hours)
        if days != list(range(7)):
            raise ValidationError("Must provide operating hours for all days 0-6 without duplicates")

        return data

    def validate_images(self, value):
        if len(value) != 8:
            raise ValidationError("Must provide exactly 7 images")
            
        image_types = sorted(image['image_type'] for image in value)
        if image_types != list(range(8)):
            raise ValidationError("Must provide exactly one image for each type 0-7")
        
        return value

class CarWashSerializer(CarWashCreateSerializer):
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