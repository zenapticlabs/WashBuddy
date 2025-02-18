from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Amenity, WashType, CarWashAmenityMapping, CarWashWashTypeMapping
from .serializers import (
    AmenitySerializer, 
    WashTypeSerializer,
    CarWashAmenityMappingSerializer,
    CarWashWashTypeMappingSerializer
)

class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get amenities sorted by usage count"""
        popular_amenities = Amenity.objects.annotate(
            usage_count=Count('car_wash_mappings')
        ).order_by('-usage_count')
        serializer = self.get_serializer(popular_amenities, many=True)
        return Response(serializer.data)

class WashTypeViewSet(viewsets.ModelViewSet):
    queryset = WashType.objects.all()
    serializer_class = WashTypeSerializer

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get wash types sorted by usage count"""
        popular_types = WashType.objects.annotate(
            usage_count=Count('car_wash_mappings')
        ).order_by('-usage_count')
        serializer = self.get_serializer(popular_types, many=True)
        return Response(serializer.data)

class CarWashAmenityMappingViewSet(viewsets.ModelViewSet):
    queryset = CarWashAmenityMapping.objects.all()
    serializer_class = CarWashAmenityMappingSerializer

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple mappings at once"""
        car_wash_id = request.data.get('car_wash_id')
        amenity_ids = request.data.get('amenity_ids', [])
        
        mappings = []
        for amenity_id in amenity_ids:
            mapping = CarWashAmenityMapping(
                car_wash_id=car_wash_id,
                amenity_id=amenity_id
            )
            mappings.append(mapping)
        
        try:
            created_mappings = CarWashAmenityMapping.objects.bulk_create(
                mappings, 
                ignore_conflicts=True
            )
            serializer = self.get_serializer(created_mappings, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class CarWashWashTypeMappingViewSet(viewsets.ModelViewSet):
    queryset = CarWashWashTypeMapping.objects.all()
    serializer_class = CarWashWashTypeMappingSerializer

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple mappings at once"""
        car_wash_id = request.data.get('car_wash_id')
        wash_type_ids = request.data.get('wash_type_ids', [])
        
        mappings = []
        for wash_type_id in wash_type_ids:
            mapping = CarWashWashTypeMapping(
                car_wash_id=car_wash_id,
                wash_type_id=wash_type_id
            )
            mappings.append(mapping)
        
        try:
            created_mappings = CarWashWashTypeMapping.objects.bulk_create(
                mappings, 
                ignore_conflicts=True
            )
            serializer = self.get_serializer(created_mappings, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )