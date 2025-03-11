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
    automaticCarWash = django_filters.BooleanFilter(field_name="automatic_car_wash")
    selfServiceCarWash = django_filters.BooleanFilter(field_name="self_service_car_wash")
    open24Hours = django_filters.BooleanFilter(field_name="open_24_hours")
    verified = django_filters.BooleanFilter(field_name="verified")
    washTypeName = django_filters.BaseInFilter(field_name="wash_types__name", lookup_expr='in')
    washTypeSubClass = django_filters.BaseInFilter(field_name="wash_types__subclass", lookup_expr='in')
    washTypeCategory = django_filters.BaseInFilter(field_name="wash_types__category", lookup_expr='in')
    amenityName = django_filters.BaseInFilter(field_name="amenities__name", lookup_expr='in')
    amenityCategory = django_filters.BaseInFilter(field_name="amenities__category", lookup_expr='in')
    userLat = django_filters.NumberFilter(method="filter_user_location", label="User's search Latitude")
    userLng = django_filters.NumberFilter(method="filter_user_location", label="User's search Longitude")
    distance = django_filters.NumberFilter(method="get_nearest_shops", label="Distance in miles of radius")

    class Meta:
        model = CarWash
        fields = ("carWashName", "country", "countryCode", "state", "city", "stateCode", "reviewsCount", 
                  "automaticCarWash", "selfServiceCarWash", "open24Hours", "verified", "washTypeName", 
                  "washTypeSubClass", "washTypeCategory", "amenityName", "amenityCategory", "distance")
        
    def filter_user_location(self, queryset, name, value):
        return queryset
        
    def get_nearest_shops(self, queryset, name, value):
        user_lat = self.request.GET.get("userLat")
        user_lng = self.request.GET.get("userLng")
        radius_miles = self.request.GET.get("distance")
        if not user_lat or not user_lng:
            return queryset
        
        reference_point = Point(float(user_lng), float(user_lat), srid=4326)
        radius_meters = float(radius_miles) * 1609.34
        
        queryset = queryset.annotate(
            distance=Distance("location", reference_point)
        ).filter(distance__lte=radius_meters)

        return queryset