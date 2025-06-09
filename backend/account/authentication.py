# auth/supabase_authentication.py

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(
                token,
                os.getenv('JWT_SECRET_KEY'),
                algorithms=['HS256'],
                audience="authenticated"
            )

            email = payload.get("email", None)
            
            if not email:
                raise AuthenticationFailed('User email not found in token')
                
            user = User.objects.get(email=email)

            return (user, None)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token")
        except Exception as e:
            raise AuthenticationFailed(str(e))
