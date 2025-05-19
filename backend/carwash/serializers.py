from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.gis.geos import Point
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import (
    CarWash, CarWashOperatingHours, CarWashImage, CarWashReview, CarWashReviewImage, Payment, 
    WashType, Amenity, CarWashPackage, Offer, CarWashCode
)
from utilities.mixins import DynamicFieldsSerializerMixin
from rest_framework_gis.fields import GeometryField
from rest_framework.exceptions import PermissionDenied, AuthenticationFailed
from django.db.models import Count, Avg, Q
from . import utils

class WashTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WashType
        exclude = ("created_at", "updated_at",)

    def validate_category(self, value):
        if value not in ['automatic', 'selfservice']:
            raise ValidationError("Category must be either 'automatic' or 'selfservice'")
        return value

    def validate_subclass(self, value):
        if value not in ['Clean', 'Polish', 'Shine/Dry']:
            raise ValidationError("Subclass must be one of: Clean, Polish, Shine/Dry")
        return value

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        exclude = ("created_at", "updated_at",)

    def validate_category(self, value):
        if value not in ['automatic', 'selfservice']:
            raise ValidationError("Category must be either 'automatic' or 'selfservice'")
        return value

class CarWashOperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        exclude = ('car_wash',)

    def validate(self, data):
        if data.get('is_closed'):
            if data.get('opening_time') is not None or data.get('closing_time') is not None:
                raise ValidationError("When is_closed is True, opening_time and closing_time must be null")
        else:
            if data.get('opening_time') is None or data.get('closing_time') is None:
                raise ValidationError("When is_closed is False, opening_time and closing_time are required")
        return data

class CarWashImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashImage
        exclude = ('car_wash',)

class OfferSerializer(DynamicFieldsSerializerMixin, serializers.ModelSerializer):
    package_id = serializers.IntegerField(source='package.id', read_only=True)
    car_wash_id = serializers.IntegerField(source='package.car_wash.id', read_only=True)

    class Meta:
        model = Offer
        fields = '__all__'

class CarWashPackageSerializer(serializers.ModelSerializer):
    wash_types = serializers.SerializerMethodField()

    class Meta:
        model = CarWashPackage
        exclude = ('car_wash',)

    def get_wash_types(self, instance):
        return WashTypeSerializer(instance.wash_types, many=True).data

class CarWashTypeSerializer(serializers.ModelSerializer):    
    class Meta:
        model = WashType
        fields = "__all__"

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

class CarWashOperatingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        fields = '__all__'

class CarWashImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashImage
        fields = '__all__'

class ReviewStatsSerializer(serializers.Serializer):
    total_reviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
    rating_5 = serializers.IntegerField()
    rating_4 = serializers.IntegerField()
    rating_3 = serializers.IntegerField()
    rating_2 = serializers.IntegerField()
    rating_1 = serializers.IntegerField()

class CarWashListSerializer(DynamicFieldsSerializerMixin, serializers.ModelSerializer):
    amenities = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    operating_hours = CarWashOperatingHoursSerializer(many=True)
    packages = serializers.SerializerMethodField()
    images = CarWashImageSerializer(many=True)
    distance = serializers.FloatField(read_only=True)
    reviews_summary = serializers.SerializerMethodField()

    class Meta:
        model = CarWash
        fields = '__all__'

    def get_amenities(self, instance):
        return AmenitySerializer(instance.amenities, many=True, context={"car_wash": instance}).data
    
    def get_packages(self, instance):
        wash_type_names = self.context.get("request", {}).GET.get("washTypeName", None)
        if wash_type_names:
            wash_type_names_list = wash_type_names.split(",")
            packages = instance.packages.filter(wash_types__name__in=wash_type_names_list).distinct()
        else:
            packages = instance.packages.all()
        return CarWashPackageSerializer(packages, many=True, context={"request": self.context.get("request")}).data
    
    def get_location(self, instance):
        if instance.location:
            return {
                "type": "Point",
                "coordinates": [instance.location.x, instance.location.y]
            }
        return None
    
    def get_distance(self, obj):
        return round(obj.distance, 1) if hasattr(obj, "distance") else None
    
    def get_reviews_summary(self, instance):
        review_objects = instance.reviews.aggregate(
            total_reviews=Count('id'),
            average_rating=Avg('overall_rating'),
            rating_5=Count('id', filter=Q(overall_rating=5)),
            rating_4=Count('id', filter=Q(overall_rating=4)),
            rating_3=Count('id', filter=Q(overall_rating=3)),
            rating_2=Count('id', filter=Q(overall_rating=2)),
            rating_1=Count('id', filter=Q(overall_rating=1)),
        )
        return ReviewStatsSerializer(review_objects).data

class CarWashOperatingHoursPostPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashOperatingHours
        fields = ["day_of_week", "is_closed", "opening_time", "closing_time"]


class CarWashImagesPostPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashImage
        fields = ["image_type", "image_url"]

class CarWashReviewImagesPostPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashReviewImage
        fields = ["image_url"]

class CarWashPackagesPostPatchSerializer(serializers.ModelSerializer):
    wash_types = serializers.PrimaryKeyRelatedField(
        queryset=WashType.objects.all(), many=True, required=False
    )
    class Meta:
        model = CarWashPackage
        fields = ["name", "description", "price", "wash_types", "category", "rate_duration"]

class CarWashPostPatchSerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, required=False
    )
    operating_hours = CarWashOperatingHoursPostPatchSerializer(many=True, required=False)
    images = CarWashImagesPostPatchSerializer(many=True, required=False)
    location = GeometryField()
    packages = CarWashPackagesPostPatchSerializer(many=True, required=False)

    class Meta:
        model = CarWash
        fields = "__all__"

    def update(self, instance, validated_data):
        self.handle_location(validated_data)

        operating_hours = validated_data.pop("operating_hours", [])  
        images = validated_data.pop("images", [])  
        packages = validated_data.pop("packages", [])  

        self.handle_operating_hours(instance, operating_hours)
        self.handle_images(instance, images)
        self.handle_packages(instance, packages)

        return super().update(instance, validated_data)
    
    def handle_location(self, validated_data):
        location = validated_data.get("location", {})
        if location:
            validated_data["location"] = Point(location.x, location.y, srid=4326)

    def handle_operating_hours(self, instance, operating_hours): 
        for operating_hour_object in operating_hours:
            existing_object = instance.operating_hours.filter(day_of_week=operating_hour_object["day_of_week"])
            if not existing_object:
                CarWashOperatingHours.objects.create(
                    car_wash=instance,
                    **operating_hour_object
                )
            else:
                existing_object.update(**operating_hour_object)

    def handle_images(self, instance, images): 
        for image_object in images:
            existing_object = instance.images.filter(image_url=image_object["image_url"])
            if not existing_object:
                CarWashImage.objects.create(
                    car_wash=instance,
                    **image_object
                )
            else:
                existing_object.update(**image_object)

    def handle_packages(self, instance, packages):  
        new_packages_ids = []         
        for package_object in packages:
            existing_object = instance.packages.filter(name=package_object["name"])
            wash_types = package_object.pop("wash_types", [])
            if not existing_object:
                existing_object = CarWashPackage.objects.create(
                    car_wash=instance,
                    **package_object
                )
                new_packages_ids.append(existing_object.id)
            else:
                existing_object.update(**package_object)
                existing_object = existing_object.first()
                new_packages_ids.append(existing_object.id)

            existing_object.wash_types.set(wash_types)
        
        instance.packages.filter(~Q(id__in=new_packages_ids)).delete()

    def create(self, validated_data):
        amenities = validated_data.pop("amenities", [])
        operating_hours = validated_data.pop("operating_hours", [])  
        images = validated_data.pop("images", [])  
        packages = validated_data.pop("packages", [])  

        car_wash = CarWash.objects.create(**validated_data)

        car_wash.amenities.set(amenities)

        self.handle_operating_hours(car_wash, operating_hours)
        self.handle_images(car_wash, images)
        self.handle_packages(car_wash, packages)
        return car_wash
    

class PreSignedUrlSerializer(serializers.Serializer):
    filename = serializers.CharField()


class CarWashReviewPostPatchSerializer(serializers.ModelSerializer):
    images = CarWashReviewImagesPostPatchSerializer(many=True, required=False)
    user_id = serializers.CharField(read_only=True)

    class Meta:
        model = CarWashReview
        exclude = ["created_by", "updated_by", "status", "user_metadata"]

    def create(self, validated_data):
        images = validated_data.pop("images", [])  
        authorization_header = self.context.get("authorization_header")
        user_data = self.handle_user_meta_data(authorization_header)
        
        # Create the review with user data
        car_wash_review = CarWashReview.objects.create(
            **validated_data,
            user_id=user_data["user_id"],
            user_metadata=user_data
        )

        self.handle_images(car_wash_review, images)

        return car_wash_review
    
    def handle_user_meta_data(self, authorization_header): 
        if not authorization_header or not authorization_header.startswith("Bearer "):
            raise PermissionDenied({"message": "Invalid or missing token"})
            
        try:
            user_data = utils.handle_user_meta_data(authorization_header)
            if not user_data:
                raise AuthenticationFailed("Invalid user data")
            return user_data
        except Exception as e:
            raise AuthenticationFailed(str(e))

    def handle_images(self, instance, images): 
        for image_object in images:
            existing_object = instance.images.filter(image_url=image_object["image_url"])
            if not existing_object:
                CarWashReviewImage.objects.create(
                    carwash_review=instance,
                    **image_object
                )
            else:
                existing_object.update(**image_object)


class CarWashReviewImagesGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashReviewImage
        fields = "__all__"

class CarWashReviewListSerializer(DynamicFieldsSerializerMixin, serializers.ModelSerializer):
    images = CarWashReviewImagesGetSerializer(many=True)

    class Meta:
        model = CarWashReview
        fields = '__all__'

class OfferCreatePatchSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Offer
        fields = '__all__'

class CarWashCodeSerializer(DynamicFieldsSerializerMixin, serializers.ModelSerializer):
    
    class Meta:
        model = CarWashCode
        fields = '__all__'


class CarWashCodeCreatePatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWashCode
        exclude = ["created_by", "updated_by", "status"]

class CarWashCodeUsageCreateSerializer(serializers.ModelSerializer):
    code = serializers.CharField(write_only=True)
    offer_id = serializers.IntegerField(write_only=True)
    user_metadata = serializers.JSONField(required=False, write_only=True)
    used_at = serializers.DateTimeField(required=False, write_only=True)

    class Meta:
        model = CarWashCode
        fields = ["code", "offer_id", "user_metadata", "used_at"]
    
class CreatePaymentIntentSerializer(serializers.Serializer):
    offer_id = serializers.IntegerField()

class PaymentStatusSerializer(serializers.ModelSerializer):
    carwash_code = serializers.IntegerField(source='carwash_code.code', read_only=True)

    class Meta:
        model = Payment
        fields = ['payment_intent_id', 'status', 'error_message', 'carwash_code']
        read_only_fields = ['payment_intent_id', 'status', 'error_message', 'carwash_code']

class UserPaymentHistorySerializer(DynamicFieldsSerializerMixin, serializers.ModelSerializer):
    carwash_name = serializers.CharField(source='offer.package.car_wash.car_wash_name', read_only=True)
    package_name = serializers.CharField(source='offer.package.name', read_only=True)
    offer_name = serializers.CharField(source='offer.name', read_only=True)
    carwash_code = serializers.CharField(source='carwash_code.code', read_only=True)
    offer_id = serializers.IntegerField(source='offer.id', read_only=True)
    package_id = serializers.IntegerField(source='offer.package.id', read_only=True)
    car_wash_id = serializers.IntegerField(source='offer.package.car_wash.id', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'payment_intent_id', 'amount', 'status', 'created_at',
            'carwash_name', 'package_name', 'offer_name', 'carwash_code', 'error_message',
            'offer_id', 'package_id', 'car_wash_id'
        ]
        read_only_fields = fields