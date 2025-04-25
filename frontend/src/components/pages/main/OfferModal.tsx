import { CarWashPackage, CarWashResponse, ICarOffer } from "@/types/CarServices";
import { WashTypes } from "@/utils/constants";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from "@/lib/axios";
import { Badge } from "@/components/ui/badge";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface OfferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: ICarOffer;
}

// Stripe Payment Form Component
const StripePaymentForm = ({ carOffer, onSuccess }: { carOffer: ICarOffer, onSuccess: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/code`,
                },
            });

            if (error) {
                setError(error.message || 'An error occurred');
            } else {
                onSuccess();
            }
        } catch (err: any) {
            setError(err?.message || 'An unexpected error occurred');
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
                {isProcessing ? 'Processing...' : `Pay $${carOffer.offer_price}`}
            </Button>
        </form>
    );
};

const OfferModal: React.FC<OfferModalProps> = ({ open, onOpenChange, data }) => {
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [showStripeForm, setShowStripeForm] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const handleClose = () => {
        setShowConfirmation(true);
        setShowStripeForm(false);
        onOpenChange(false);
    }
    const handleConfirmPurchase = async () => {
        setShowConfirmation(false);
        setShowStripeForm(true);

        try {
            // Create payment intent
            const response = await axiosInstance.post(`${window.location.origin}/api/create-payment-intent`, {
                offerId: data.id,
                amount: Number(data.offer_price) * 100,
                carWashId: data.car_wash_id,
                packageName: data.name,
            });
            setClientSecret(response.data.clientSecret);
        } catch (error) {
            console.error('Error creating payment intent:', error);
        }
    };

    const handlePaymentSuccess = () => {
        // Handle successful payment
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b border-neutral-100 pb-4 py-4 px-6">
                    <DialogTitle className="text-headline-4">
                        Do you want to purchase this offer?
                    </DialogTitle>
                </DialogHeader>

                <div className="py-1 overflow-y-auto flex-1 px-4">
                    {showConfirmation && (
                        <div className="flex flex-col gap-6 pb-2">
                            <div className="text-center ">
                                <div className="flex justify-center gap-4">
                                    <Button className="w-full" variant="outline" onClick={handleClose}>
                                        No, Cancel
                                    </Button>
                                    <Button className="w-full" onClick={handleConfirmPurchase}>
                                        Yes, Continue to Payment
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showStripeForm && clientSecret && (
                        <div className="mt-4">
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripePaymentForm
                                    carOffer={data}
                                    onSuccess={handlePaymentSuccess}
                                />
                            </Elements>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OfferModal;
