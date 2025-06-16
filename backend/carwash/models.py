from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.auth.models import User

from utilities.constants import IMAGE_TYPE_CHOICES
from .managers import ActiveManager
from utilities.mixins import CustomModelMixin
from phonenumber_field.modelfields import PhoneNumberField
from django.core.exceptions import ValidationError
from django.utils import timezone

class CarWash(CustomModelMixin):
    car_wash_name = models.CharField(max_length=255, db_index=True)
    street = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    state_code = models.CharField(max_length=10, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    country_code = models.CharField(max_length=10, null=True, blank=True)
    formatted_address = models.CharField(max_length=255, null=True, blank=True)
    
    phone = PhoneNumberField(region="US", blank=True, null=True)
    website = models.URLField(max_length=255, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True, verbose_name="Image URL")
    
    reviews_count = models.IntegerField(default=0, null=True, blank=True)
    reviews_average = models.DecimalField(max_digits=3, decimal_places=2, default=0, null=True, blank=True)
    
    location = gis_models.PointField(geography=True, spatial_index=True, null=True, blank=True)
    
    automatic_car_wash = models.BooleanField()
    self_service_car_wash = models.BooleanField()
    open_24_hours = models.BooleanField()
    verified = models.BooleanField(default=False)

    active_bounty = models.BooleanField(default=False, verbose_name="Active Bounty")

    amenities = models.ManyToManyField(
        'Amenity', 
        through='AmenityCarWashMapping',
        related_name='car_washes'
    )
    
    def __str__(self):
        return self.car_wash_name

    @property
    def latitude(self):
        if self.location:
            return self.location.y
        return None

    @property
    def longitude(self):
        if self.location:
            return self.location.x
        return None
        
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
    @classmethod
    def get_nearest(cls, lat, lng, distance_km=None):
        """
        Find car washes nearest to a point.
        Optional distance_km parameter to limit results within a radius.
        """
        user_location = Point(float(lng), float(lat), srid=4326)
        queryset = cls.objects.all()
        
        # Annotate with distance
        queryset = queryset.annotate(
            distance=Distance('location', user_location)
        ).order_by('distance')
        
        # Filter by distance if specified
        if distance_km:
            queryset = queryset.filter(
                distance__lte=distance_km * 1000  # Convert km to meters
            )
            
        return queryset
    
    objects = models.Manager()
    active_objects = ActiveManager()

    class Meta:
        indexes = [
            models.Index(fields=['automatic_car_wash', 'self_service_car_wash']),
            models.Index(fields=['open_24_hours']),
        ]
        verbose_name = "Car Wash"
        verbose_name_plural = "Car Washes"

class CarWashOperatingHours(CustomModelMixin):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE, related_name="operating_hours")
    day_of_week = models.SmallIntegerField(
        validators=[
            MinValueValidator(0, "Day must be at least 0"),
            MaxValueValidator(6, "Day must be at most 6")
        ]
    )
    is_closed = models.BooleanField(default=False)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)

    objects = models.Manager()
    active_objects = ActiveManager()

    class Meta:
        unique_together = ('car_wash', 'day_of_week')
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(is_closed=True, opening_time__isnull=True, closing_time__isnull=True) |
                    models.Q(is_closed=False, opening_time__isnull=False, closing_time__isnull=False)
                ),
                name='check_opening_closing_times'
            )
        ]
        indexes = [
            models.Index(fields=['day_of_week', 'is_closed']),
        ]

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.day_of_week}"

class CarWashImage(CustomModelMixin):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE, related_name="images")
    image_type = models.CharField(max_length=100, choices=IMAGE_TYPE_CHOICES)
    image_url = models.URLField(max_length=500, verbose_name="Image URL")

    objects = models.Manager()
    active_objects = ActiveManager()

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.image_url}"


