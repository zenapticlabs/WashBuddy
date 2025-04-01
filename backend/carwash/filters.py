from rest_framework import filters
import django_filters
from .models import CarWash, CarWashReview
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.db.models import Sum, Value, DecimalField, FloatField, Q
from django.db.models.functions import Coalesce
from django.db.models import Min, DecimalField, Value

class DynamicSearchFilter(filters.SearchFilter):
    def get_search_fields(self, view, request):
        search_fields = request.GET.get("search_fields")
        if isinstance(search_fields, str):
            return search_fields.split(",")
        else:
            return search_fields

class CustomOrderingCarWashFilter(django_filters.OrderingFilter):
    def filter(self, qs, value):
        if not value:
            return qs

        custom_ordering = {
            'price_high_to_low': ['-min_price', 'car_wash_name'],
            'price_low_to_high': ['min_price', 'car_wash_name'],
            'recommended': ['-reviews_average'],
            "distance_near_to_far": ["distance"]
        }

        if value[0] in ['price_high_to_low', 'price_low_to_high']:
            qs = qs.annotate(
                min_price=Coalesce(Min("packages__price"), Value(0, output_field=DecimalField()))
            )

        ordering = custom_ordering.get(value[0], value)
        return qs.order_by(*ordering)

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
    sortBy = CustomOrderingCarWashFilter(fields=(
            ('id', 'id'),
            ('car_wash_name', 'car_wash_name'),
            ('created_at', 'created_at'),
            ('price_high_to_low', 'price_high_to_low'),
            ('price_low_to_high', 'price_low_to_high'),
            ('recommended', 'recommended'),
            ('distance_near_to_far', 'distance_near_to_far'),
        ))
    searchLocations = django_filters.BaseInFilter(method='filter_search', label='Search Locations')
    price_lte = django_filters.BaseInFilter(method='price', label='Price Range')
    userLat = django_filters.NumberFilter(method="filter_user_location", label="User's search Latitude")
    userLng = django_filters.NumberFilter(method="filter_user_location", label="User's search Longitude")
    distance = django_filters.NumberFilter(method="get_nearest_shops", label="Distance in miles of radius")
    class Meta:
        model = CarWash
        fields = ("carWashName", "country", "countryCode", "state", "city", "stateCode", "reviewsCount", 
                  "automaticCarWash", "selfServiceCarWash", "open24Hours", "verified", "washTypeName", 
                  "washTypeSubClass", "washTypeCategory", "amenityName", "amenityCategory", "distance", "sortBy")
        
    def filter_user_location(self, queryset, name, value):
        return queryset
        
    def get_nearest_shops(self, queryset, name, value):
        if value:
            return queryset.filter(distance__lte=float(value))
        return queryset
    
    def price(self, queryset, name, value):
        queryset = queryset.annotate(
            min_price=Coalesce(Min("packages__price"), Value(0, output_field=DecimalField()))
        )
        if value:
            return queryset.filter(min_price__lte=float(value[0]))
        return queryset

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(street__icontains=value) |
            Q(city__icontains=value) |
            Q(state__icontains=value) |
            Q(state_code__icontains=value) |
            Q(postal_code__icontains=value) |
            Q(country__icontains=value) |
            Q(country_code__icontains=value) |
            Q(formatted_address__icontains=value)
        )
    

class CustomOrderingCarWashReviewFilter(django_filters.OrderingFilter):
    def filter(self, qs, value):
        if not value:
            return qs

        custom_ordering = {
            'newest': ['-created_at'],
            'highest': ['-overall_rating'],
            'lowest': ['overall_rating'],
        }
                
        ordering = custom_ordering.get(value[0], value)
        return qs.order_by(*ordering)

class ListCarWashReviewFilter(django_filters.FilterSet):
    """
    Filter class for car wash review list.
    """

    carWashId = django_filters.BaseInFilter(field_name="car_wash__id")
    carWashName = django_filters.BaseInFilter(field_name="car_wash__car_wash_name", lookup_expr='in')
    searchText = django_filters.CharFilter(field_name="comment", lookup_expr='icontains')
    sortBy = CustomOrderingCarWashReviewFilter(fields=(
            ('id', 'id'),
            ('relevance', 'relevance'),
            ('newest', 'newest'),
            ('highest', 'highest'),
            ('lowest', 'lowest')
        ))

    class Meta:
        model = CarWashReview
        fields = ("carWashId", "carWashName", "overall_rating", "wash_quality_rating", "price_value_rating", "facility_cleanliness_rating", "customer_service_rating", 
                  "amenities_extra_rating", "searchText", "sortBy")
