from django.db import models
from utilities.mixins import CustomModelMixin
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(CustomModelMixin):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    metadata = models.JSONField()
    bounty_limit_override = models.BooleanField(default=False, help_text="Override the bounty limit for this user.")

    def __str__(self):
        return self.user.email

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"