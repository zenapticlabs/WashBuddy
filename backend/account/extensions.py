from drf_spectacular.extensions import OpenApiAuthenticationExtension

class SupabaseAuthScheme(OpenApiAuthenticationExtension):
    target_class = 'account.authentication.SupabaseJWTAuthentication'
    name = 'BearerAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
        }