class WashType(CustomModelMixin):
    CATEGORY_CHOICES = [
        ('automatic', 'Automatic Car Wash'),
        ('selfservice', 'Self Service Car Wash')
    ]
    SUBCLASS_CHOICES = [
        ('Clean', 'Clean'),
        ('Polish', 'Polish'),
        ('Shine/Dry', 'Shine/Dry')
    ]
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True
    )
    subclass = models.CharField(
        max_length=20,
        choices=SUBCLASS_CHOICES,
        db_index=True
    )

    objects = models.Manager()
    active_objects = ActiveManager()

    def __str__(self):
        return f"{self.name} ({self.category} - {self.subclass})"

class Amenity(CustomModelMixin):
    CATEGORY_CHOICES = [
        ('automatic', 'Automatic Car Wash'),
        ('selfservice', 'Self Service Car Wash')
    ]

    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        db_index=True
    )

    objects = models.Manager()
    active_objects = ActiveManager()

    def __str__(self):
        return f"{self.name} ({self.category})"
    
    class Meta:
        verbose_name_plural = "Amenities"

class AmenityCarWashMapping(CustomModelMixin):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE, related_name="amenity_mapping")
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name="car_wash_mapping")

    objects = models.Manager()
    active_objects = ActiveManager()

    class Meta:
        unique_together = ('car_wash', 'amenity')

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.amenity.name}"

class CarWashPackage(CustomModelMixin):
    CATEGORY_CHOICES = [
        ('automatic', 'Automatic Car Wash'),
        ('selfservice', 'Self Service Car Wash')
    ]
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE, related_name="packages")
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    wash_types = models.ManyToManyField(WashType, related_name="packages", blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='automatic')
    rate_duration = models.PositiveIntegerField(default=0)

    objects = models.Manager()
    active_objects = ActiveManager()

    def __str__(self):
        return f"{self.car_wash.car_wash_name} - {self.name}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            self.wash_types.set(self.wash_types.all())

class Offer(CustomModelMixin):
    OFFER_TYPES = [
        ('TIME_DEPENDENT', 'Time Dependent'),
        ('ONE_TIME', 'One Time'),
        ('GEOGRAPHICAL', 'Geographical')
    ]
    
    package = models.OneToOneField(CarWashPackage, on_delete=models.CASCADE, related_name="offer")
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2)
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPES)
    
    # Time dependent fields
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    # Geographical fields
    radius_miles = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    objects = models.Manager()
    active_objects = ActiveManager()
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(offer_type='TIME_DEPENDENT', start_time__isnull=False, end_time__isnull=False) |
                    models.Q(offer_type='ONE_TIME', start_time__isnull=True, end_time__isnull=True) |
                    models.Q(offer_type='GEOGRAPHICAL', radius_miles__isnull=False)
                ),
                name='check_offer_type_constraints'
            )
        ]
    
    def __str__(self):
        return f"{self.name} - {self.package.car_wash.car_wash_name}"
    
    def clean(self):
        if self.offer_type == 'TIME_DEPENDENT' and not (self.start_time and self.end_time):
            raise ValidationError("Time dependent offers require both start and end times")
        if self.offer_type == 'GEOGRAPHICAL' and not self.radius_miles:
            raise ValidationError("Geographical offers require a radius")
        if self.package and self.offer_price >= self.package.price:
            raise ValidationError("Offer price must be less than package price")
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class CarWashCode(CustomModelMixin):
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name="codes")
    code = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="carwash_codes")
    used_at = models.DateTimeField(null=True, blank=True)
    
    objects = models.Manager()
    active_objects = ActiveManager()

    class Meta:
        unique_together = ('code', 'offer')
        constraints = [
            models.UniqueConstraint(
                fields=['code', 'offer'],
                name='unique_code_per_offer'
            )
        ]
    
    def __str__(self):
        return f"{self.code} - {self.offer.name}"

