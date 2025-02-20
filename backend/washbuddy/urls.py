"""
URL configuration for washbuddy project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from carwash.views import CarWashViewSet
from carwash_filter.views import (
    AmenityViewSet,
    WashTypeViewSet,
    CarWashAmenityMappingViewSet,
    CarWashWashTypeMappingViewSet
)

router = DefaultRouter()
router.register(r'carwashes', CarWashViewSet)

router.register(r'amenities', AmenityViewSet)
router.register(r'wash-types', WashTypeViewSet)
router.register(r'amenity-mappings', CarWashAmenityMappingViewSet)
router.register(r'wash-type-mappings', CarWashWashTypeMappingViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]