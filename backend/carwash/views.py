from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import CarWash, CarWashOperatingHours, CarWashImage
from .serializers import CarWashSerializer, CarWashOperatingHoursSerializer, CarWashImageSerializer

class CarWashViewSet(viewsets.ModelViewSet):
    queryset = CarWash.objects.all()
    serializer_class = CarWashSerializer

    def get_queryset(self):
        return CarWash.objects.prefetch_related('carwashoperatinghours_set', 'carwashimage_set')

class CarWashOperatingHoursViewSet(viewsets.ModelViewSet):
    queryset = CarWashOperatingHours.objects.all()
    serializer_class = CarWashOperatingHoursSerializer

class CarWashImageViewSet(viewsets.ModelViewSet):
    queryset = CarWashImage.objects.all()
    serializer_class = CarWashImageSerializer