import stripe
from django.conf import settings
from rest_framework.views import APIView
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiResponse 
from .models import CarWashCode, CarWashCodeUsage, Payment

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Stripe Webhook Handler",
        description="Handles Stripe payment webhook events",
        responses={
            200: OpenApiResponse(description="Webhook processed successfully"),
            400: OpenApiResponse(description="Invalid webhook payload")
        }
    )
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )

            # Handle the event
            event_dict = event.to_dict()
            if event_dict['type'] == 'payment_intent.succeeded':
                payment_intent = event_dict['data']['object']
                handle_successful_payment(payment_intent)
            
            elif event_dict['type'] == 'payment_intent.payment_failed':
                payment_intent = event_dict['data']['object']
                handle_failed_payment(payment_intent)

            return HttpResponse(status=200)

        except ValueError as e:
            print(f"Invalid payload: {e}")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            print(f"Invalid signature: {e}")
            return HttpResponse(status=400)

def handle_successful_payment(payment_intent):
    """Handle successful payment logic"""
    try:
        payment_object = Payment.objects.get(
            payment_intent_id=payment_intent["id"]
        )

        codes = CarWashCode.objects.filter(
            offer=payment_object.offer
        ).exclude(
            usages__user_metadata__email=payment_object.metadata.get('user_metadata').get('email'),
        )
        
        if not codes.exists():
            print("No available codes for this offer", flush=True)
        
        code = codes.first()
        
        # Update payment status
        payment_object.carwash_code = code
        payment_object.status = 'completed'
        payment_object.save()

        # Mark the code as used
        CarWashCodeUsage.objects.create(
            code=code, 
            user_metadata=payment_object.metadata.get('user_metadata'),
            used_at=payment_object.created_at
        )

    except Exception as e:
        print(f"Error processing payment: {e}", flush=True)

def handle_failed_payment(payment_intent):
    """Handle failed payment logic"""
    try:
        payment_object = Payment.objects.get(
            payment_intent_id=payment_intent["id"]
        )
        error_message = None
        if payment_intent.last_payment_error:
            error_message = payment_intent['last_payment_error'].get('message', 'Payment failed')
        
        # Update payment status
        payment_object.status = 'failed'
        payment_object.error_message = error_message
        payment_object.save()

    except Exception as e:
        print(f"Error processing failed payment: {e}")