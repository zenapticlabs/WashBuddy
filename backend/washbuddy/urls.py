"""
URL configuration for washbuddy project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'Washbuddy Admin'
admin.site.index_title = 'Washbuddy'
admin.site.site_title = 'Washbuddy Admin'

def health_check(request):
    return JsonResponse({"status": "ok"}, status=200)

urlpatterns = [
    path("", health_check, name="health-check"),
    path('admin/', admin.site.urls),
    path('api/v1/', include([
        path("carwash/", include("carwash.urls")),
        path("users/", include("users.urls")),
        path("accounts/", include("account.urls"))
    ])),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path('select2/', include('django_select2.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)