class CarWashReview(CustomModelMixin):
    """
        CarWash Review Model
        Rating Not Applicable = 0 
        Minimum rating = 1
        Maximum rating = 5
    """
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="carwash_reviews")
    comment = models.TextField()
    overall_rating = models.SmallIntegerField(validators=[
            MinValueValidator(0, "Rating must be at least 0"),
            MaxValueValidator(5, "Rating must be at most 5")
        ])
    wash_quality_rating = models.SmallIntegerField(validators=[
            MinValueValidator(0, "Rating must be at least 0"),      
            MaxValueValidator(5, "Rating must be at most 5")
        ])
    price_value_rating = models.SmallIntegerField(validators=[
            MinValueValidator(0, "Rating must be at least 0"),      
            MaxValueValidator(5, "Rating must be at most 5")
        ])
    facility_cleanliness_rating = models.SmallIntegerField(validators=[
            MinValueValidator(0, "Rating must be at least 0"),      
            MaxValueValidator(5, "Rating must be at most 5")
        ])
    customer_service_rating = models.SmallIntegerField(validators=[
            MinValueValidator(0, "Rating must be at least 0"),      
            MaxValueValidator(5, "Rating must be at most 5")
        ])
    amenities_extra_rating = models.SmallIntegerField(validators=[
            MinValueValidator(0, "Rating must be at least 0"),      
            MaxValueValidator(5, "Rating must be at most 5")
        ])
    
    def __str__(self):
        return f"{self.car_wash.car_wash_name}"

class CarWashReviewImage(CustomModelMixin):
    carwash_review = models.ForeignKey(CarWashReview, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=500)

    def __str__(self):
        return f"{self.id}-{self.carwash_review.id}"
    
class Payment(CustomModelMixin):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    ]

    offer = models.ForeignKey('Offer', on_delete=models.CASCADE, related_name='payments')
    carwash_code = models.ForeignKey('CarWashCode', on_delete=models.SET_NULL, related_name='payments', null=True, blank=True)
    payment_intent_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="carwash_payments")
    error_message = models.TextField(null=True, blank=True)

    def clean(self):
        if self.carwash_code and self.carwash_code.offer_id != self.offer_id:
            raise ValidationError({
                'carwash_code': 'Car wash code must belong to the selected offer'
            })
        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment {self.payment_intent_id} - {self.offer.name}"
    

class CarWashUpdateRequest(CustomModelMixin):
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE, related_name="pending_updates", null=True, blank=True)
    proposed_changes = models.JSONField()
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="car_wash_update_requests")
    approved = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=250)
    payment_handle = models.CharField(max_length=250)
    payouts_status = models.CharField(max_length=50, default="PENDING", choices=[
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed")
    ])
    rejected = models.BooleanField(default=False)
    rejection_reason = models.TextField(null=True, blank=True)

    # once approved, it should be saved to car wash model
    def save(self, *args, **kwargs):
        try:
            # Make Bounty InActive on create
            if self.car_wash and not self.pk:
                self.car_wash.active_bounty = False
                self.car_wash.save()

            # Check if approved status changed to True
            existing_object = CarWashUpdateRequest.objects.filter(pk=self.pk).first()
            if existing_object and self.approved and (not existing_object.approved):
                if self.rejected or existing_object.rejected:
                    raise ValidationError("Cannot approve an update request that has been rejected.")
                self.reviewed_at = timezone.now()
                
                # Update car wash with proposed changes
                from .serializers import CarWashPostPatchSerializer
                is_new = self.car_wash is None
                if self.car_wash:
                    car_wash_serializer = CarWashPostPatchSerializer(self.car_wash, self.proposed_changes, partial=True)
                else:
                    car_wash_serializer = CarWashPostPatchSerializer(data=self.proposed_changes)

                if car_wash_serializer.is_valid(raise_exception=True):
                    car_wash = car_wash_serializer.save()
                    if is_new:
                        self.car_wash = car_wash
            
            # Check if rejected status changed to True
            if existing_object and self.rejected and (not existing_object.rejected):
                self.reviewed_at = timezone.now()
                if not self.rejection_reason:
                    raise ValidationError("Rejection reason is required when rejecting the update request.")
                # TO:DO send email to the user about rejection

                self.car_wash.active_bounty = True
                self.car_wash.save()
            
            super().save(*args, **kwargs)
        except Exception as e:
            raise ValidationError(f"Could not approve the changes. Error: {e}")

    def __str__(self):
        return f"Update Request by {self.submitted_by}"

    class Meta:
        verbose_name = "Car Wash Update Request"
        verbose_name_plural = "Car Wash Update Requests"