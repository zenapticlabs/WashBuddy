import { CarWashResponse, ICarOffer } from "@/types/CarServices";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from "@/lib/axios";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import { SheetContent } from "@/components/ui/sheet";
import { Copy, Check } from "lucide-react";
import { getCarwashById } from "@/services/CarwashService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useMetaPixel } from "@/hooks/useMetaPixel";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface OfferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: ICarOffer;
}

// Stripe Payment Form Component
const StripePaymentForm = ({ carOffer, onSuccess }: { carOffer: ICarOffer, onSuccess: (code: string) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    const checkPaymentStatus = async (paymentIntentId: string) => {
        try {
            const response = await axiosInstance.get(`/api/v1/carwash/payment-status/${paymentIntentId}/`);
            const status = response.data.status;
            setPaymentStatus(status);

            if (status === 'completed') {
                onSuccess(response.data.carwash_code);
            } else if (status === 'failed') {
                setError(response.data.error_message || 'Payment failed');
            }
            // For 'pending' status, implement polling
            else if (status === 'pending') {
                // Poll every 2 seconds for up to 30 seconds
                let attempts = 0;
                const maxAttempts = 15;
                const pollInterval = setInterval(async () => {
                    attempts++;
                    const pollResponse = await axiosInstance.get(`/api/v1/carwash/payment-status/${paymentIntentId}/`);
                    if (pollResponse.data.status === 'completed') {
                        clearInterval(pollInterval);
                        setPaymentStatus('completed');
                        onSuccess(pollResponse.data.carwash_code);
                    } else if (pollResponse.data.status === 'failed') {
                        clearInterval(pollInterval);
                        setPaymentStatus('failed');
                        setError(pollResponse.data.error_message || 'Payment failed');
                    } else if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        setError('Payment status check timed out. Please check your payment status later.');
                    }
                }, 2000);
            }
        } catch (err) {
            console.error('Error checking payment status:', err);
            setError('Failed to check payment status');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe has not been initialized');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const { error: submitError, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
                confirmParams: {
                    return_url: window.location.href,
                },
            });

            if (submitError) {
                setError(submitError.message || 'An error occurred during payment');
                return;
            }

            if (paymentIntent) {
                // Check the payment status using the payment intent ID
                await checkPaymentStatus(paymentIntent.id);
            } else {
                setError('Could not process payment. Please try again.');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err?.message || 'An unexpected error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-2">
            <PaymentElement />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {paymentStatus && paymentStatus !== 'completed' && (
                <div className={`text-sm ${paymentStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                    Payment status: {paymentStatus}
                </div>
            )}
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
    const router = useRouter();
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [showStripeForm, setShowStripeForm] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [code, setCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [carWash, setCarWash] = useState<CarWashResponse | null>(null);
    const [carwashLoading, setCarwashLoading] = useState(false);
    const [carWashPackage, setCarWashPackage] = useState<any>(null);
    const [stripeFormLoading, setStripeFormLoading] = useState(false);
    const { user } = useAuth();
    const metaPixel = useMetaPixel();
    
    useEffect(() => {
        const getCarWash = async () => {
            setCarwashLoading(true);
            const response = await getCarwashById(data.car_wash_id.toString());
            setCarWash(response);
            setCarWashPackage(response.packages.find((p: any) => p.id === data.package_id));
            setCarwashLoading(false);
        }

        getCarWash();
    }, [code])

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    const handleClose = () => {
        setShowConfirmation(true);
        setShowStripeForm(false);
        setCode(null);
        onOpenChange(false);
    }

    const handleConfirmPurchase = async () => {
        if (!user) {
            toast({
                title: "Please login to purchase this offer",
                description: "Login to purchase this offer and earn 25 points",
                variant: "destructive",
                action: <Button variant="destructive" className="border border-white" onClick={() => router.push("/login")}>Login</Button>
            })
            return;
        }

        setShowConfirmation(false);
        setShowStripeForm(true);
        setStripeFormLoading(true);

        // Track InitiateCheckout event for Meta Pixel
        metaPixel.trackInitiateCheckout();

        try {
            const response = await axiosInstance.post(`/api/v1/carwash/create-payment-intent/`, {
                offer_id: data.id
            });
            setClientSecret(response.data.clientSecret);
        } catch (error) {
            console.error('Error creating payment intent:', error);
        } finally {
            setStripeFormLoading(false);
        } 
    };

    const handlePaymentSuccess = (code: string) => {
        setCode(code);
        // Track Purchase event for Meta Pixel with the offer price
        metaPixel.trackPurchase(Number(data.offer_price), 'USD');
        router.push(`/payment/redemption?code=${code}&carWashId=${carWash?.id}`);
    };

    const handleCopyCode = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const mainContent = () => {
        return (
            <div className="py-1 overflow-y-auto flex-1 px-4">
                {showConfirmation && (
                    <div className="flex flex-col gap-6 pb-2">
                        <div className="text-center">
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
                {stripeFormLoading && (
                    <div className="my-2">
                        <div className="text-center">
                            <div className="text-title-1 text-neutral-900">Processing Payment...</div>
                        </div>
                    </div>
                )}

                {showStripeForm && clientSecret && !code && (
                    <div className="mt-4">
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripePaymentForm
                                carOffer={data}
                                onSuccess={handlePaymentSuccess}
                            />
                        </Elements>
                    </div>
                )}

                {code && !carwashLoading && (
                    <div className="pb-4 rounded-lg">
                        <div className="flex justify-between mb-6">
                            <div className="flex gap-2 flex-1">
                                <Image
                                    src={carWash?.image_url || ""}
                                    alt={carWash?.car_wash_name || ""}
                                    width={64}
                                    height={64}
                                    className="rounded-lg w-16 h-16 object-cover"
                                />
                                <div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-title-1 text-neutral-900">{carWash?.car_wash_name}</div>
                                        <div className="text-body-2 text-neutral-500">{carWash?.formatted_address}</div>
                                    </div>
                                    <div className="flex flex-col mt-4">
                                        <div className="text-title-1 text-neutral-900">{data.name}</div>
                                        <div className="text-headline-5 text-neutral-900">
                                            <span className="line-through">${carWashPackage?.price}</span>
                                            <span className="text-green-600 ml-2">${data.offer_price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="text-green-600 font-semibold mb-2">Payment Successful!</div>
                        <div className="text-sm text-neutral-600 mb-4">Here is your carwash code:</div>
                        <div className="bg-white p-4 rounded-lg border border-green-200 relative">
                            <div className="text-2xl font-bold text-center tracking-wider">{code}</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                                onClick={handleCopyCode}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4 text-neutral-500" />
                                )}
                            </Button>
                        </div>
                        <div className="text-xs text-neutral-500 mt-2 text-center">Please keep this code safe and show it at the carwash</div>

                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {!isMobile ? (
                <Dialog open={open} onOpenChange={handleClose}>
                    <DialogContent className="sm:max-w-[480px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader className="border-b border-neutral-100 pb-4 py-4 px-6">
                            <DialogTitle className="text-headline-4">
                                {code ? "Purchase Successful!" : "Do you want to purchase this offer?"}
                            </DialogTitle>
                        </DialogHeader>

                        {mainContent()}
                    </DialogContent>
                </Dialog>
            ) : (
                <Sheet open={open} onOpenChange={handleClose}>
                    <SheetContent
                        side="bottom"
                        className="p-0 rounded-t-xl max-h-[80vh] flex flex-col">
                        <SheetTitle className="text-headline-4 p-4 border-b border-neutral-100 flex-shrink-0">
                            {code ? "Purchase Successful!" : "Do you want to purchase this offer?"}
                        </SheetTitle>
                        <div className="flex-1 overflow-y-auto touch-auto overscroll-contain">
                            {mainContent()}
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </>
    );
};

export default OfferModal;
