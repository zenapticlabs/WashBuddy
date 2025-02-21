from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import CarWash, WashType, Amenity
from .serializers import CarWashSerializer, WashTypeSerializer, AmenitySerializer, CarWashCreateSerializer

class CarWashViewSet(viewsets.ModelViewSet):
    queryset = CarWash.objects.prefetch_related(
        'carwashoperatinghours_set',
        'carwashimage_set',
        'wash_types',
        'amenities'
    ).all()

    def get_serializer_class(self):
        if self.action == 'create':
            return CarWashCreateSerializer
        return CarWashSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            return queryset.defer('created_at', 'updated_at')
        return queryset

class WashTypeViewSet(viewsets.ModelViewSet):
    queryset = WashType.objects.all()
    serializer_class = WashTypeSerializer

class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer