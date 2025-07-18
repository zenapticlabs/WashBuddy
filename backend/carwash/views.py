import uuid
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CarWash, CarWashPackage, CarWashReview, CarWashUpdateRequest, WashType, Amenity, Offer, CarWashCode, Payment
from .serializers import CarWashListSerializer, CarWashPostPatchSerializer, CarWashReviewListSerializer, CarWashReviewPostPatchSerializer, CarWashUpdateRequestSerializer, PaymentStatusSerializer, PreSignedUrlSerializer, WashTypeSerializer, AmenitySerializer, OfferSerializer, CarWashCodeSerializer, OfferCreatePatchSerializer, CarWashCodeCreatePatchSerializer, CarWashCodeUsageCreateSerializer, CreatePaymentIntentSerializer, UserPaymentHistorySerializer
from django.db.models import Q, Count
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
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.db.models import Case, When, BooleanField, F
from django.utils import timezone
from . import utils
import stripe
from django.http import JsonResponse

stripe.api_key = settings.STRIPE_SECRET_KEY

class WashTypeListAPIView(generics.ListAPIView):
    queryset = WashType.objects.all()
    serializer_class = WashTypeSerializer

class AmenityListAPIView(generics.ListAPIView):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer


# Swagger documentation for Car Wash Create View with custom request body
@extend_schema(
    summary="Create Car Wash",
    description="Creates a new car wash entry with the provided details. Requires authentication.",
    request=CarWashPostPatchSerializer,
    responses={
        201: OpenApiResponse(description="Car wash created successfully"),
        400: OpenApiResponse(description="Invalid request data"),
        401: OpenApiResponse(description="Authentication failed")
    }
)
class CarWashCreateView(generics.CreateAPIView):
    serializer_class = CarWashPostPatchSerializer
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        data = {
            "proposed_changes": serializer.data,
            "submitted_by": self.request.user.id,
            "payment_method": self.request.data.get("payment_method", "-"),
            "payment_handle": self.request.data.get("payment_handle", "-"),
            "is_bounty_claim": self.request.data.get("is_bounty_claim", False),
            "payouts_status": "PENDING" if self.request.data.get("is_bounty_claim", False) else "NOT_APPLICABLE"
        }
        serializer = CarWashUpdateRequestSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

