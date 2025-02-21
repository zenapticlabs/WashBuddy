from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = "Creates a superuser if one does not exist"

    def handle(self, *args, **kwargs):
        User = get_user_model()
        username = os.getenv("ADMIN_USERNAME")
        password = os.getenv("ADMIN_PASSWORD")
        email = os.getenv("ADMIN_EMAIL", "admin@washbuddy.com")

        if not username or not password:
            self.stdout.write(self.style.ERROR("❌ ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment."))
            return

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"✅ Superuser '{username}' created successfully."))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️ Superuser '{username}' already exists."))
