from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.gis.geos import Point
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import (
    CarWash, CarWashOperatingHours, CarWashImage, 
    WashType, Amenity, CarWashPackage
)
from utilities.mixins import DynamicFieldsSerializerMixin
from rest_framework_gis.fields import GeometryField
from django.db import transaction

class WashTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WashType
        exclude = ("created_at", "updated_at",)

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
        exclude = ("created_at", "updated_at",)

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

class CarWashPackageSerializer(serializers.ModelSerializer):
    wash_types = WashTypeSerializer(many=True)
    amenities = AmenitySerializer(many=True)
    class Meta:
        model = CarWashPackage
        exclude = ('car_wash',)

class CarWashSerializer(serializers.ModelSerializer):
    operating_hours = CarWashOperatingHoursSerializer(many=True)
    images = CarWashImageSerializer(many=True)
    wash_types = serializers.PrimaryKeyRelatedField(many=True, queryset=WashType.objects.all())
    amenities = serializers.PrimaryKeyRelatedField(many=True, queryset=Amenity.objects.all())
    packages = CarWashPackageSerializer(many=True)
    distance = serializers.SerializerMethodField(read_only=True)
    location = serializers.SerializerMethodField()

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

    @transaction.atomic
    def create(self, validated_data):
        operating_hours_data = validated_data.pop('operating_hours', [])
        images_data = validated_data.pop('images', [])
        wash_types = validated_data.pop('wash_types', [])
        amenities = validated_data.pop('amenities', [])
        packages_data = validated_data.pop('packages', [])

        car_wash = CarWash.objects.create(**validated_data)

        CarWashOperatingHours.objects.bulk_create([
            CarWashOperatingHours(car_wash=car_wash, **hours_data) for hours_data in operating_hours_data
        ])

        CarWashImage.objects.bulk_create([
            CarWashImage(car_wash=car_wash, **image_data) for image_data in images_data
        ])

        car_wash.wash_types.set(wash_types)
        car_wash.amenities.set(amenities)

        for package_data in packages_data:
            wash_types_for_package = package_data.pop('wash_types', [])
            amenities_for_package = package_data.pop('amenities', [])

            package = CarWashPackage.objects.create(car_wash=car_wash, **package_data)
            package.wash_types.set(wash_types_for_package)
            package.amenities.set(amenities_for_package)

        return car_wash

    @transaction.atomic
    def update(self, instance, validated_data):
        operating_hours_data = validated_data.pop('operating_hours', [])
        images_data = validated_data.pop('images', [])
        wash_types = validated_data.pop('wash_types', None)
        amenities = validated_data.pop('amenities', None)
        packages_data = validated_data.pop('packages', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if operating_hours_data:
            for hours_data in operating_hours_data:
                obj, created = CarWashOperatingHours.objects.update_or_create(
                    car_wash=instance, day_of_week=hours_data['day_of_week'], defaults=hours_data
                )

        if images_data:
            for image_data in images_data:
                obj, created = CarWashImage.objects.update_or_create(
                    car_wash=instance, image_type=image_data['image_type'], defaults=image_data
                )

        if wash_types is not None:
            instance.wash_types.set(wash_types)

        if amenities is not None:
            instance.amenities.set(amenities)

        if packages_data:
            for package_data in packages_data:
                wash_types_for_package = package_data.pop('wash_types', [])
                amenities_for_package = package_data.pop('amenities', [])

                package, created = CarWashPackage.objects.update_or_create(
                    car_wash=instance,
                    name=package_data['name'],
                    defaults=package_data
                )

                if not created:
                    package.wash_types.set(wash_types_for_package)
                    package.amenities.set(amenities_for_package)

        return instance

class CarWashTypeSerializer(serializers.ModelSerializer):    
    class Meta:
        model = WashType
        fields = "__all__"

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

class CarWashOperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        fields = '__all__'

class CarWashImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashImage
        fields = '__all__'

class CarWashListSerializer(DynamicFieldsSerializerMixin, serializers.ModelSerializer):
    wash_types = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    operating_hours = CarWashOperatingHoursSerializer(many=True)
    packages = serializers.SerializerMethodField()
    images = CarWashImageSerializer(many=True)
    distance = serializers.FloatField(read_only=True)

    class Meta:
        model = CarWash
        fields = '__all__'

    def get_wash_types(self, instance):
        return CarWashTypeSerializer(instance.wash_types, many=True, context={"car_wash": instance}).data
    
    def get_amenities(self, instance):
        return AmenitySerializer(instance.amenities, many=True, context={"car_wash": instance}).data
    
    def get_location(self, instance):
        if instance.location:
            return {
                "type": "Point",
                "coordinates": [instance.location.x, instance.location.y]
            }
        return None
    
    def get_distance(self, obj):
        return round(obj.distance, 1) if hasattr(obj, "distance") else None
    
    def get_packages(self, instance):
        from .serializers import CarWashPackageSerializer
        return CarWashPackageSerializer(instance.packages.all(), many=True).data


class CarWashOperatingHoursPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        fields = ["day_of_week", "is_closed", "opening_time", "closing_time"]
    

class CarWashPatchSerializer(serializers.ModelSerializer):
    wash_types = serializers.PrimaryKeyRelatedField(
        queryset=WashType.objects.all(), many=True, required=False
    )
    amenities = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, required=False
    )
    operating_hours = CarWashOperatingHoursPatchSerializer(many=True, required=False)
    location = GeometryField()

    class Meta:
        model = CarWash
        fields = "__all__"

    def update(self, instance, validated_data):
        self.handle_location(validated_data)
        self.handle_operating_hours(instance, validated_data)

        return super().update(instance, validated_data)
    
    def handle_location(self, validated_data):
        location = validated_data.get("location", {})
        if location:
            validated_data["location"] = Point(location.x, location.y, srid=4326)

    def handle_operating_hours(self, instance, validated_data):
        operating_hours = validated_data.pop("operating_hours", [])   
        for operating_hour_object in operating_hours:
            existing_object = instance.operating_hours.filter(day_of_week=operating_hour_object["day_of_week"])
            if not existing_object:
                CarWashOperatingHours.objects.create(
                    car_wash=instance,
                    **operating_hour_object
                )
                return
            existing_object.update(**operating_hour_object)