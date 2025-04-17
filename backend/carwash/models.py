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
    code = models.CharField(max_length=50, unique=True)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    used_by_metadata = models.JSONField()
    
    objects = models.Manager()
    active_objects = ActiveManager()
    
    def __str__(self):
        return f"{self.code} - {self.offer.name}"
    
    def mark_as_used(self, user_metadata):
        self.is_used = True
        self.used_at = timezone.now()
        self.used_by_metadata = user_metadata
        self.save()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = gis_models.PointField(geography=True, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"
    

class CarWashReview(CustomModelMixin):
    """
        CarWash Review Model
        Rating Not Applicable = 0 
        Minimum rating = 1
        Maximum rating = 5
    """
    car_wash = models.ForeignKey(CarWash, on_delete=models.CASCADE, related_name="reviews")
    user_metadata = models.JSONField()
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