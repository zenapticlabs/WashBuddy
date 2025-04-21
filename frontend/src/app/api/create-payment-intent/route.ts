import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
    try {
        const { amount, carWashId, packageName, carWashName } = await request.json();
        
        // Get the authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid authorization header' },
                { status: 401 }
            );
        }

        // Extract the token
        const token = authHeader.split(' ')[1];
        
        // Verify the token with Supabase
        const supabase = createClientComponentClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: user.id,
                carWashId,
                packageName,
            },
            description: `${packageName} at ${carWashName}`,
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Error creating payment intent' },
            { status: 500 }
        );
    }
} 