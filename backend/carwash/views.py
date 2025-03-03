from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CarWash, WashType, Amenity
from .serializers import CarWashSerializer, WashTypeSerializer, AmenitySerializer
from django.db.models import Q
from datetime import datetime
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D

class CarWashViewSet(viewsets.ModelViewSet):
    queryset = CarWash.objects.prefetch_related(
        'carwashoperatinghours_set',
        'carwashimage_set',
        'wash_types',
        'amenities'
    ).all()
    serializer_class = CarWashSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Get filter parameters
        wash_types = self.request.query_params.get('wash_types', '')
        amenities = self.request.query_params.get('amenities', '')
        address = self.request.query_params.get('address', '')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius')  # in kilometers
        
        # Filter by wash types (AND logic)
        wash_type_ids = [int(id) for id in wash_types.split(',') if id.strip()]
        if wash_type_ids:
            for wash_type_id in wash_type_ids:
                queryset = queryset.filter(wash_types__id=wash_type_id)

        # Filter by amenities (AND logic)
        amenity_ids = [int(id) for id in amenities.split(',') if id.strip()]
        if amenity_ids:
            for amenity_id in amenity_ids:
                queryset = queryset.filter(amenities__id=amenity_id)

        # Filter by formatted address
        if address:
            queryset = queryset.filter(formatted_address__icontains=address)

        # Filter by distance if coordinates and radius provided
        if lat and lng and radius:
            try:
                lat = float(lat)
                lng = float(lng)
                radius_km = float(radius)
                user_location = Point(lng, lat, srid=4326)
                
                queryset = queryset.filter(
                    location__distance_lte=(user_location, D(km=radius_km))
                ).annotate(
                    distance=Distance('location', user_location)
                ).order_by('distance')
            except (ValueError, TypeError):
                pass

        return queryset.distinct()

    def create(self, request, *args, **kwargs):
        # Validate required fields
        required_fields = [
            'car_wash_name', 
            'car_wash_address',
            'phone',
            'location',
            'operating_hours',
            'images'
        ]
        
        for field in required_fields:
            if field not in request.data:
                return Response(
                    {f"error": f"Missing required field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Validate operating hours
        operating_hours = request.data.get('operating_hours', [])
        if len(operating_hours) != 7:
            return Response(
                {"error": "Must provide operating hours for all 7 days"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate images
        images = request.data.get('images', [])
        if len(images) != 8:
            return Response(
                {"error": "Must provide exactly 8 images (types 0-7)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        image_types = sorted(image['image_type'] for image in images)
        if image_types != list(range(8)):
            return Response(
                {"error": "Must provide exactly one image for each type 0-7"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate location
        location = request.data.get('location', {})
        if not location or 'coordinates' not in location:
            return Response(
                {"error": "Invalid location format"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def nearest(self, request):
        """Find nearest car washes to a given location."""
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 10)  # Default 10km
        limit = request.query_params.get('limit', 10)    # Default 10 results
        
        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
            limit = int(limit)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid parameters. lat and lng must be valid coordinates."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not lat or not lng:
            return Response(
                {"error": "Both lat and lng parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user_location = Point(lng, lat, srid=4326)
        queryset = CarWash.objects.filter(
            location__distance_lte=(user_location, D(km=radius))
        ).annotate(
            distance=Distance('location', user_location)
        ).order_by('distance')[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class WashTypeViewSet(viewsets.ModelViewSet):
    queryset = WashType.objects.all()
    serializer_class = WashTypeSerializer

class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer