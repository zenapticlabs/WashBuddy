from django import forms
from .models import CarWashImage, CarWashOperatingHours, CarWashPackage, CarWash, CarWashUpdateRequest, Offer
from unfold.widgets import UnfoldAdminDecimalFieldWidget
from django.contrib.gis.geos import Point
from django_select2.forms import ModelSelect2Widget

class CarWashUpdateRequestForm(forms.ModelForm):

    class Meta:
        model = CarWashUpdateRequest
        exclude = ('proposed_changes', )

class CarWashForm(forms.ModelForm):
    latitude = forms.FloatField(required=False, widget=UnfoldAdminDecimalFieldWidget())
    longitude = forms.FloatField(required=False, widget=UnfoldAdminDecimalFieldWidget())

    class Meta:
        model = CarWash
        exclude = ('created_by', 'updated_by', 'created_at', 'updated_at', 'status', 'location')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.disabled = True
        if self.instance and self.instance.location:
            self.fields['latitude'].initial = self.instance.location.y
            self.fields['longitude'].initial = self.instance.location.x
    
    def is_valid(self):
        is_valid = super().is_valid()
        return True

class CarWashOperatingHoursForm(forms.ModelForm):

    class Meta:
        model = CarWashOperatingHours
        exclude = ('created_by', 'updated_by', 'created_at', 'updated_at', 'status', 'car_wash')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.disabled = True

    def is_valid(self):
        is_valid = super().is_valid()
        return True
    
class CarWashImageForm(forms.ModelForm):

    class Meta:
        model = CarWashImage
        exclude = ('created_by', 'updated_by', 'created_at', 'updated_at', 'status', 'car_wash')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.disabled = True

    def is_valid(self):
        is_valid = super().is_valid()
        return True
    
class CarWashPackageForm(forms.ModelForm):

    class Meta:
        model = CarWashPackage
        exclude = ('created_by', 'updated_by', 'created_at', 'updated_at', 'status', 'car_wash')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.disabled = True

    def is_valid(self):
        is_valid = super().is_valid()
        return True

class OfferForm(forms.ModelForm):
    car_wash = forms.ModelChoiceField(
        queryset=CarWash.objects.all(),
        required=False,
        label='Car Wash - Search by Name, Address, City, State, Country or Formatted Address',
        widget=ModelSelect2Widget(
            model=CarWash,
            search_fields=['car_wash_name__icontains', 'street__icontains', 'city__icontains', 'state__icontains', 'country__icontains', 'formatted_address__icontains'],
        )
    )

    class Meta:
        model = Offer
        fields = ['car_wash', 'package', 'name', 'description', 'offer_price', 'offer_type', 'start_time', 'end_time', 'radius_miles']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['package'].queryset = CarWashPackage.objects.none()

        if 'car_wash' in self.data:
            try:
                car_wash_id = int(self.data.get('car_wash'))
                self.fields['package'].queryset = CarWashPackage.objects.filter(car_wash_id=car_wash_id)
            except (ValueError, TypeError):
                pass
        elif self.instance.pk:
            self.fields['package'].queryset = CarWashPackage.objects.filter(car_wash=self.instance.package.car_wash)