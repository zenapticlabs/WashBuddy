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

    def get_serializer_class(self):
        return CarWashSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Get filter parameters
        wash_types = self.request.query_params.get('wash_types', '')
        amenities = self.request.query_params.get('amenities', '')
        open_now = self.request.query_params.get('open_now', '')
        
        # Get address filter parameters
        city = self.request.query_params.get('city', '')
        state = self.request.query_params.get('state', '')
        state_code = self.request.query_params.get('state_code', '')
        postal_code = self.request.query_params.get('postal_code', '')
        country = self.request.query_params.get('country', '')
        country_code = self.request.query_params.get('country_code', '')
        
        # Get spatial filter parameters
        lat = self.request.query_params.get('lat', None)
        lng = self.request.query_params.get('lng', None)
        radius = self.request.query_params.get('radius', None)  # in kilometers
        
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

        # Filter by address fields
        if city:
            queryset = queryset.filter(city__icontains=city)
        if state:
            queryset = queryset.filter(state__icontains=state)
        if state_code:
            queryset = queryset.filter(state_code__iexact=state_code)
        if postal_code:
            queryset = queryset.filter(postal_code__iexact=postal_code)
        if country:
            queryset = queryset.filter(country__icontains=country)
        if country_code:
            queryset = queryset.filter(country_code__iexact=country_code)

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
            
        # Filter by location and distance if coordinates are provided
        if lat and lng:
            try:
                lat = float(lat)
                lng = float(lng)
                user_location = Point(lng, lat, srid=4326)
                
                # Annotate with distance
                queryset = queryset.annotate(
                    distance=Distance('location', user_location)
                ).order_by('distance')
                
                # Filter by radius if provided
                if radius:
                    radius_km = float(radius)
                    queryset = queryset.filter(
                        location__distance_lte=(user_location, D(km=radius_km))
                    )
            except (ValueError, TypeError):
                # Handle invalid coordinate values
                pass

        return queryset.distinct()
        
    @action(detail=False, methods=['get'])
    def nearest(self, request):
        """
        Find car washes nearest to a given location.
        
        Query parameters:
        - lat: Latitude (required)
        - lng: Longitude (required)
        - limit: Maximum number of results (optional, default 10)
        - radius: Maximum distance in kilometers (optional)
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        limit = request.query_params.get('limit', 10)
        radius = request.query_params.get('radius')
        
        try:
            limit = int(limit)
            lat = float(lat)
            lng = float(lng)
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
            
        # Create a point from the provided coordinates
        user_location = Point(lng, lat, srid=4326)
        
        # Query car washes
        queryset = CarWash.objects.filter(location__isnull=False)
        
        # Apply radius filter if provided
        if radius:
            try:
                radius_km = float(radius)
                queryset = queryset.filter(
                    location__distance_lte=(user_location, D(km=radius_km))
                )
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid radius parameter."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        # Annotate with distance and order by proximity
        queryset = queryset.annotate(
            distance=Distance('location', user_location)
        ).order_by('distance')[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def within_bounds(self, request):
        """
        Find car washes within a bounding box.
        
        Query parameters:
        - min_lat: Minimum latitude (required)
        - min_lng: Minimum longitude (required)
        - max_lat: Maximum latitude (required)
        - max_lng: Maximum longitude (required)
        """
        try:
            min_lat = float(request.query_params.get('min_lat'))
            min_lng = float(request.query_params.get('min_lng'))
            max_lat = float(request.query_params.get('max_lat'))
            max_lng = float(request.query_params.get('max_lng'))
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid parameters. All bounds must be valid coordinates."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create a bounding box polygon
        from django.contrib.gis.geos import Polygon
        bbox = Polygon.from_bbox((min_lng, min_lat, max_lng, max_lat))
        
        # Query car washes within the bounding box
        queryset = CarWash.objects.filter(location__within=bbox)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class WashTypeViewSet(viewsets.ModelViewSet):
    queryset = WashType.objects.all()
    serializer_class = WashTypeSerializer

class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer