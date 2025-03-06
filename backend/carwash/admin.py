from django.contrib import admin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportMixin
from import_export import resources
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
    class Meta:
        model = CarWash
        import_id_fields = ('car_wash_name',)
        fields = (
            'car_wash_name', 'formatted_address', 'country', 'country_code', 
            'state', 'state_code', 'postal_code', 'city', 'phone',
            'automatic_car_wash', 'self_service_car_wash', 'open_24_hours',
            'verified'
        )

@admin.register(CarWash)
class CarWashAdmin(ImportExportMixin, ModelAdmin):
    resource_class = CarWashResource
    list_display = ['car_wash_name', 'city', 'state', 'verified']
    list_filter = ['verified', 'state', 'automatic_car_wash', 'self_service_car_wash', 'open_24_hours']
    search_fields = ['car_wash_name', 'formatted_address', 'city']
    inlines = [
        CarWashOperatingHoursInline,
        CarWashImageInline,
        CarWashWashTypeMappingInline,
        AmenityCarWashMappingInline
    ]