from django import forms
from .models import CarWashImage, CarWashOperatingHours, CarWashPackage, CarWash, CarWashUpdateRequest
from unfold.widgets import UnfoldAdminDecimalFieldWidget
from django.contrib.gis.geos import Point


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
        exclude = ('created_by', 'updated_by', 'created_at', 'updated_at', 'status', 'car_wash', 'wash_types')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.disabled = True

    def is_valid(self):
        is_valid = super().is_valid()
        return True