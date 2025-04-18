import uuid
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CarWash, CarWashReview, WashType, Amenity, Offer, CarWashCode
from .serializers import CarWashListSerializer, CarWashPostPatchSerializer, CarWashReviewListSerializer, CarWashReviewPostPatchSerializer, PreSignedUrlSerializer, WashTypeSerializer, AmenitySerializer, OfferSerializer, CarWashCodeSerializer, OfferCreatePatchSerializer, CarWashCodeCreatePatchSerializer, CarWashCodeUsageCreateSerializer
from django.db.models import Q
from datetime import datetime
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from utilities.utils import ResponseInfo, CustomResponsePagination, SupabaseSingleton
from utilities.mixins import DynamicFieldsViewMixin
from .filters import DynamicSearchFilter, ListCarWashFilter, ListCarWashReviewFilter, ListCarWashCodeFilter, ListOfferFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.functions import Coalesce
from django.db.models import FloatField, Value
from django.db import transaction
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Case, When, BooleanField, F
from django.utils import timezone
from . import utils

class WashTypeListAPIView(generics.ListAPIView):
    queryset = WashType.objects.all()
    serializer_class = WashTypeSerializer

class AmenityListAPIView(generics.ListAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer


class CarWashCreateView(generics.CreateAPIView):
    serializer_class = CarWashPostPatchSerializer
    permission_classes = [AllowAny] 

class CarWashRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CarWash.objects.all()
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method == "GET":
            return CarWashListSerializer
        return CarWashPostPatchSerializer

    @extend_schema(
        summary="Retrieve Car Wash",
        description="Retrieve a Car Wash by ID",
        responses={200: CarWashListSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update Car Wash",
        description="Update Car Wash details using PATCH",
        request=CarWashPostPatchSerializer,
        responses={200: CarWashListSerializer}
    )
    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class ListCarWashAPIView(DynamicFieldsViewMixin, ListAPIView):
    queryset = CarWash.active_objects.all().distinct()
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
        queryset = super().get_queryset()
        user_lat = self.request.GET.get("userLat")
        user_lng = self.request.GET.get("userLng")

        if user_lat and user_lng:
            reference_point = Point(float(user_lng), float(user_lat), srid=4326)
            queryset = queryset.annotate(
                distance=Coalesce(
                    Distance("location", reference_point, output_field=FloatField()) * Value(0.000621371, output_field=FloatField()),
                    Value(0, output_field=FloatField())
                )
            )
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
    

class S3APIView(APIView):
    permission_classes = (AllowAny, )

    def __init__(self, **kwargs):
        """
        Constructor method for formatting web response to return.
        """
        self.pagination = False
        self.response_format = ResponseInfo().response
        super(S3APIView, self).__init__(**kwargs)

    @extend_schema(
        summary="Get Pre Signed Url",
        description="Get Pre Signed Url to upload files to s3 bucket",
        request=PreSignedUrlSerializer,
        responses={200}
    )
    def post(self, request):
        try:
            serializer = PreSignedUrlSerializer(data=request.data)

            if serializer.is_valid(raise_exception=True):
                filename = serializer.validated_data.get('filename')
            
                unique_filename = f"{uuid.uuid4()}-{filename}"
                file_path = f"carwash-image-uploads/{unique_filename}"

                supabase_client = SupabaseSingleton.get_instance(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

                signed_url_object = supabase_client.storage.from_(settings.S3_BUCKET_NAME).create_signed_upload_url(file_path)
                self.response_format["data"] = {
                    "signed_url_object": signed_url_object,
                }

                return Response(self.response_format)
        except Exception as e:
            print("Error in fetching pre signed url ", e)
            self.response_format["error"] = str(e)
            self.response_format["message"] = "Could not fetch presigned url"
            self.response_format["status_code"] = status.HTTP_400_BAD_REQUEST
            return Response(self.response_format, status=status.HTTP_400_BAD_REQUEST)

class CarWashReviewCreateView(generics.CreateAPIView):
    serializer_class = CarWashReviewPostPatchSerializer
    permission_classes = [AllowAny] 

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"authorization_header": self.request.headers.get("Authorization")})
        return context 

class CarWashReviewRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CarWashReview.objects.all()
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method == "GET":
            return CarWashReviewListSerializer
        return CarWashReviewPostPatchSerializer

    @extend_schema(
        summary="Retrieve Car Wash Review",
        description="Retrieve a Car Wash Review by ID",
        responses={200: CarWashReviewListSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update Car Wash Review",
        description="Update Car Wash Review",
        request=CarWashReviewPostPatchSerializer,
        responses={200: CarWashReviewListSerializer}
    )
    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class ListCarWashReviewAPIView(DynamicFieldsViewMixin, ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = CarWashReviewListSerializer
    pagination_class = CustomResponsePagination
    filter_backends = [DynamicSearchFilter, DjangoFilterBackend]
    filterset_class = ListCarWashReviewFilter

    def __init__(self, **kwargs):
        """
        Constructor method for formatting web response to return.
        """
        self.pagination = False
        self.response_format = ResponseInfo().response
        super(ListCarWashReviewAPIView, self).__init__(**kwargs)

    def paginate_queryset(self, queryset):
        """
        Method for getting paginated queryset.
        """
        pagination = self.request.GET.get("pagination", "True")
        if pagination == "True" or pagination == "true":
            return super().paginate_queryset(queryset)
        return None

    def get_queryset(self):
        queryset = CarWashReview.objects.all()
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

class OfferCreateView(generics.CreateAPIView):
    serializer_class = OfferCreatePatchSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': str(e.message_dict) if hasattr(e, 'message_dict') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class OfferRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Offer.objects.all()
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method == "GET":
            return OfferSerializer
        return OfferCreatePatchSerializer

    @extend_schema(
        summary="Retrieve Offer",
        description="Retrieve an Offer by ID",
        responses={200: OfferSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update Offer",
        description="Update Offer details",
        request=OfferCreatePatchSerializer,
        responses={200: OfferSerializer}
    )
    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class CarWashCodeCreateView(generics.CreateAPIView):
    serializer_class = CarWashCodeCreatePatchSerializer
    permission_classes = [AllowAny]

class CarWashCodeMarkAsUsedView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CarWashCodeUsageCreateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"authorization_header": self.request.headers.get("Authorization")})
        return context
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = CarWashCode.objects.filter(code=serializer.validated_data['code']).first()
        if not code:
            return Response({"error": "Invalid code"}, status=status.HTTP_404_NOT_FOUND)
            
        # Validate offer based on type
        offer = code.offer
        now = timezone.now()
        
        if offer.offer_type == 'TIME_DEPENDENT':
            if not (offer.start_time <= now.time() <= offer.end_time):
                return Response(
                    {"error": "This offer is only valid between {} and {}".format(
                        offer.start_time.strftime('%H:%M'), 
                        offer.end_time.strftime('%H:%M')
                    )},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        elif offer.offer_type == 'GEOGRAPHICAL':
            user_location = request.data.get('location')
            if not user_location:
                return Response(
                    {"error": "Location is required for geographical offers"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            try:
                user_point = Point(float(user_location['lng']), float(user_location['lat']), srid=4326)
                distance = user_point.distance(offer.package.car_wash.location) * 100  # Convert to km
                
                if float(distance) > float(offer.radius_miles) * 1.60934:  # Convert miles to km
                    return Response(
                        {"error": "You are outside the offer's geographical range"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (KeyError, ValueError):
                return Response(
                    {"error": "Invalid location format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        elif offer.offer_type == 'ONE_TIME':
            user_metadata = utils.handle_user_meta_data(request.headers.get("Authorization"))
            if user_metadata and code.usages.filter(user_metadata__email=user_metadata['email']).exists():
                return Response(
                    {"error": "You have already used this one-time offer"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CarWashCodeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CarWashCode.objects.all().prefetch_related('usages', 'offer__package__car_wash')
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method == "GET":
            return CarWashCodeSerializer
        return CarWashCodeCreatePatchSerializer

    @extend_schema(
        summary="Retrieve Car Wash Code",
        description="Retrieve a Car Wash Code by ID",
        responses={200: CarWashCodeSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update Car Wash Code",
        description="Update Car Wash Code details",
        request=CarWashCodeCreatePatchSerializer,
        responses={200: CarWashCodeSerializer}
    )
    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

class ListCarWashCodeAPIView(DynamicFieldsViewMixin, ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = CarWashCodeSerializer
    pagination_class = CustomResponsePagination
    filter_backends = [DynamicSearchFilter, DjangoFilterBackend]
    filterset_class = ListCarWashCodeFilter

    def __init__(self, **kwargs):
        """
        Constructor method for formatting web response to return.
        """
        self.pagination = False
        self.response_format = ResponseInfo().response
        super(ListCarWashCodeAPIView, self).__init__(**kwargs)

    def paginate_queryset(self, queryset):
        """
        Method for getting paginated queryset.
        """
        pagination = self.request.GET.get("pagination", "True")
        if pagination == "True" or pagination == "true":
            return super().paginate_queryset(queryset)
        return None

    def get_queryset(self):
        queryset = CarWashCode.objects.all()
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

class ListOfferAPIView(DynamicFieldsViewMixin, ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = OfferSerializer
    pagination_class = CustomResponsePagination
    filter_backends = [DynamicSearchFilter, DjangoFilterBackend]
    filterset_class = ListOfferFilter

    def __init__(self, **kwargs):
        """
        Constructor method for formatting web response to return.
        """
        self.pagination = False
        self.response_format = ResponseInfo().response
        super(ListOfferAPIView, self).__init__(**kwargs)

    def paginate_queryset(self, queryset):
        """
        Method for getting paginated queryset.
        """
        pagination = self.request.GET.get("pagination", "True")
        if pagination == "True" or pagination == "true":
            return super().paginate_queryset(queryset)
        return None

    def get_queryset(self):
        queryset = Offer.objects.all()
        now = timezone.now().time()
        
         # Handle time dependent offers
        queryset = queryset.annotate(
            is_time_valid=Case(
                When(offer_type='TIME_DEPENDENT', 
                     start_time__lte=now, 
                     end_time__gte=now, 
                     then=Value(True)),
                When(offer_type='TIME_DEPENDENT', 
                     then=Value(False)),
                default=Value(True),
                output_field=BooleanField()
            )
        ).filter(is_time_valid=True)
        
        # Handle geographical offers
        user_lat = self.request.GET.get("userLat")
        user_lng = self.request.GET.get("userLng")
        if user_lat and user_lng:
            user_location = Point(float(user_lng), float(user_lat), srid=4326)
            queryset = queryset.annotate(
                distance=Distance('package__car_wash__location', user_location)
            ).filter(
                Q(offer_type='GEOGRAPHICAL', distance__lte=F('radius_miles') * 1609.34) |  # Convert miles to meters
                Q(offer_type__in=['TIME_DEPENDENT', 'ONE_TIME'])
            )
        else:
            queryset = queryset.filter(offer_type__in=['TIME_DEPENDENT', 'ONE_TIME'])
        
        # Handle one-time offers (filter out used offers for current user)
        user_metadata = utils.handle_user_meta_data(self.request.headers.get("Authorization"))
        if user_metadata:
            queryset = queryset.exclude(
                Q(offer_type='ONE_TIME') & 
                Q(codes__usages__user_metadata__email=user_metadata['email'])
            )
        
        return queryset.distinct()

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