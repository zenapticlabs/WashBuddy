from rest_framework import viewsets
from .models import CarWash
from .serializers import CarWashSerializer

class CarWashViewSet(viewsets.ModelViewSet):
    queryset = CarWash.objects.all()
    serializer_class = CarWashSerializer