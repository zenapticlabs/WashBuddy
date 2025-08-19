import jwt
import os
import logging
from rest_framework.exceptions import AuthenticationFailed
import requests
from django.conf import settings

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

class FakeQuerySet:
    def __init__(self, instances):
        self._instances = instances
        self.ordered = False

    def __iter__(self):
        return iter(self._instances)

    def __len__(self):
        return len(self._instances)

    def order_by(self, *args, **kwargs):
        return self  

    def __getitem__(self, item):
        return self._instances[item]
    
def getLocationFromCoordinates(latitude, longitude):

    url = f"https://api.radar.io/v1/geocode/reverse?coordinates={latitude},{longitude}"

    headers = {
        'Authorization': settings.PUBLIC_RADAR_API_KEY
    }

    response = requests.request("GET", url, headers=headers, data={})

    return response.json()


def save_location_information(obj, location_information):
    """
    Save location information to the CarWash instance.
    """
    if location_information.get('street'):
        obj.street = location_information['street']
    if location_information.get('city'):
        obj.city = location_information['city']
    if location_information.get('state'):
        obj.state = location_information['state']
    if location_information.get('stateCode'):
        obj.state_code = location_information['stateCode']
    if location_information.get('postalCode'):
        obj.postal_code = location_information['postalCode']
    if location_information.get('country'):
        obj.country = location_information['country']
    if location_information.get('countryCode'):
        obj.country_code = location_information['countryCode']
    if location_information.get('formattedAddress'):
        obj.formatted_address = location_information['formattedAddress']

    obj.save()
    return obj