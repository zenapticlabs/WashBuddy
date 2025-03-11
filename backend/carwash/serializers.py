from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.gis.geos import Point
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import (
    CarWash, CarWashOperatingHours, CarWashImage, 
    WashType, Amenity
)
from utilities.mixins import DynamicFieldsSerializerMixin

class WashTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WashType
        fields = '__all__'

    def validate_category(self, value):
        if value not in ['automatic', 'selfservice']:
            raise ValidationError("Category must be either 'automatic' or 'selfservice'")
        return value

    def validate_subclass(self, value):
        if value not in ['Clean', 'Polish', 'Shine/Dry']:
            raise ValidationError("Subclass must be one of: Clean, Polish, Shine/Dry")
        return value

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

    def validate_category(self, value):
        if value not in ['automatic', 'selfservice']:
            raise ValidationError("Category must be either 'automatic' or 'selfservice'")
        return value

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

class CarWashSerializer(serializers.ModelSerializer):
    operating_hours = CarWashOperatingHoursSerializer(source='operating_hours', many=True)
    images = CarWashImageSerializer(source='images', many=True)
    wash_types = serializers.PrimaryKeyRelatedField(many=True, queryset=WashType.objects.all())
    amenities = serializers.PrimaryKeyRelatedField(many=True, queryset=Amenity.objects.all())
    distance = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CarWash
        fields = '__all__'

    def get_distance(self, obj):
        if hasattr(obj, 'distance'):
            return round(obj.distance.m / 1000, 2)
        return None

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        
        # Convert GeoJSON to Point
        location_json = data.get('location')
        if location_json and isinstance(location_json, dict):
            try:
                longitude, latitude = location_json['coordinates']
                internal_value['location'] = Point(longitude, latitude, srid=4326)
            except (KeyError, ValueError, TypeError):
                raise serializers.ValidationError({
                    'location': 'Invalid GeoJSON Point format'
                })
                
        return internal_value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Convert Point to GeoJSON
        if instance.location:
            representation['location'] = {
                'type': 'Point',
                'coordinates': [instance.location.x, instance.location.y]
            }
        return representation

    def validate(self, data):
        open_24_hours = data.get('open_24_hours')
        operating_hours = data.get('operating_hours', [])

        if open_24_hours:
            for hours in operating_hours:
                if (hours['is_closed'] or 
                    hours['opening_time'].strftime('%H:%M') != '00:00' or 
                    hours['closing_time'].strftime('%H:%M') != '23:59'):
                    raise ValidationError(
                        "When open_24_hours is True, all days must be open 00:00-23:59"
                    )

        if len(operating_hours) != 7:
            raise ValidationError("Must provide exactly 7 days of operating hours")
        
        days = sorted(hour['day_of_week'] for hour in operating_hours)
        if days != list(range(7)):
            raise ValidationError("Must provide operating hours for all days 0-6 without duplicates")

        return data

    def validate_images(self, value):
        if len(value) != 8:
            raise ValidationError("Must provide exactly 8 images")
            
        image_types = sorted(image['image_type'] for image in value)
        if image_types != list(range(8)):
            raise ValidationError("Must provide exactly one image for each type 0-7")
        
        return value

    def create(self, validated_data):
        operating_hours_data = validated_data.pop('operating_hours', [])
        images_data = validated_data.pop('images', [])
        wash_types = validated_data.pop('wash_types', [])
        amenities = validated_data.pop('amenities', [])

        car_wash = CarWash.objects.create(**validated_data)
        
        for hours_data in operating_hours_data:
            CarWashOperatingHours.objects.create(car_wash=car_wash, **hours_data)

        for image_data in images_data:
            CarWashImage.objects.create(car_wash=car_wash, **image_data)

        if wash_types:
            car_wash.wash_types.set(wash_types)
        if amenities:
            car_wash.amenities.set(amenities)

        return car_wash
        
    def update(self, instance, validated_data):
        operating_hours_data = validated_data.pop('operating_hours', [])
        images_data = validated_data.pop('images', [])
        wash_types = validated_data.pop('wash_types', None)
        amenities = validated_data.pop('amenities', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if operating_hours_data:
            instance.operating_hours.all().delete()
            for hours_data in operating_hours_data:
                CarWashOperatingHours.objects.create(car_wash=instance, **hours_data)
                
        if images_data:
            instance.images.all().delete()
            for image_data in images_data:
                CarWashImage.objects.create(car_wash=instance, **image_data)
                
        if wash_types is not None:
            instance.wash_types.set(wash_types)
            
        if amenities is not None:
            instance.amenities.set(amenities)
            
        return instance
    

class CarWashTypeSerializer(serializers.ModelSerializer):
    price_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = WashType
        fields = "__all__"

    def get_price_rate(self, instance):
        car_wash = self.context.get("car_wash")
        if car_wash:
            mapping = instance.car_wash_mapping.filter(car_wash=car_wash).first()
            return mapping.price_rate if mapping else 0
        return 0

class AmenitySerializer(serializers.ModelSerializer):
    price_rate = serializers.SerializerMethodField()

    class Meta:
        model = Amenity
        fields = "__all__"

    def get_price_rate(self, instance):
        car_wash = self.context.get("car_wash")
        if car_wash:
            mapping = instance.car_wash_mapping.filter(car_wash=car_wash).first()
            return mapping.price_rate if mapping else 0
        return 0

class CarWashOperatingHoursSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CarWashOperatingHours
        fields = "__all__"

class CarWashImageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CarWashImage
        fields = "__all__"

class CarWashListSerializer(DynamicFieldsSerializerMixin, serializers.ModelSerializer):
    wash_types = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    operating_hours = CarWashOperatingHoursSerializer(many=True)
    images = CarWashImageSerializer(many=True)

    class Meta:
        model = CarWash
        fields = "__all__"

    def get_wash_types(self, instance):
        return CarWashTypeSerializer(instance.wash_types, many=True, context={"car_wash": instance}).data
    
    def get_amenities(self, instance):
        return AmenitySerializer(instance.amenities, many=True, context={"car_wash": instance}).data