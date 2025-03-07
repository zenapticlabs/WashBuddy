from rest_framework import filters
import django_filters
from .models import CarWash
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance

class DynamicSearchFilter(filters.SearchFilter):
    def get_search_fields(self, view, request):
        search_fields = request.GET.get("search_fields")
        if isinstance(search_fields, str):
            return search_fields.split(",")
        else:
            return search_fields

class ListCarWashFilter(django_filters.FilterSet):
    """
    Filter class for car wash list.
    """

    carWashName = django_filters.BaseInFilter(field_name="car_wash_name", lookup_expr='in')
    country = django_filters.BaseInFilter(field_name="country", lookup_expr='in')
    countryCode = django_filters.BaseInFilter(field_name="country_code", lookup_expr='in')
    state = django_filters.BaseInFilter(field_name="state", lookup_expr='in')
    city = django_filters.BaseInFilter(field_name="city", lookup_expr='in')
    stateCode = django_filters.BaseInFilter(field_name="state_code", lookup_expr='in')
    reviewsCount = django_filters.BaseInFilter(field_name="reviews_count", lookup_expr='in')
    automaticCarWash = django_filters.BaseInFilter(field_name="automatic_car_wash", lookup_expr='in')
    selfServiceCarWash = django_filters.BaseInFilter(field_name="self_service_car_wash", lookup_expr='in')
    open24Hours = django_filters.BaseInFilter(field_name="open_24_hours", lookup_expr='in')
    verified = django_filters.BaseInFilter(field_name="verified", lookup_expr='in')
    washTypeName = django_filters.BaseInFilter(field_name="wash_types__name", lookup_expr='in')
    washTypeSubClass = django_filters.BaseInFilter(field_name="wash_types__subclass", lookup_expr='in')
    washTypeCategory = django_filters.BaseInFilter(field_name="wash_types__category", lookup_expr='in')
    amenityName = django_filters.BaseInFilter(field_name="amenities__name", lookup_expr='in')
    amenityCategory = django_filters.BaseInFilter(field_name="amenities__category", lookup_expr='in')
    distance = django_filters.BaseInFilter(method='get_nearest_shops')

    class Meta:
        model = CarWash
        fields = ("carWashName", "country", "countryCode", "state", "city", "stateCode", "reviewsCount", 
                  "automaticCarWash", "selfServiceCarWash", "open24Hours", "verified", "washTypeName", 
                  "washTypeSubClass", "washTypeCategory", "amenityName", "amenityCategory", "distance")
        
    def get_nearest_shops(self, queryset, name, value):
        user_lat = self.request.GET.get("userLat")
        user_lng = self.request.GET.get("userLng")
        radius_km = self.request.GET.get("distance")
        if not user_lat or not user_lng:
            return queryset
        
        reference_point = Point(float(user_lng), float(user_lat), srid=4326)
        queryset = queryset.annotate(
            distance=Distance("location", reference_point)
        ).filter(distance__lte=float(radius_km) * 1000)  # Convert km to meters

        return queryset