from django.urls import path, include
from .views import CarWashRetrieveUpdateView, ListCarWashAPIView, CarWashViewSet, WashTypeListAPIView, AmenityListAPIView
from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'carwashes', CarWashViewSet)

urlpatterns = [
    path("<int:id>/", CarWashRetrieveUpdateView.as_view(), name="get-patch-car-wash"),
    path("search/", ListCarWashAPIView.as_view(), name="list-car-wash"),
    path("amenities/", AmenityListAPIView.as_view(), name="amenity-list"),
    path("wash-types/", WashTypeListAPIView.as_view(), name="washtype-list"),
]
