from django.urls import path, include
from .views import (
    WashTypeListAPIView, AmenityListAPIView,
    CarWashCreateView, CarWashRetrieveUpdateDestroyView,
    ListCarWashAPIView, S3APIView,
    CarWashReviewCreateView, CarWashReviewRetrieveUpdateDestroyView,
    ListCarWashReviewAPIView, OfferCreateView, OfferRetrieveUpdateDestroyView, ListOfferAPIView,
    CarWashCodeCreateView, CarWashCodeRetrieveUpdateDestroyView, ListCarWashCodeAPIView,
    CarWashCodeMarkAsUsedView
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
    path('car-wash-codes/search/', ListCarWashCodeAPIView.as_view(), name='car-wash-codes-list'),
    path('car-wash-codes/create/', CarWashCodeCreateView.as_view(), name='car-wash-codes-create'),
    path('car-wash-codes/<int:id>/', CarWashCodeRetrieveUpdateDestroyView.as_view(), name='car-wash-codes-detail')
]
