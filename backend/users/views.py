from rest_framework import generics, permissions
from carwash.models import CarWashReview
from .serializers import UserReviewListSerializer
from carwash import utils

class UserReviewList(generics.ListAPIView):
    serializer_class = UserReviewListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user_metadata = utils.handle_user_meta_data(self.request.headers.get("Authorization"))
        if not user_metadata:
            raise permissions.PermissionDenied("Invalid user metadata")
            
        return CarWashReview.objects.filter(user_id=user_metadata.get('user_id'))

class UserReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserReviewListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user_metadata = utils.handle_user_meta_data(self.request.headers.get("Authorization"))
        if not user_metadata:
            raise permissions.PermissionDenied("Invalid user metadata")
            
        return CarWashReview.objects.filter(user_id=user_metadata.get('user_id'))