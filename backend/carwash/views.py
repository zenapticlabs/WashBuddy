from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CarWash, WashType, Amenity
from .serializers import CarWashListSerializer, CarWashSerializer, WashTypeSerializer, AmenitySerializer
from django.db.models import Q
from datetime import datetime
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from utilities.utils import ResponseInfo, CustomResponsePagination
from utilities.mixins import DynamicFieldsViewMixin
from .filters import DynamicSearchFilter, ListCarWashFilter
from django_filters.rest_framework import DjangoFilterBackend

class CarWashViewSet(viewsets.ModelViewSet):
    queryset = CarWash.objects.prefetch_related(
        'operating_hours',
        'images',
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
        car_wash_type = self.request.query_params.get('carWashType', '')
        distance = self.request.query_params.get('distance')

        # Filter by car wash type
        if car_wash_type:
            if car_wash_type.lower() == 'automatic':
                queryset = queryset.filter(automatic_car_wash=True)
            elif car_wash_type.lower() == 'selfservice':
                queryset = queryset.filter(self_service_car_wash=True)

        # Filter by wash types (AND logic)
        wash_type_ids = [int(id) for id in wash_types.split(',') if id.strip()]
        if wash_type_ids:
            for wash_type_id in wash_type_ids:
                queryset = queryset.filter(wash_types__id=wash_type_id)

        # Filter by amenities 
        amenity_ids = [int(id) for id in amenities.split(',') if id.strip()]
        if amenity_ids:
            for amenity_id in amenity_ids:
                queryset = queryset.filter(amenities__id=amenity_id)

        # Filter by formatted address
        if address:
            queryset = queryset.filter(formatted_address__icontains=address)

        # Filter by distance if provided
        if distance:
            try:
                distance_km = float(distance)
                # Get the user's location from the request
                user_location = self.request.user.location if hasattr(self.request.user, 'location') else None
                if user_location:
                    queryset = queryset.filter(
                        location__distance_lte=(user_location, D(km=distance_km))
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
        """Find nearest car washes within a specified distance."""
        distance = request.query_params.get('distance', 10)  # Default 10km
        limit = request.query_params.get('limit', 10)    # Default 10 results
        
        try:
            distance_km = float(distance)
            limit = int(limit)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid parameters. distance must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get the user's location from the request
        user_location = request.user.location if hasattr(request.user, 'location') else None
        if not user_location:
            return Response(
                {"error": "User location not available."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        queryset = CarWash.objects.filter(
            location__distance_lte=(user_location, D(km=distance_km))
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


class ListCarWashAPIView(DynamicFieldsViewMixin, ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = CarWashListSerializer
    pagination_class = CustomResponsePagination
    filter_backends = [DynamicSearchFilter, DjangoFilterBackend]
    filterset_class = ListCarWashFilter

    def __init__(self, **kwargs):
        """
        Constructor method for formatting web response to return.
        """
        self.pagination = False
        self.response_format = ResponseInfo().response
        super(ListCarWashAPIView, self).__init__(**kwargs)

    def paginate_queryset(self, queryset):
        """
        Method for getting paginated queryset.
        """
        pagination = self.request.GET.get("pagination", "True")
        if pagination == "True" or pagination == "true":
            return super().paginate_queryset(queryset)
        return None

    def get_queryset(self):
        queryset = CarWash.objects.all()
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def get(self, request, *args, **kwargs):
        serializer = super().list(request, *args, **kwargs)

        self.response_format["data"] = serializer.data
        self.response_format["error"] = None
        self.response_format["status_code"] = status.HTTP_200_OK
        self.response_format["message"] = ["Success"]

        return Response(self.response_format)