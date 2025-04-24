import uuid
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CarWash, CarWashReview, WashType, Amenity, Offer, CarWashCode, Payment
from .serializers import CarWashListSerializer, CarWashPostPatchSerializer, CarWashReviewListSerializer, CarWashReviewPostPatchSerializer, PaymentStatusSerializer, PreSignedUrlSerializer, WashTypeSerializer, AmenitySerializer, OfferSerializer, CarWashCodeSerializer, OfferCreatePatchSerializer, CarWashCodeCreatePatchSerializer, CarWashCodeUsageCreateSerializer, CreatePaymentIntentSerializer
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
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

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

@extend_schema(
    summary="Mark Car Wash Code as Used",
    description="Validates and marks a car wash code as used, checking usage restrictions",
    request=CarWashCodeUsageCreateSerializer,
    parameters=[
        OpenApiParameter(
            name="Authorization",
            type=str,
            location=OpenApiParameter.HEADER,
            description="JWT token for user authentication",
            required=True
        )
    ],
    responses={
        201: OpenApiResponse(response=CarWashCodeUsageCreateSerializer),
        400: OpenApiResponse(response=OpenApiTypes.OBJECT),
        404: OpenApiResponse(response=OpenApiTypes.OBJECT)
    },
    examples=[
        OpenApiExample(
            'One-Time Offer Example',
            value={
                'code': 'WASH123'
            }
        )
    ]
)
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
        
        if offer.offer_type in ['TIME_DEPENDENT', 'GEOGRAPHICAL']:
            return Response(
                {"error": "Cannot use this code from here"},
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
    
    @extend_schema(
        summary="List Car Wash Codes",
        description="Get a list of car wash codes with optional filtering",
        parameters=[
            OpenApiParameter(
                name="code",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by code value",
                required=False
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by code status (active/inactive)",
                required=False,
                enum=['active', 'inactive']
            ),
            OpenApiParameter(
                name="offer_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter by associated offer ID",
                required=False
            ),
            OpenApiParameter(
                name="pagination",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Enable/disable pagination (default: True)",
                required=False,
                default=True
            ),
            OpenApiParameter(
                name="fields",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Comma-separated list of fields to include in the response",
                required=False
            )
        ],
        responses={200: CarWashCodeSerializer}
    )
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
        pagination = self.request.GET.get("pagination", "False")
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

    @extend_schema(
        summary="List Offers",
        description="Get a list of available offers with optional filtering",
        parameters=[
            OpenApiParameter(
                name="userLat",
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
                description="User's latitude coordinate for geographical offers",
                required=False
            ),
            OpenApiParameter(
                name="userLng", 
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
                description="User's longitude coordinate for geographical offers",
                required=False
            ),
            OpenApiParameter(
                name="pagination",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Enable/disable pagination (default: True)",
                required=False,
                default=True
            ),
            OpenApiParameter(
                name="fields",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Comma-separated list of fields to include in the response",
                required=False
            )
        ],
        responses={200: OfferSerializer}
    )
    def get(self, request, *args, **kwargs):
        serializer = super().list(request, *args, **kwargs)

        self.response_format["data"] = serializer.data
        self.response_format["error"] = None
        self.response_format["status_code"] = status.HTTP_200_OK
        self.response_format["message"] = ["Success"]

        return Response(self.response_format)
    

class CreatePaymentIntentView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Create Payment Intent",
        description="Creates a Stripe payment intent for an offer",
        request=CreatePaymentIntentSerializer,
        responses={
            200: OpenApiResponse(description="Payment intent created successfully"),
            400: OpenApiResponse(description="Invalid request"),
            404: OpenApiResponse(description="Offer not found")
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = CreatePaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            offer = Offer.objects.get(id=serializer.validated_data['offer_id'])
            user_metadata = utils.handle_user_meta_data(request.headers.get("Authorization"))
            
            if not user_metadata or not user_metadata.get('email'):
                return Response(
                    {'error': 'User email is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(offer.offer_price * 100),
                currency='usd',
                metadata={
                    'offer_id': offer.id,
                    'user_email': user_metadata['email'],
                    'package_id': offer.package.id,
                    'car_wash_id': offer.package.car_wash.id
                }
            )

            # Save payment information
            payment = Payment.objects.create(
                offer=offer,
                payment_intent_id=intent.id,
                amount=offer.offer_price,
                user_email=user_metadata['email'],
                metadata={
                    'package_id': offer.package.id,
                    'car_wash_id': offer.package.car_wash.id,
                    'user_metadata': user_metadata
                }
            )

            return Response({
                'clientSecret': intent.client_secret,
                'payment_id': payment.id
            })

        except Offer.DoesNotExist:
            return Response(
                {'error': 'Offer not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except stripe.error.StripeError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
class CheckPaymentStatusView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PaymentStatusSerializer
    lookup_field = 'payment_intent_id'
    queryset = Payment.objects.all()

    @extend_schema(
        summary="Check Payment Status",
        description="Get the current status of a payment using payment_intent_id",
        parameters=[
            OpenApiParameter(
                name="payment_intent_id",
                location=OpenApiParameter.PATH,
                description="Stripe Payment Intent ID",
                required=True,
                type=str
            )
        ],
        responses={
            200: PaymentStatusSerializer,
            404: OpenApiResponse(description="Payment not found")
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)