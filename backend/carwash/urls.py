from django.urls import path, include

from .webhook import StripeWebhookView
from .views import (
    CheckPaymentStatusView, CreatePaymentIntentView, WashTypeListAPIView, AmenityListAPIView,
    CarWashCreateView, CarWashRetrieveUpdateDestroyView,
    ListCarWashAPIView, S3APIView,
    CarWashReviewCreateView, CarWashReviewRetrieveUpdateDestroyView,
    ListCarWashReviewAPIView, OfferCreateView, OfferRetrieveUpdateDestroyView, ListOfferAPIView,
    ListFreeCarWashCodeAPIView, CarWashCodeMarkAsUsedView, UserPaymentHistoryView
)

urlpatterns = [
    path("<int:id>/", CarWashRetrieveUpdateDestroyView.as_view(), name="get-patch-delete-car-wash"),
    path("create/", CarWashCreateView.as_view(), name="create-car-wash"),
    path("search/", ListCarWashAPIView.as_view(), name="list-car-wash"),
    path("amenities/", AmenityListAPIView.as_view(), name="amenity-list"),
    path("wash-types/", WashTypeListAPIView.as_view(), name="washtype-list"),

    path("get-s3-presigned-url/", S3APIView().as_view(), name="get-s3-presigned-url"),

    path("reviews/create/", CarWashReviewCreateView.as_view(), name="create-car-wash-review"),
    path("reviews/<int:id>/", CarWashReviewRetrieveUpdateDestroyView.as_view(), name="get-patch-delete-car-wash-review"),
    path("reviews/search/", ListCarWashReviewAPIView.as_view(), name="list-car-wash-review"),
    
    path('offers/search/', ListOfferAPIView.as_view(), name='offers-list'),
    path('offers/create/', OfferCreateView.as_view(), name='offers-create'),
    path('offers/<int:id>/', OfferRetrieveUpdateDestroyView.as_view(), name='offers-detail'),
    
    path('car-wash-codes/mark-used/', CarWashCodeMarkAsUsedView.as_view(), name='car-wash-codes-mark-used'),
    path('car-wash-codes/free-codes/', ListFreeCarWashCodeAPIView.as_view(), name='free-car-wash-codes-list'),

    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('payment-status/<str:payment_intent_id>/', CheckPaymentStatusView.as_view(), name='payment-status'),
    path('payments/history/', UserPaymentHistoryView.as_view(), name='user-payment-history'),
]
