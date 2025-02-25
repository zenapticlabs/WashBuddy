from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import CarWash, WashType, Amenity
from .serializers import CarWashSerializer, WashTypeSerializer, AmenitySerializer
from django.db.models import Q
from datetime import datetime

class CarWashViewSet(viewsets.ModelViewSet):
    queryset = CarWash.objects.prefetch_related(
        'carwashoperatinghours_set',
        'carwashimage_set',
        'wash_types',
        'amenities'
    ).all()

    def get_serializer_class(self):
        return CarWashSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Get filter parameters
        wash_types = self.request.query_params.get('wash_types', '')
        amenities = self.request.query_params.get('amenities', '')
        open_now = self.request.query_params.get('open_now', '')
        
        # Convert comma-separated strings to lists of integers
        wash_type_ids = [int(id) for id in wash_types.split(',') if id.strip()] if wash_types else []
        amenity_ids = [int(id) for id in amenities.split(',') if id.strip()] if amenities else []

        # Filter by wash types using AND logic
        if wash_type_ids:
            for wash_type_id in wash_type_ids:
                queryset = queryset.filter(wash_types__id=wash_type_id)

        # Filter by amenities using AND logic
        if amenity_ids:
            for amenity_id in amenity_ids:
                queryset = queryset.filter(amenities__id=amenity_id)

        # Filter by open now (includes current time in schedule)
        if open_now == 'true':
            now = datetime.now()
            current_day = now.weekday()  # 0 = Monday, 6 = Sunday
            current_time = now.time()

            queryset = queryset.filter(
                Q(open_24_hours=True) |
                Q(
                    carwashoperatinghours__day_of_week=current_day,
                    carwashoperatinghours__is_closed=False,
                    carwashoperatinghours__opening_time__lte=current_time,
                    carwashoperatinghours__closing_time__gte=current_time
                )
            )

        return queryset.distinct()

class WashTypeViewSet(viewsets.ModelViewSet):
    queryset = WashType.objects.all()
    serializer_class = WashTypeSerializer

class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer