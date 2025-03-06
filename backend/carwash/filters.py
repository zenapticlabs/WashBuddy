from rest_framework import filters
import django_filters
from .models import CarWash

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

    carWashName = django_filters.CharFilter(field_name="car_wash_name", lookup_expr='icontains')
    country = django_filters.CharFilter(field_name="country", lookup_expr='icontains')
    countryCode = django_filters.CharFilter(field_name="country_code", lookup_expr='icontains')
    state = django_filters.CharFilter(field_name="state", lookup_expr='icontains')
    city = django_filters.CharFilter(field_name="city", lookup_expr='icontains')
    stateCode = django_filters.CharFilter(field_name="state_code", lookup_expr='icontains')
    reviewsCount = django_filters.CharFilter(field_name="reviews_count", lookup_expr='icontains')
    automaticCarWash = django_filters.CharFilter(field_name="automatic_car_wash", lookup_expr='icontains')
    selfServiceCarWash = django_filters.CharFilter(field_name="self_service_car_wash", lookup_expr='icontains')
    open24Hours = django_filters.CharFilter(field_name="open_24_hours", lookup_expr='icontains')
    verified = django_filters.CharFilter(field_name="verified", lookup_expr='icontains')
    washTypeName = django_filters.CharFilter(field_name="wash_types__name", lookup_expr='icontains')
    washTypeSubClass = django_filters.CharFilter(field_name="wash_types__subclass", lookup_expr='icontains')
    washTypeCategory = django_filters.CharFilter(field_name="wash_types__category", lookup_expr='icontains')
    amenityName = django_filters.CharFilter(field_name="amenities__name", lookup_expr='icontains')
    amenityCategory = django_filters.CharFilter(field_name="amenities__category", lookup_expr='icontains')

    class Meta:
        model = CarWash
        fields = ("carWashName", "country", "countryCode", "state", "city", "stateCode", "reviewsCount", 
                  "automaticCarWash", "selfServiceCarWash", "open24Hours", "verified", "washTypeName", 
                  "washTypeSubClass", "washTypeCategory", "amenityName", "amenityCategory")