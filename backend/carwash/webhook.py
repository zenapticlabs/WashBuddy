import stripe
from django.conf import settings
from rest_framework.views import APIView
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiResponse 
from .models import CarWashCode, Payment
from django.core.mail import send_mail
from django.template.loader import render_to_string

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
            offer=payment_object.offer,
            user__isnull=True
        )
        
        if not codes.exists():
            print("No available codes for this offer", flush=True)
        
        code = codes.first()
        
        # Update payment status
        payment_object.carwash_code = code
        payment_object.status = 'completed'
        payment_object.save()

        # Mark the code as used
        code.user = payment_object.user
        code.used_at = payment_object.created_at
        code.save()

        car_wash = payment_object.offer.package.car_wash
        # Send email to user with the code
        html_message = render_to_string(
            'wash_code_purchase.html',
            {
                "car_wash_name": car_wash.car_wash_name,
                "car_wash_address": f"{car_wash.formatted_address}, {car_wash.city}, {car_wash.state} {car_wash.state_code}",
                "car_wash_lat": car_wash.location.y if car_wash.location else None,
                "car_wash_lng": car_wash.location.x if car_wash.location else None,
                "radar_publishable_key": settings.RADAR_PUBLISHABLE_KEY,
                "car_wash_image_url": car_wash.image_url,
                "wash_code": code.code,
            }
        )
        send_mail(
            subject="🎉 Your WashBuddy Deal is Ready!",
            message="Your WashBuddy Deal is Ready! Redeem your code now!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[payment_object.user.email],
            html_message=html_message,
            fail_silently=False,
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