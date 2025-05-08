from rest_framework import serializers
from carwash.models import CarWashReview, CarWash
from carwash.serializers import CarWashReviewListSerializer

class SimpleCarWashSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()

    class Meta:
        model = CarWash
        fields = [
            'id', 'car_wash_name', 'street', 'city', 'state', 'state_code',
            'postal_code', 'country', 'country_code', 'formatted_address',
            'phone', 'website', 'email', 'image_url', 'reviews_count',
            'reviews_average', 'location', 'automatic_car_wash',
            'self_service_car_wash', 'open_24_hours', 'verified'
        ]

    def get_location(self, instance):
        if instance.location:
            return {
                "type": "Point",
                "coordinates": [instance.location.x, instance.location.y]
            }
        return None

class UserReviewListSerializer(CarWashReviewListSerializer):
    car_wash = SimpleCarWashSerializer(read_only=True)

    class Meta:
        model = CarWashReview
        fields = '__all__' 