from rest_framework import generics, permissions
from carwash.models import CarWashReview
from .serializers import UserReviewListSerializer
from carwash import utils

class UserReviewList(generics.ListAPIView):
    serializer_class = UserReviewListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CarWashReview.objects.filter(user=self.request.user)

class UserReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserReviewListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):        
        return CarWashReview.objects.filter(user=self.request.user)