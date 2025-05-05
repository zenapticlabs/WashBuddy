from django.db import models
from django.utils import timezone

from .constants import DEFAULT_STATUS_CHOICES

class DynamicFieldsViewMixin(object):
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()

        fields = None
        if self.request.method == "GET":
            query_fields = self.request.query_params.get("fields", None)

            if query_fields:
                fields = tuple(query_fields.split(","))

        kwargs["context"] = self.get_serializer_context()
        kwargs["fields"] = fields

        return serializer_class(*args, **kwargs)
    

class DynamicFieldsSerializerMixin(object):
    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        # Instantiate the superclass normally
        super(DynamicFieldsSerializerMixin, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields.keys())
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class CustomModelMixin(models.Model):
    """
    Mixin class for creating util details.
    """

    created_by = models.ForeignKey("auth.User", null=True, blank=True,
                                   on_delete=models.CASCADE, related_name="created_by_%(class)s")
    updated_by = models.ForeignKey("auth.User", null=True, blank=True,
                                   on_delete=models.CASCADE, related_name="updated_by_%(class)s")
    created_at = models.DateTimeField(auto_now_add=timezone.now)
    updated_at = models.DateTimeField(auto_now=timezone.now)
    status = models.CharField(max_length=100, choices=DEFAULT_STATUS_CHOICES, default="ACTIVE")

    class Meta:
        abstract = True