class CarWashRetrieveView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    lookup_field = "id"
    serializer_class = CarWashListSerializer
    queryset = CarWash.objects.all()

    @extend_schema(
        summary="Retrieve Car Wash",
        description="Retrieve a Car Wash by ID",
        responses={200: CarWashListSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class CarWashUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    serializer_class = CarWashPostPatchSerializer
    queryset = CarWash.objects.all()

    @extend_schema(
        summary="Update Car Wash",
        description="Update Car Wash details",
        request=CarWashPostPatchSerializer,
        responses={200}
    )
    @transaction.atomic
    def perform_update(self, serializer):
        try:
            is_bounty_claim = self.request.data.pop("is_bounty_claim")
        except KeyError:
            raise DRFValidationError({
                "error": "is_bounty_claim boolean is required."
            })
        try:
            payment_method = None
            payment_handle = None
            if is_bounty_claim:
                payment_method = self.request.data.pop("payment_method")
                payment_handle = self.request.data.pop("payment_handle")
        except KeyError:
            raise DRFValidationError({
                "error": "Payment method and handle are required."
            })
        except Exception as e:
            raise DRFValidationError({
                "error": f"An unexpected error occurred: {str(e)}"
            })

        data = {
            "proposed_changes": self.request.data,
            "submitted_by": self.request.user.id,
            "car_wash": serializer.instance.id,
            "payment_method": payment_method,
            "payment_handle": payment_handle,
            "is_bounty_claim": is_bounty_claim,
            "payouts_status": "PENDING" if self.request.data.get("is_bounty_claim", False) else "NOT_APPLICABLE"
        }
        serializer_data = CarWashUpdateRequestSerializer(data=data)
        if serializer_data.is_valid(raise_exception=True):
            if is_bounty_claim:
                if not serializer.instance.active_bounty:
                    raise DRFValidationError({
                        "error": "Cannot update car wash without an active bounty."
                    })
                
                # Check for overriding bounty limit
                if not self.request.user.profile.bounty_limit_override:
                    # user can sumbit one request per day
                    existing_requests = CarWashUpdateRequest.objects.filter(
                        submitted_by=self.request.user,
                        created_at__gte=timezone.now() - timezone.timedelta(days=1),
                    )
                    if existing_requests.exists():
                        raise DRFValidationError({
                            "error": "You have already submitted a request today."
                        })
            serializer_data.save()

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
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
                'code': 'WASH123',
                'offer_id': 1
            }
        )
    ]
)
class CarWashCodeMarkAsUsedView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CarWashCodeUsageCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        offer_id = serializer.validated_data.get("offer_id")
        code = CarWashCode.objects.filter(code=serializer.validated_data['code'], offer=offer_id, user__isnull=True).first()
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
            existing_usage = CarWashCode.objects.filter(offer=offer_id, user=request.user)
            if existing_usage.exists():
                return Response(
                    {"error": "You have already used this one-time offer"},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
            serializer.validated_data['user'] = request.user
            serializer.validated_data['used_at'] = datetime.now()

            serializer.validated_data['code'] = code
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response({"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)


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

class ListFreeCarWashCodeAPIView(DynamicFieldsViewMixin, ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = CarWashCodeSerializer
    pagination_class = CustomResponsePagination
    filter_backends = [DynamicSearchFilter, DjangoFilterBackend]
    filterset_class = ListCarWashCodeFilter

    def __init__(self, **kwargs):
        self.pagination = False
        self.response_format = ResponseInfo().response
        super(ListFreeCarWashCodeAPIView, self).__init__(**kwargs)

    def paginate_queryset(self, queryset):
        pagination = self.request.GET.get("pagination", "False")
        if pagination == "True" or pagination == "true":
            return super().paginate_queryset(queryset)
        return None

    def get_queryset(self):
        package_id = self.request.GET.get('package_id')
        
        # Get one-time offer codes for the specified package that haven't been used by this user
        return CarWashCode.objects.filter(
            offer__package_id=package_id,
            offer__offer_type='ONE_TIME',
            user__isnull=True
        ).distinct()

    @extend_schema(
        summary="List Free Car Wash Codes",
        description="Get available one-time offer codes for a package that haven't been used by the current user",
        parameters=[
            OpenApiParameter(
                name="Authorization",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.HEADER,
                description="JWT token for user authentication",
                required=True
            ),
            OpenApiParameter(
                name="package_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="ID of the package to get codes for",
                required=True
            ),
            OpenApiParameter(
                name="pagination",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Enable/disable pagination (default: False)",
                required=False,
                default=False
            )
        ],
        responses={
            200: CarWashCodeSerializer(many=True),
            401: OpenApiResponse(description="Authentication failed"),
            404: OpenApiResponse(description="No codes found")
        }
    )
    def get(self, request, *args, **kwargs):
        package_id = request.GET.get('package_id')
        if not package_id:
            self.response_format["data"] = None
            self.response_format["error"] = "package_id is required"
            self.response_format["status_code"] = status.HTTP_400_BAD_REQUEST
            self.response_format["message"] = ["Error"]
            return Response(self.response_format, status=status.HTTP_400_BAD_REQUEST)

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

        if not self.request.headers.get("Authorization"):
            # Return offers with codes that are not used by the user
            queryset = queryset.annotate(
                codes_count=Count('codes', filter=~Q(codes__user__isnull=False))
            ).filter(
                ~Q(codes_count=0),
                offer_type__in=['TIME_DEPENDENT', 'GEOGRAPHICAL']
            )

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
                    Q(offer_type__in=['TIME_DEPENDENT'])
                )
            else:
                queryset = queryset.filter(offer_type__in=['TIME_DEPENDENT'])

            return queryset.distinct()            
        else:
            # Filter out offers that has codes not used by the user
            queryset = queryset.annotate(
                codes_count=Count('codes', filter=~Q(codes__user__isnull=False))
            ).filter(
                ~Q(codes_count=0)
            )

            # Filter out one-time offers that have been used by the user
            queryset = queryset.exclude(
                codes__user=self.request.user,
                offer_type="ONE_TIME"
            )

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
    permission_classes = [IsAuthenticated]

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

            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(offer.offer_price * 100),
                currency='usd',
                metadata={
                    'offer_id': offer.id,
                    'user_email': request.user.email,
                    'package_id': offer.package.id,
                    'car_wash_id': offer.package.car_wash.id
                }
            )

            # Save payment information
            payment = Payment.objects.create(
                offer=offer,
                payment_intent_id=intent.id,
                amount=offer.offer_price,
                user=request.user
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
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentStatusSerializer
    lookup_field = 'payment_intent_id'
    queryset = Payment.objects.all()

    @extend_schema(
        summary="Check Payment Status",
        description="Get the current status of a payment using payment_intent_id",
        parameters=[
            OpenApiParameter(
                name="Authorization",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.HEADER,
                description="JWT token for user authentication",
                required=True
            ),
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
        payment = self.get_queryset().filter(payment_intent_id=kwargs['payment_intent_id'], user=request.user).first()
        if not payment:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        
        return super().get(request, *args, **kwargs)

class UserPaymentHistoryView(DynamicFieldsViewMixin, ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserPaymentHistorySerializer
    pagination_class = CustomResponsePagination

    def __init__(self, **kwargs):
        """
        Constructor method for formatting web response to return.
        """
        self.pagination = False
        self.response_format = ResponseInfo().response
        super(UserPaymentHistoryView, self).__init__(**kwargs)

    def paginate_queryset(self, queryset):
        """
        Method for getting paginated queryset.
        """
        pagination = self.request.GET.get("pagination", "False")
        if pagination == "True" or pagination == "true":
            return super().paginate_queryset(queryset)
        return None

    def get_queryset(self):
        return Payment.objects.filter(
            user=self.request.user
        ).order_by('-created_at').select_related(
            'offer',
            'offer__package',
            'offer__package__car_wash',
            'carwash_code'
        )
    
    @extend_schema(
        summary="Get User Payment History",
        description="Get the payment history for the authenticated user",
        parameters=[
            OpenApiParameter(
                name="Authorization",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.HEADER,
                description="JWT token for user authentication",
                required=True
            ),
            OpenApiParameter(
                name="pagination",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Enable/disable pagination (default: False)",
                required=False,
                default=False
            )
        ],
        responses={
            200: OpenApiResponse(response=UserPaymentHistorySerializer(many=True)),
            401: OpenApiResponse(description="Authentication failed")
        }
    )
    def get(self, request, *args, **kwargs):
        serializer = super().list(request, *args, **kwargs)

        self.response_format["data"] = serializer.data
        self.response_format["error"] = None
        self.response_format["status_code"] = status.HTTP_200_OK
        self.response_format["message"] = ["Success"]

        return Response(self.response_format)

def get_packages(request):
    car_wash_id = request.GET.get('car_wash')
    packages = CarWashPackage.objects.filter(car_wash_id=car_wash_id).values('id', 'name')
    return JsonResponse(list(packages), safe=False)