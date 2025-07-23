from copy import deepcopy
from django.contrib import admin
from .utils import FakeQuerySet
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.import_export.forms import ExportForm, ImportForm
from import_export.forms import ImportForm as ImportExportForm
from html import escape
from import_export import exceptions
from django.utils.translation import gettext_lazy as _

from import_export import resources
from django import forms
from unfold.widgets import UnfoldAdminSingleTimeWidget, UnfoldBooleanSwitchWidget
from django.contrib.admin.widgets import AutocompleteSelect
from django.contrib.admin import DateFieldListFilter
from django.contrib.gis.geos import Point
from .forms import CarWashForm, CarWashImageForm, CarWashOperatingHoursForm, CarWashPackageForm, CarWashUpdateRequestForm, OfferForm
from unfold.contrib.inlines.admin import NonrelatedStackedInline

from .models import (
    CarWash, 
    CarWashOperatingHours, 
    CarWashImage, 
    WashType, 
    Amenity,
    CarWashPackage,
    AmenityCarWashMapping,
    Offer,
    CarWashCode,
    Payment,
    CarWashUpdateRequest
)

@admin.register(WashType)
class WashTypeAdmin(ModelAdmin):
    list_display = ('name', 'category', 'subclass', 'created_by', 'updated_by')
    search_fields = ('name', )
    readonly_fields = ('created_by', 'updated_by')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(Amenity)
class AmenityAdmin(ModelAdmin):
    list_display = ('name', 'category', 'created_by', 'updated_by')
    search_fields = ('name',)
    readonly_fields = ('created_by', 'updated_by')
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

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

class CustomModelAdmin(ModelAdmin):
    def save_formset(self, request, form, formset, change):
        if formset.is_valid():
            instances = formset.save(commit=False)
            
            for instance in instances:
                if not change or not instance.pk:
                    instance.created_by = request.user
                instance.updated_by = request.user
                instance.save()
            
            for obj in formset.deleted_forms:
                if obj.instance.pk:
                    obj.instance.delete()
            
            formset.save_m2m()

class CustomTabularInline(admin.TabularInline):
    readonly_fields = ('created_by', 'updated_by')
    can_delete = True 

class CarWashOperatingHoursInline(CustomTabularInline):
    model = CarWashOperatingHours
    form = BusinessOperatingHoursForm
    extra = 0

class CarWashImageInline(CustomTabularInline):
    model = CarWashImage
    extra = 0

class AmenityCarWashMappingInline(CustomTabularInline):
    model = AmenityCarWashMapping
    extra = 1

class PackageInline(CustomTabularInline):
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
class CarWashAdmin(ImportExportModelAdmin, CustomModelAdmin):
    import_form_class = ImportForm
    export_form_class = ExportForm
    resource_class = CarWashResource
    list_display = ['car_wash_name', 'city', 'state', 'phone', 'verified']
    list_filter = ['verified', 'state', 'automatic_car_wash', 'self_service_car_wash', 'open_24_hours']
    search_fields = ['car_wash_name', 'formatted_address', 'city']
    readonly_fields = ('created_by', 'updated_by')
    inlines = [
        CarWashOperatingHoursInline,
        PackageInline,
        CarWashImageInline,
        AmenityCarWashMappingInline
    ]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(CarWashPackage)
class CarWashPackageAdmin(ModelAdmin):
    list_display = ('name', 'car_wash', 'price', 'rate_duration', 'category', 'created_by', 'updated_by')
    list_filter = ('car_wash',)
    search_fields = ('name', 'car_wash__car_wash_name')
    raw_id_fields = ('car_wash', )
    readonly_fields = ('created_by', 'updated_by')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Offer)
class OfferAdmin(ModelAdmin):
    form = OfferForm
    search_fields = ('name', 'package__name', 'package__car_wash__car_wash_name')
    list_display = ('name', 'package', 'package_car_wash', 'offer_type', 'codes_count', 'offer_price', 'created_by', 'updated_by')
    list_filter = ('offer_type', 'package__name', 'package__car_wash')

    def codes_count(self, obj):
        return obj.codes.count()
    codes_count.short_description = 'Codes'

    def package_car_wash(self, obj):
        return obj.package.car_wash.car_wash_name if obj.package and obj.package.car_wash else ''
    package_car_wash.short_description = 'Car Wash'
    package_car_wash.admin_order_field = 'package__car_wash__car_wash_name'

    class Media:
        js = ('admin/js/offer_dynamic.js',)  

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

