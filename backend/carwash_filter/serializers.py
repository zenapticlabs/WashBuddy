from rest_framework import serializers
from .models import Amenity, WashType, CarWashAmenityMapping, CarWashWashTypeMapping

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

class WashTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WashType
        fields = '__all__'

class CarWashAmenityMappingSerializer(serializers.ModelSerializer):
    amenity_name = serializers.CharField(source='amenity.amenity_name', read_only=True)
    car_wash_name = serializers.CharField(source='car_wash.car_wash_name', read_only=True)

    class Meta:
        model = CarWashAmenityMapping
        fields = ['id', 'car_wash', 'amenity', 'car_wash_name', 'amenity_name']

class CarWashWashTypeMappingSerializer(serializers.ModelSerializer):
    wash_type_name = serializers.CharField(source='wash_type.wash_type_name', read_only=True)
    car_wash_name = serializers.CharField(source='car_wash.car_wash_name', read_only=True)

    class Meta:
        model = CarWashWashTypeMapping
        fields = ['id', 'car_wash', 'wash_type', 'car_wash_name', 'wash_type_name'] 