from django.contrib import admin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.import_export.forms import ExportForm, ImportForm

# from import_export.admin import ImportExportMixin
from import_export import resources
# from unfold.contrib.import_export.forms import ExportForm, ImportForm

from .models import (
    CarWash, 
    CarWashOperatingHours, 
    CarWashImage, 
    WashType, 
    Amenity,
    CarWashWashTypeMapping,
    AmenityCarWashMapping
)

@admin.register(WashType)
class WashTypeAdmin(ModelAdmin):
    list_display = ('name', 'category', 'subclass')
    search_fields = ('name',)

@admin.register(Amenity)
class AmenityAdmin(ModelAdmin):
    list_display = ('name', 'category')
    search_fields = ('name',)

class CarWashOperatingHoursInline(admin.TabularInline):
    model = CarWashOperatingHours
    extra = 7

class CarWashImageInline(admin.TabularInline):
    model = CarWashImage
    extra = 7

class CarWashWashTypeMappingInline(admin.TabularInline):
    model = CarWashWashTypeMapping
    extra = 1

class AmenityCarWashMappingInline(admin.TabularInline):
    model = AmenityCarWashMapping
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
        CarWashImageInline,
        CarWashWashTypeMappingInline,
        AmenityCarWashMappingInline
    ]