class CarWashCodeResource(resources.ModelResource):
    offer = resources.Field(attribute='offer')
    created_by = resources.Field(attribute='created_by')
    updated_by = resources.Field(attribute='updated_by')

    def before_import_row(self, row, **kwargs):
        offer = kwargs.get('offer')

        if offer:
            row['offer'] = Offer.objects.get(id=offer)

        row['created_by'] = kwargs.get('user')
        row['updated_by'] = kwargs.get('user')

    class Meta:
        model = CarWashCode
        import_id_fields = ('code', 'offer')
        fields = ('code', 'offer', 'created_by', 'updated_by')

    def _check_import_id_fields(self, headers):
        import_id_fields = []
        missing_fields = []
        missing_headers = []

        if self.get_import_id_fields() == ["id"]:
            # this is the default case, so ok if not present
            return

        for field_name in self.get_import_id_fields():
            if field_name not in self.fields:
                missing_fields.append(field_name)
            else:
                import_id_fields.append(self.fields[field_name])

        if missing_fields:
            raise exceptions.FieldError(
                _(
                    "The following fields are declared in 'import_id_fields' but "
                    "are not present in the resource fields: %s"
                    % ", ".join(missing_fields)
                )
            )

        for field in import_id_fields:
            if not headers or field.column_name not in headers:
                # escape to be safe (exception could end up in logs)
                col = escape(field.column_name)
                missing_headers.append(col)
        
        if 'offer' in missing_headers:
            # offer is not a required field
            missing_headers.remove('offer')

        if missing_headers:
            raise exceptions.FieldError(
                _(
                    "The following fields are declared in 'import_id_fields' but "
                    "are not present in the file headers: %s"
                    % ", ".join(missing_headers)
                )
            )
        

class CustomImportForm(ImportExportForm):
    offer = forms.ModelChoiceField(
        queryset=Offer.objects.all(), 
        required=True, 
        empty_label="Select an offer",
        widget=AutocompleteSelect(
            CarWashCode._meta.get_field('offer'),
            admin_site=admin.site
        )
    )

@admin.register(CarWashCode)
class CarWashCodeAdmin(ImportExportModelAdmin, ModelAdmin):
    import_form_class = CustomImportForm
    resource_class = CarWashCodeResource
    list_display = ('code', 'offer', 'used_at', 'created_by', 'updated_by')
    list_filter = ('offer__offer_type',)
    search_fields = ('code', 'offer__name')
    readonly_fields = ('created_by', 'updated_by')
    autocomplete_fields = ('offer',)
    offer_global = None

    def get_import_data_kwargs(self, **kwargs):
        """
        Prepare kwargs for import_data.
        """
        form = kwargs.get("form")
        if form:
            form = kwargs.pop("form")
            try:
                offer = form['offer']
                kwargs['offer'] = offer.value()
                self.offer_global = offer.value()
            except:
                offer = self.offer_global
                kwargs['offer'] = offer
            
            return kwargs
        return kwargs

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = ('payment_intent_id', 'offer', 'amount', 'status', 'created_by', 'updated_by')
    list_filter = ('status', 'created_at')
    search_fields = ('payment_intent_id', 'offer__name')
    raw_id_fields = ('offer', )
    readonly_fields = ('payment_intent_id', 'created_at', 'updated_at', 'created_by', 'updated_by')
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'offer__package__car_wash',
            'created_by',
            'updated_by'
        )

