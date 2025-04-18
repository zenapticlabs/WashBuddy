import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
});

export async function GET(
    request: Request,
    context: { params: Promise<{ payment_intent: string }> }
) {
    const { payment_intent } = await context.params;
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

        if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json(
                { error: 'Payment not successful' },
                { status: 400 }
            );
        }

        const carwashCode = generateCarwashCode(paymentIntent.metadata.carWashId);


        return NextResponse.json({ code: carwashCode });
    } catch (error) {
        console.error('Error retrieving carwash code:', error);
        return NextResponse.json(
            { error: 'Error retrieving carwash code' },
            { status: 500 }
        );
    }
}

function generateCarwashCode(carWashId: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${carWashId.slice(0, 3)}${timestamp}${random}`;
} 