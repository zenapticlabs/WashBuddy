from django.urls import path

from .views import SignUpView, SignInView, VerifyOtpView, UserStatsView, ResetPasswordView

urlpatterns = [
    path('signUpWithOTP/', SignUpView.as_view(), name='sign_up_with_otp'),
    path('signIn/<str:type>/', SignInView.as_view(), name='sign_in_with_otp_or_password_or_google'),
    path('verifyOTP/', VerifyOtpView.as_view(), name='verify_otp'),
    path('resetPassword/', ResetPasswordView.as_view(), name='reset_password'),
    path('userStats/', UserStatsView.as_view(), name='user_stats'),
]