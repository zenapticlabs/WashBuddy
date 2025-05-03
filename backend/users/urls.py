from django.urls import path
from . import views

urlpatterns = [
    path('reviews/', views.UserReviewList.as_view(), name='user-review-list'),
    path('reviews/<int:pk>/', views.UserReviewDetail.as_view(), name='user-review-detail'),
]