from django.contrib import admin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.import_export.forms import ExportForm, ImportForm

# from import_export.admin import ImportExportMixin
from import_export import resources
from django import forms
from unfold.widgets import UnfoldAdminSingleTimeWidget, UnfoldBooleanSwitchWidget
# from unfold.contrib.import_export.forms import ExportForm, ImportForm

from .models import (
    CarWash, 
    CarWashOperatingHours, 
    CarWashImage, 
    WashType, 
    Amenity,
    CarWashPackage,
    AmenityCarWashMapping,
    Offer,
    CarWashCode
)

@admin.register(WashType)
class WashTypeAdmin(ModelAdmin):
    list_display = ('name', 'category', 'subclass')
    search_fields = ('name',)

@admin.register(Amenity)
class AmenityAdmin(ModelAdmin):
    list_display = ('name', 'category')
    search_fields = ('name',)

class BusinessOperatingHoursForm(forms.ModelForm):
    day_of_week = forms.ChoiceField(
        choices = [
            (0, "Monday"),
            (1, "Tuesday"),
            (2, "Wednesday"),
            (3, "Thursday"),
            (4, "Friday"),
            (5, "Saturday"),
            (6, "Sunday"),
        ],
        widget=forms.Select(attrs={"class": "vSelect"}),
    )

    opening_time = forms.TimeField(
        required=False,
        widget=UnfoldAdminSingleTimeWidget(),
        
    )
    closing_time = forms.TimeField(
        required=False,
        widget=UnfoldAdminSingleTimeWidget(),
    )
    is_closed = forms.BooleanField(
        required=False,
        widget=UnfoldBooleanSwitchWidget(attrs={'class': 'vCheckboxInput'}),
        label='Closed',
    )

    class Meta:
        model = CarWashOperatingHours
        fields = ['day_of_week', 'opening_time', 'closing_time', 'is_closed']


class CarWashOperatingHoursInline(admin.TabularInline):
    model = CarWashOperatingHours
    form = BusinessOperatingHoursForm
    extra = 0

class CarWashImageInline(admin.TabularInline):
    model = CarWashImage
    extra = 0

class AmenityCarWashMappingInline(admin.TabularInline):
    model = AmenityCarWashMapping
    extra = 1

class PackageInline(admin.TabularInline):
    model = CarWashPackage
    extra = 1

class CarWashResource(resources.ModelResource):
    car_wash_name = resources.Field(column_name='name', attribute='car_wash_name')
    street = resources.Field(column_name='street', attribute='street')
    postal_code = resources.Field(column_name='zip', attribute='postal_code')
    state = resources.Field(column_name='state', attribute='state')
    city = resources.Field(column_name='city', attribute='city')
    formatted_address = resources.Field(attribute='formatted_address')
    country = resources.Field(attribute='country', default='United States')
    country_code = resources.Field(attribute='country_code', default='US')
    website = resources.Field(attribute='website')
    image_url = resources.Field(column_name='image', attribute='image_url')
    automatic_car_wash = resources.Field(attribute='automatic_car_wash')
    self_service_car_wash = resources.Field(attribute='self_service_car_wash')
    open_24_hours = resources.Field(attribute='open_24_hours')
    verified = resources.Field(attribute='verified')
    
    def before_import_row(self, row, **kwargs):
        # Set default values
        row['country_code'] = 'US'
        row['country'] = 'United States'
        row['open_24_hours'] = False
        row['verified'] = False
        
        # Handle car wash type
        carwash_type = row.get('type', '').lower()
        if carwash_type == 'self':
            row['self_service_car_wash'] = True
            row['automatic_car_wash'] = False
        elif carwash_type == 'auto':
            row['self_service_car_wash'] = False
            row['automatic_car_wash'] = True
        elif carwash_type == 'both':
            row['self_service_car_wash'] = True
            row['automatic_car_wash'] = True
        else:
            row['self_service_car_wash'] = False
            row['automatic_car_wash'] = False

        # Create formatted address - convert all parts to strings
        address_parts = []
        if row.get('street'):
            address_parts.append(str(row['street']))
        if row.get('city'):
            address_parts.append(str(row['city']))
        if row.get('state') and row.get('zip'):
            address_parts.append(f"{row['state']} {row['zip']}")
        elif row.get('state'):
            address_parts.append(str(row['state']))
        elif row.get('zip'):
            address_parts.append(str(row['zip']))
        row['formatted_address'] = ', '.join(address_parts)

        # Calculate location field from lat/lon
        lat = row.get('lat')
        lon = row.get('long')
        if lat and lon:
            from django.contrib.gis.geos import Point
            try:
                lat = float(lat)
                lon = float(lon)
                row['location'] = Point(lon, lat, srid=4326)
            except (ValueError, TypeError):
                row['location'] = None

    class Meta:
        model = CarWash
        import_id_fields = ('car_wash_name', 'street')
        fields = (
            'car_wash_name', 'street', 'formatted_address', 'country', 'country_code', 
            'state', 'postal_code', 'city', 'location', 'website', 'image_url',
            'automatic_car_wash', 'self_service_car_wash', 'open_24_hours',
            'verified'
        )
       
@admin.register(CarWash)
class CarWashAdmin(ImportExportModelAdmin, ModelAdmin):
    import_form_class = ImportForm
    export_form_class = ExportForm
    resource_class = CarWashResource
    list_display = ['car_wash_name', 'city', 'state', 'phone', 'verified']
    list_filter = ['verified', 'state', 'automatic_car_wash', 'self_service_car_wash', 'open_24_hours']
    search_fields = ['car_wash_name', 'formatted_address', 'city']
    inlines = [
        CarWashOperatingHoursInline,
        PackageInline,
        CarWashImageInline,
        AmenityCarWashMappingInline
    ]

@admin.register(CarWashPackage)
class CarWashPackageAdmin(ModelAdmin):
    list_display = ('name', 'car_wash', 'price', 'rate_duration', 'category')
    list_filter = ('car_wash',)
    search_fields = ('name', 'car_wash__car_wash_name')
    raw_id_fields = ('car_wash',)

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('name', 'package', 'offer_type', 'offer_price')
    list_filter = ('offer_type', )
    search_fields = ('name', 'package__name')
    raw_id_fields = ('package',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('package__car_wash')

@admin.register(CarWashCode)
class CarWashCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'offer', 'is_used', 'used_at')
    list_filter = ('is_used', 'offer__offer_type')
    search_fields = ('code', 'offer__name')
    readonly_fields = ('used_at', 'used_by_metadata')
    raw_id_fields = ('offer',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('offer__package__car_wash')