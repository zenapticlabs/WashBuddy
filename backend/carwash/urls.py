from django.urls import path, include
from .views import ListCarWashAPIView, CarWashViewSet, AmenityViewSet, WashTypeViewSet, CarWashAPIView
from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'carwashes', CarWashViewSet)
# router.register(r'amenities', AmenityViewSet)
# router.register(r'wash-types', WashTypeViewSet)

urlpatterns = [
    # path('', include(router.urls)),
    path("carwash/search/", ListCarWashAPIView.as_view(), name="list-car-wash"),
    path("carwash/<int:car_wash_id>/", CarWashAPIView.as_view(), name="get-patch-car-wash")
]
