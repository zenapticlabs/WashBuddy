from django.urls import path
from .views import ListCarWashAPIView

urlpatterns = [
    path("list-car-wash/", ListCarWashAPIView.as_view(), name="list-car-wash"),
]
