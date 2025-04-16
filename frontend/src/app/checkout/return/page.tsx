"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

function ReturnPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const paymentIntent = searchParams.get('payment_intent');
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

        if (!paymentIntent || !paymentIntentClientSecret) {
            setStatus('error');
            setMessage('Invalid payment parameters');
            return;
        }

        // Here you would typically verify the payment status with your backend
        // For now, we'll simulate a successful payment
        setTimeout(() => {
            setStatus('success');
            setMessage('Payment successful! Thank you for your purchase.');
        }, 2000);
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="mt-4 text-neutral-600">Processing your payment...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-[640px] mx-auto bg-white rounded-xl p-8 text-center">
                {status === 'success' ? (
                    <div className="text-green-500">
                        <svg
                            className="w-16 h-16 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
                        <p className="text-neutral-600 mb-8">{message}</p>
                    </div>
                ) : (
                    <div className="text-red-500">
                        <svg
                            className="w-16 h-16 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
                        <p className="text-neutral-600 mb-8">{message}</p>
                    </div>
                )}
                <Button
                    onClick={() => router.push('/')}
                    className="w-full"
                >
                    Return to Home
                </Button>
            </div>
        </div>
    );
}

export default function ReturnPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="mt-4 text-neutral-600">Loading...</p>
            </div>
        }>
            <ReturnPageContent />
        </Suspense>
    );
} 