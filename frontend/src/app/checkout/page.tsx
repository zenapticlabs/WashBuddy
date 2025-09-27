"use client";

import Topbar from "@/components/pages/main/Topbar";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import VenmoIcon from "@/assets/payment-icons/venmo.svg";
import PayPalIcon from "@/assets/payment-icons/paypal.svg";
import StripeIcon from "@/assets/payment-icons/stripe.svg";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSearchParams } from "next/navigation";
import { getCarwashById } from "@/services/CarwashService";
import { CarWashPackage, CarWashResponse } from "@/types/CarServices";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Stripe Payment Form Component
const StripePaymentForm = ({ carWashPackage }: { carWash: CarWashResponse, carWashPackage: CarWashPackage | null }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const analytics = useAnalytics();
    const metaPixel = useMetaPixel();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            analytics.track('payment_initiated', { 
                package_id: carWashPackage?.id,
                package_name: carWashPackage?.name,
                price: carWashPackage?.price,
                payment_method: 'stripe'
            });

            // Track InitiateCheckout for Meta Pixel
            metaPixel.trackInitiateCheckout();

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/return`,
                },
            });

            if (error) {
                analytics.track('payment_failed', { 
                    package_id: carWashPackage?.id,
                    error: error.message,
                    payment_method: 'stripe'
                });
                setError(error.message || 'An error occurred');
            } else {
                // Track Purchase for Meta Pixel on successful payment
                metaPixel.trackPurchase(carWashPackage?.price || 0, 'USD');
            }
        } catch (error: any) {
            analytics.track('payment_error', { 
                package_id: carWashPackage?.id,
                error: error.message,
                payment_method: 'stripe'
            });
            setError(error?.message || 'An unexpected error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full"
            >
                {isProcessing ? 'Processing...' : `Pay $${carWashPackage?.price}`}
            </Button>
        </form>
    );
};

const MainContent = () => {
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [carWash, setCarWash] = useState<CarWashResponse | null>(null);
    const [carWashPackage, setCarWashPackage] = useState<CarWashPackage | null>(null);
    const [carWashFetchLoading, setCarWashFetchLoading] = useState(false);
    const searchParams = useSearchParams();
    const carWashId = searchParams.get('carWashId');
    const packageId = searchParams.get('packageId');
    const analytics = useAnalytics();
    const metaPixel = useMetaPixel();

    useEffect(() => {
        if (carWashId && packageId) {
            setCarWashFetchLoading(true);
            getCarwashById(carWashId).then((data: CarWashResponse) => {
                setCarWash(data);
                setCarWashPackage(data?.packages.find((p: CarWashPackage) => p.id === parseInt(packageId)) || null);
                setCarWashFetchLoading(false);
            }).catch(() => {
                setCarWashFetchLoading(false);
            });
        }
    }, [carWashId, packageId, analytics]);

    // Fetch client secret when component mounts
    useEffect(() => {
        const fetchClientSecret = async () => {
            try {
                const response = await fetch('/api/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: Number(carWashPackage?.price) * 100, // Convert to cents
                    }),
                });
                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error('Error fetching client secret:', error);
            }
        };

        if (carWashPackage) {
            fetchClientSecret();
        }
    }, [carWashPackage]);

    return (
        <>
            <div className="flex flex-col h-screen bg-neutral-50">
                <Topbar />
                <div className="flex flex-col h-[calc(100vh)] bg-neutral-50 overflow-y-auto">
                    {carWash && !carWashFetchLoading && (
                        <div className="w-[640px] mx-auto bg-white rounded-xl my-4">
                            <div className="text-headline-4 text-neutral-900 py-4 px-6 border-b border-neutral-50">
                                Checkout
                            </div>
                            <div className="flex justify-between p-4 border-b border-neutral-100">
                                <div className="flex gap-2 flex-1">
                                    <Image src={carWash?.image_url} alt={carWash.car_wash_name} className="rounded-lg w-12 h-12" width={100} height={100} />
                                    <div className="flex flex-col gap-1">
                                        <div className="text-title-1 text-neutral-900">{carWash.car_wash_name}</div>
                                        <div className="text-body-2 text-neutral-500">{carWash.formatted_address}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end border-l border-neutral-100 pl-4">
                                    <div className="text-title-1 text-neutral-900">{carWashPackage?.name}</div>
                                    <div className="text-headline-5 text-neutral-900">${carWashPackage?.price}</div>
                                </div>
                            </div>
                            <div className="p-4">
                                <RadioGroup
                                    defaultValue="stripe"
                                    onValueChange={(value) => {
                                        setPaymentMethod(value);
                                        analytics.track('payment_method_selected', { 
                                            payment_method: value,
                                            package_id: carWashPackage?.id,
                                            package_name: carWashPackage?.name
                                        });
                                    }}
                                >
                                    <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2">
                                        <RadioGroupItem value="venmo" id="r1" />
                                        <Label htmlFor="r1" className="flex items-center gap-2 cursor-pointer">
                                            <Image src={VenmoIcon} alt="Venmo" className="w-12 h-12" width={100} height={100} />
                                            Venmo
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2">
                                        <RadioGroupItem value="paypal" id="r2" />
                                        <Label htmlFor="r2" className="flex items-center gap-2 cursor-pointer">
                                            <Image src={PayPalIcon} alt="PayPal" className="w-12 h-12" width={100} height={100} />
                                            PayPal
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2">
                                        <RadioGroupItem value="stripe" id="r3" />
                                        <Label htmlFor="r3" className="flex items-center gap-2 cursor-pointer">
                                            <Image src={StripeIcon} alt="Stripe" className="w-12 h-12" width={100} height={100} />
                                            Stripe
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {paymentMethod === 'stripe' && clientSecret && (
                                    <div className="mt-4">
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <StripePaymentForm carWash={carWash} carWashPackage={carWashPackage} />
                                        </Elements>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {carWashFetchLoading && (
                        <div className="w-[640px] mx-auto bg-white rounded-xl my-4">
                            <div className="text-headline-4 text-neutral-900 py-4 px-6 border-b border-neutral-50">
                                Loading...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const Page: React.FC = () => {
    return (
        <Suspense
            fallback={
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            }
        >
            <MainContent />
        </Suspense>
    );
};

export default Page;
