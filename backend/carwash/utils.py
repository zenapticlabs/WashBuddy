import jwt
import os
from rest_framework.exceptions import AuthenticationFailed

def handle_user_meta_data(authorization_header):
    """
    Extract and validate user metadata from JWT token in request headers
    Returns user metadata dictionary if valid, None otherwise
    """
    
    if not authorization_header:
        return None
        
    try:
        token = authorization_header.split(' ')[1]
        payload = jwt.decode(
            token,
            os.getenv('JWT_SECRET_KEY'),
            algorithms=['HS256'],
            audience="authenticated"
        )
        user_metadata = payload.get("user_metadata", {})
        return user_metadata
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token expired')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid token')
    except Exception as e:
        raise AuthenticationFailed(str(e))
