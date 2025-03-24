from django.urls import path, include
from .views import CarWashRetrieveUpdateDestroyView, ListCarWashAPIView, WashTypeListAPIView, AmenityListAPIView, CarWashCreateView
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path("<int:id>/", CarWashRetrieveUpdateDestroyView.as_view(), name="get-patch-delete-car-wash"),
    path("create/", CarWashCreateView.as_view(), name="create-car-wash"),
    path("search/", ListCarWashAPIView.as_view(), name="list-car-wash"),
    path("amenities/", AmenityListAPIView.as_view(), name="amenity-list"),
    path("wash-types/", WashTypeListAPIView.as_view(), name="washtype-list"),
]