class ProposedCarWashInline(NonrelatedStackedInline):
    model = CarWash
    collapsible = True
    extra = 0
    can_delete = False
    show_change_link = False
    form = CarWashForm
    hide_title = True

    def get_form_queryset(self, obj):
        """
        Gets all nonrelated objects needed for inlines. Method must be implemented.
        """
        proposed_changes = deepcopy(obj.proposed_changes)
        location = proposed_changes.pop('location', None)
        new_location = None
        if location:
            new_location = Point(location['coordinates'][0], location['coordinates'][1], srid=4326)
        
        proposed_changes.pop('images', None)
        proposed_changes.pop('packages', None)
        proposed_changes.pop('amenities', None)
        proposed_changes.pop('operating_hours', None)
        proposed_changes.pop('payment_method', None)
        proposed_changes.pop('payment_handle', None)
        proposed_changes.pop('is_bounty_claim', None)

        queryset = []
        if len(list(proposed_changes.keys())) > 0 or location:
            car_wash_object = self.model(
                **proposed_changes,
                location=new_location,
            )
            queryset.append(car_wash_object)
        qs = FakeQuerySet(queryset)
        return qs

    def save_new_instance(self, parent, instance):
        """
        Extra save method which can for example update inline instances based on current
        main model object. Method must be implemented.
        """
        print("Saving new instance for ProposedCarWashInline", flush=True)
        pass


class ProposedOperatingHoursInline(NonrelatedStackedInline):
    model = CarWashOperatingHours
    collapsible = True
    extra = 0
    can_delete = False
    show_change_link = False
    form = CarWashOperatingHoursForm
    hide_title = True

    def get_form_queryset(self, obj):
        """
        Gets all nonrelated objects needed for inlines. Method must be implemented.
        """
        proposed_changes = deepcopy(obj.proposed_changes)
        operating_hours = proposed_changes.pop('operating_hours', [])

        query_objects = []
        for operating_hour in operating_hours:
            car_wash_operating_hours_object = self.model(
                **operating_hour,
            )
            query_objects.append(car_wash_operating_hours_object)
        qs = FakeQuerySet(query_objects)
        return qs

    def save_new_instance(self, parent, instance):
        """
        Extra save method which can for example update inline instances based on current
        main model object. Method must be implemented.
        """
        pass

class ProposedImagesInline(NonrelatedStackedInline):
    model = CarWashImage
    collapsible = True
    extra = 0
    can_delete = False
    show_change_link = False
    form = CarWashImageForm
    hide_title = True

    def get_form_queryset(self, obj):
        """
        Gets all nonrelated objects needed for inlines. Method must be implemented.
        """
        proposed_changes = deepcopy(obj.proposed_changes)
        images = proposed_changes.pop('images', [])

        query_objects = []
        for image_obj in images:
            car_wash_images_object = self.model(
                **image_obj,
            )
            query_objects.append(car_wash_images_object)
        qs = FakeQuerySet(query_objects)
        return qs

    def save_new_instance(self, parent, instance):
        """
        Extra save method which can for example update inline instances based on current
        main model object. Method must be implemented.
        """
        pass

class ProposedPackagesInline(NonrelatedStackedInline):
    model = CarWashPackage
    collapsible = True
    extra = 0
    can_delete = False
    show_change_link = False
    form = CarWashPackageForm
    hide_title = True

    def get_form_queryset(self, obj):
        """
        Gets all nonrelated objects needed for inlines. Method must be implemented.
        """
        proposed_changes = deepcopy(obj.proposed_changes)
        packages = proposed_changes.pop('packages', [])

        query_objects = []
        for package_obj in packages:
            package_obj.pop('wash_types', [])
            package_obj.pop('id', 0)

            car_wash_packages_object = self.model(
                **package_obj
            )
            query_objects.append(car_wash_packages_object)
        qs = FakeQuerySet(query_objects)
        return qs

    def save_new_instance(self, parent, instance):
        """
        Extra save method which can for example update inline instances based on current
        main model object. Method must be implemented.
        """
        pass

@admin.register(CarWashUpdateRequest)
class CarWashUpdateRequestAdmin(ModelAdmin):
    list_display = ('car_wash', 'submitted_by', 'is_bounty_claim', 'approved', 'rejected', 'reviewed_at', 'created_at', 'updated_at', 'updated_by')
    list_filter = (
        'approved',
        'rejected',
        'payouts_status',
        'is_bounty_claim',
        ('created_at', DateFieldListFilter)
    )
    search_fields = ('car_wash__car_wash_name', 'submitted_by__email', 'submitted_by__username')
    readonly_fields = ('created_by', 'updated_by')
    form = CarWashUpdateRequestForm
    inlines = [ProposedCarWashInline, ProposedOperatingHoursInline, ProposedImagesInline, ProposedPackagesInline]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)