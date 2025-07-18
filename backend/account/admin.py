from django.contrib import admin

from .models import UserProfile

# Register your models here.

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bounty_limit_override', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('bounty_limit_override', ('created_at', admin.DateFieldListFilter))

