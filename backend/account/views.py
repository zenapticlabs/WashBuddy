from utilities.utils import SupabaseSingleton
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import UserProfile
from .serializers import SignInSerializer, SignUpSerializer, VerifyOtpSerializer, ResetPasswordSerializer
from django.db import transaction
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

class SignUpView(APIView):

    @extend_schema(
        request=SignUpSerializer,
        responses={
            201: OpenApiResponse(
                description='User created successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'message': 'User created successfully'
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description='Bad Request',
                examples=[
                    OpenApiExample(
                        'Validation Error',
                        value={
                            'email': ['This field is required.'],
                            'password': ['Password must be at least 6 characters.']
                        }
                    )
                ]
            ),
            500: OpenApiResponse(
                description='Internal Server Error',
                examples=[
                    OpenApiExample(
                        'Error',
                        value={
                            'error': 'Error message from Supabase'
                        }
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Sign Up Request',
                value={
                    'email': 'user@example.com',
                    'password': 'securepassword123',
                    'first_name': 'John',
                    'last_name': 'Doe'
                },
                request_only=True
            )
        ],
        description='''
        Sign up endpoint that creates a new user account:
        - Creates user in Supabase authentication
        - Creates corresponding Django User
        - Creates UserProfile with metadata
        - Handles password hashing and email verification
        ''',
        summary='Create new user account'
    )
    @transaction.atomic
    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Initialize Supabase client
            supabase_client = SupabaseSingleton.get_instance(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            
            # Prepare user data
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            metadata = {
                'firstName': serializer.validated_data.get('first_name', ''),
                'lastName': serializer.validated_data.get('last_name', '')
            }
            
            # Check if user already exists in Django
            if User.objects.filter(email=email).exists():
                return Response({
                    "error": "User with this email already exists",
                    "code": "EMAIL_EXISTS",
                    "message": "An account with this email already exists. Please sign in instead."
                }, status=status.HTTP_409_CONFLICT)
            
            # Sign up user in Supabase
            response = supabase_client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": metadata
                }
            })
            
            # Check if the user was actually created (not already existing)
            if response.user and len(response.user.identities) == 0:
                return Response({
                    "error": "User with this email already exists",
                    "code": "EMAIL_EXISTS", 
                    "message": "An account with this email already exists. Please sign in instead."
                }, status=status.HTTP_409_CONFLICT)
            
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'email': email,
                    'first_name': metadata.get('firstName', ''),
                    'last_name': metadata.get('lastName', '')
                }
            )

            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'metadata': metadata,
                }
            )
            
            return Response({
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class SignInView(APIView):

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='type',
                type=str,
                location=OpenApiParameter.PATH,
                enum=['otp', 'password', 'google'],
                description='Sign in method type'
            )
        ],
        request=SignInSerializer,
        responses={
            200: {
                'examples': {
                    'otp': {
                        'value': {
                            'message': 'OTP sent'
                        }
                    },
                    'password': {
                        'value': {
                            'message': 'User signed in successfully',
                            'user': {
                                'id': 'string',
                                'email': 'user@example.com',
                                # ...other user fields
                            },
                            'session': {
                                'access_token': 'string',
                                'token_type': 'bearer',
                                'expires_in': 3600,
                                # ...other session fields
                            }
                        }
                    },
                    'google': {
                        'value': {
                            'message': 'Successful',
                            'response': {
                                'url': 'https://accounts.google.com/...'
                            }
                        }
                    }
                }
            },
            400: {
                'description': 'Bad Request',
                'value': {
                    'error': 'Invalid Sign In Method'
                }
            },
            500: {
                'description': 'Internal Server Error',
                'value': {
                    'error': 'Error message'
                }
            }
        },
        examples=[
            OpenApiExample(
                'OTP Request',
                value={'email': 'user@example.com'},
                request_only=True,
            ),
            OpenApiExample(
                'Password Request',
                value={
                    'email': 'user@example.com',
                    'password': 'yourpassword'
                },
                request_only=True,
            )
        ],
        description='''
        Sign in endpoint supporting multiple authentication methods:
        - OTP: Sends a one-time password to email
        - Password: Traditional email/password authentication
        - Google: OAuth sign in with Google
        ''',
        summary='Sign in with multiple methods'
    )
    @transaction.atomic
    def post(self, request, type):
        # Initialize Supabase client
        supabase_client = SupabaseSingleton.get_instance(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        if type == "otp":
            serializer = SignInSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                email = serializer.validated_data['email']
                response = supabase_client.auth.sign_in_with_otp({
                    "email": email,
                    "options": {
                        "email_redirect_to": f"{settings.FRONTEND_BASE_URL}/auth/callback",
                    },
                })
                
                return Response({
                    "message": "OTP sent"
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        elif type == "password":
            serializer = SignUpSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']
                response = supabase_client.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                
                user_object = dict(response.user)
                user_object.pop("identities")

                session_object = dict(response.session)
                session_object.pop("user")
                
                return Response({
                    "message": "User signed in successfully",
                    "user": user_object,
                    "session": session_object
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        elif type == "google":
            try:
                response = supabase_client.auth.sign_in_with_oauth({
                    "provider": "google",
                    "options": {
                        "redirect_to": f"{settings.FRONTEND_BASE_URL}/auth/callback",
                    },
                })

                return Response({
                    "message": "Successful",
                    "response": dict(response)
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response({
                "error": "Invalid Sign In Method"
            }, status=status.HTTP_400_BAD_REQUEST)

    
class VerifyOtpView(APIView):

    @extend_schema(
        request=VerifyOtpSerializer,
        responses={
            200: OpenApiResponse(
                description='OTP verified successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'message': 'OTP verified',
                            'user': {
                                'id': 'string',
                                'email': 'user@example.com',
                                'aud': 'authenticated',
                                'role': 'authenticated',
                                'email_confirmed_at': '2024-01-01T00:00:00.000Z',
                                'phone': '',
                                'last_sign_in_at': '2024-01-01T00:00:00.000Z',
                                'created_at': '2024-01-01T00:00:00.000Z',
                                'updated_at': '2024-01-01T00:00:00.000Z'
                            },
                            'session': {
                                'access_token': 'string',
                                'token_type': 'bearer',
                                'expires_in': 3600,
                                'refresh_token': 'string',
                                'expires_at': 1234567890
                            }
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description='Bad Request',
                examples=[
                    OpenApiExample(
                        'Validation Error',
                        value={
                            'email': ['This field is required.'],
                            'token': ['Invalid OTP token.']
                        }
                    )
                ]
            ),
            500: OpenApiResponse(
                description='Internal Server Error',
                examples=[
                    OpenApiExample(
                        'Error',
                        value={
                            'error': 'Error verifying OTP with Supabase'
                        }
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Verify OTP Request',
                value={
                    'email': 'user@example.com',
                    'token': '123456'
                },
                request_only=True
            )
        ],
        description='''
        Verify OTP endpoint that validates one-time password:
        - Verifies OTP token with Supabase
        - Returns user session on successful verification
        - Handles invalid tokens and expired OTPs
        ''',
        summary='Verify one-time password (OTP)'
    )
    @transaction.atomic
    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Initialize Supabase client
            supabase_client = SupabaseSingleton.get_instance(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            
            # Sign in user in Supabase
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            response = supabase_client.auth.verify_otp({
                "email": email,
                "token": token,
                "type": "email"
            })

            user_object = dict(response.user)
            user_object.pop("identities")

            session_object = dict(response.session)
            session_object.pop("user")
            
            return Response({
                "message": "OTP verified",
                "user": user_object,
                "session": session_object
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserStatsView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        """
        Retrieve user statistics including total car washes, reviews, and offers.
        """
        user = request.user
        user_profile = UserProfile.objects.filter(user=user).first()
        
        if not user_profile:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        stats = {
            "total_car_wash_change_requests": user.car_wash_update_requests.count(),
            "can_claim_bounty": not (user.car_wash_update_requests.filter(created_at__gte=timezone.now() - timezone.timedelta(days=1)).exists()),
            "last_submitted_bounty_time": user.car_wash_update_requests.last().created_at if user.car_wash_update_requests.exists() else None,
            "bounty_limit_override": user_profile.bounty_limit_override
        }
        
        return Response(stats, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):

    @extend_schema(
        request=ResetPasswordSerializer,
        responses={
            200: OpenApiResponse(
                description='Password reset email sent successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'message': 'Password reset email sent successfully'
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description='Bad Request',
                examples=[
                    OpenApiExample(
                        'Validation Error',
                        value={
                            'email': ['This field is required.']
                        }
                    )
                ]
            ),
            500: OpenApiResponse(
                description='Internal Server Error',
                examples=[
                    OpenApiExample(
                        'Error',
                        value={
                            'error': 'Error sending password reset email'
                        }
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Reset Password Request',
                value={
                    'email': 'user@example.com'
                },
                request_only=True
            )
        ],
        description='''
        Password reset endpoint that sends a password reset email:
        - Sends password reset email via Supabase
        - Handles invalid email addresses
        - Returns success message regardless of email existence for security
        ''',
        summary='Send password reset email'
    )
    @transaction.atomic
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Initialize Supabase client
            supabase_client = SupabaseSingleton.get_instance(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            
            # Send password reset email
            email = serializer.validated_data['email']
            response = supabase_client.auth.reset_password_for_email(email, {
                "redirect_to": f"{settings.FRONTEND_BASE_URL}/reset-password",
            })
            
            return Response({
                "message": "Password reset email sent successfully"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
