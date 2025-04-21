"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import axiosInstance from "@/lib/axios";

function PaymentCodeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [carwashCode, setCarwashCode] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const paymentIntent = searchParams.get('payment_intent');
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

        if (!paymentIntent || !paymentIntentClientSecret) {
            setStatus('error');
            setMessage('Invalid payment parameters');
            return;
        }

        const fetchCarwashCode = async () => {
            try {
                const response = await axiosInstance.get(`${window.location.origin}/api/payment/code/?paymentIntent=${paymentIntent}`);
                if (response.data.code) {
                    setCarwashCode(response.data.code);
                    setStatus('success');
                    setMessage('Here is your carwash code. Please keep it safe!');
                } else {
                    throw new Error('No carwash code found');
                }
            } catch (error) {
                console.log(error);
                setStatus('error');
                setMessage('Failed to retrieve carwash code. Please contact support.');
            }
        };

        fetchCarwashCode();
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50">
            <div className="w-[480px] mx-auto bg-white rounded-xl p-8 text-center shadow-sm">
                {status === 'loading' ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="mt-4 text-neutral-600">Retrieving your carwash code...</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="space-y-6">
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
                            <h2 className="text-2xl font-bold mb-4 text-neutral-900">Payment Successful!</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-neutral-600">{message}</p>
                            <div className="bg-neutral-50 p-6 rounded-lg">
                                <p className="text-3xl font-bold text-neutral-900 tracking-wider">{carwashCode}</p>
                            </div>
                        </div>
                        <div className="pt-6">
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="w-full"
                            >
                                Return to Home
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-red-500 space-y-6">
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
                        <h2 className="text-2xl font-bold mb-4 text-neutral-900">Error</h2>
                        <p className="text-neutral-600">{message}</p>
                        <div className="pt-6">
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="w-full"
                            >
                                Return to Home
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentCodePage() {
    return (
        <Suspense fallback={
            <div className="absolute inset-0 z-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        }>
            <PaymentCodeContent />
        </Suspense>
    );
} 