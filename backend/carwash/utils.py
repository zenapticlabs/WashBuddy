import jwt
import os
import logging
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)

def handle_user_meta_data(authorization_header):
    """
    Extract and validate user metadata and sub from JWT token in request headers
    Returns user_metadata dictionary with user_id added if valid, None otherwise
    """
    
    if not authorization_header:
        return None
        
    try:
        token = authorization_header.split(' ')[1]
        logger.info(token)
        payload = jwt.decode(
            token,
            os.getenv('JWT_SECRET_KEY'),
            algorithms=['HS256'],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        user_metadata = payload.get("user_metadata", {})
        
        if not user_id:
            raise AuthenticationFailed('User ID (sub) not found in token')
            
        user_metadata['user_id'] = user_id
        return user_metadata
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token expired')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid token')
    except Exception as e:
        raise AuthenticationFailed(str(e))
