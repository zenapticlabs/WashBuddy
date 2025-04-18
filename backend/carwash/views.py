import uuid
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CarWash, CarWashReview, WashType, Amenity
from .serializers import CarWashListSerializer, CarWashPostPatchSerializer, CarWashReviewListSerializer, CarWashReviewPostPatchSerializer, PreSignedUrlSerializer, WashTypeSerializer, AmenitySerializer
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
from .filters import DynamicSearchFilter, ListCarWashFilter, ListCarWashReviewFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.functions import Coalesce
from django.db.models import FloatField, Value
from django.db import transaction
from django.conf import settings

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