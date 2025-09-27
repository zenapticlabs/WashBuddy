import { CarWashPackage, CarWashResponse } from "@/types/CarServices";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from "@/lib/axios";
import useMediaQuery from "@/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Copy, Check } from "lucide-react";
import { IWashType } from "@/types";
import { getWashTypes } from "@/services/WashType";
import { cn } from "@/lib/utils";
import { useWashTypes } from "@/contexts/WashTypesContext";
import { Car_Wash_Type, CarWashTypes, WashTypes } from "@/utils/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMetaPixel } from "@/hooks/useMetaPixel";


// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface WashPackageProps {
  data: CarWashPackage;
  carWash: CarWashResponse;
}

// Stripe Payment Form Component
const StripePaymentForm = ({ carWashPackage, onSuccess }: { carWashPackage: CarWashPackage, onSuccess: (code: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const metaPixel = useMetaPixel();

  const checkPaymentStatus = async (paymentIntentId: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/carwash/payment-status/${paymentIntentId}/`);
      const status = response.data.status;
      setPaymentStatus(status);

      if (status === 'completed') {
        // Track Purchase for Meta Pixel
        metaPixel.trackPurchase(Number(carWashPackage.price), 'USD');
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
            // Track Purchase for Meta Pixel
            metaPixel.trackPurchase(Number(carWashPackage.price), 'USD');
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

    // Track InitiateCheckout for Meta Pixel
    metaPixel.trackInitiateCheckout();

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href, // Stay on the same page
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {isProcessing ? 'Processing...' : `Pay $${carWashPackage?.offer?.offer_price}`}
      </Button>
    </form>
  );
};

const WashPackage: React.FC<WashPackageProps> = ({ data, carWash }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { washTypes } = useWashTypes();
  const metaPixel = useMetaPixel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [washTypesLoading, setWashTypesLoading] = useState(false);

  const validOffer = () => {
    if (data.offer && data.offer.status === "ACTIVE") {
      const offer = data.offer;
      if (offer.offer_type === "TIME_DEPENDENT") {
        const now = new Date();
        const currentTimeUTC = now.toISOString().substring(11, 16); // Get current time in UTC "HH:mm" format

        // Offer times are already in UTC format, just take HH:mm part
        const startTime = offer.start_time.substring(0, 5); // "HH:mm"
        const endTime = offer.end_time.substring(0, 5); // "HH:mm"

        return currentTimeUTC >= startTime && currentTimeUTC <= endTime;
      } else if (offer.offer_type === "ONE_TIME") {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  const washTypesBySubclass = washTypes.filter((type) => type.category === CarWashTypes[0].value).reduce((acc, washType) => {
    const subclass = washType.subclass;
    if (!acc[subclass]) {
      acc[subclass] = [];
    }
    acc[subclass].push(washType);
    return acc;
  }, {} as Record<string, IWashType[]>);

  useEffect(() => {
    if (showPurchase && !clientSecret) {
      const fetchClientSecret = async () => {
        try {
          const response = await axiosInstance.post(`/api/v1/carwash/create-payment-intent/`, {
            // amount: Number(data.price) * 100, // Convert to cents
            // carWashId: carWash.id,
            // packageName: data.name,
            // carWashName: carWash.car_wash_name,
            offer_id: data.offer?.id
          });
          setClientSecret(response.data.clientSecret);
        } catch (error) {
          console.error('Error fetching client secret:', error);
        }
      };

      fetchClientSecret();
    }
  }, [showPurchase, data.price, clientSecret, carWash, data.name]);

  const handlePaymentSuccess = (code: string) => {
    setCode(code);
    router.push(`/payment/redemption?code=${code}&carWashId=${carWash.id}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setShowPurchase(false);
    setCode(null);
  };

  const handleBuyNowClick = () => {
    if (!user) {
      toast({
        title: "Please login to buy this package",
        description: "You need to be logged in to buy this package",
        variant: "destructive",
        action: <Button variant="destructive" className="border border-white" onClick={() => router.push("/login")}>Login</Button>,
      });
      return;
    }
    setShowPurchase(true);
    // Track AddToCart event for Meta Pixel
    metaPixel.trackAddToCart();
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const packageModalContent = () => {
    return (
      <div className="py-1 overflow-y-auto flex-1">
        {!showPurchase ? (
          <>
            <div className="flex flex-col gap-4">
              {Object.entries(washTypesBySubclass).map(([subclass, types]) => (
                <div key={subclass} className="flex flex-col gap-2 border-b border-neutral-100 pb-4 px-6 ">
                  <div className="text-body-1 font-semibold text-neutral-900">
                    {subclass}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {types.map((washType) => (
                      <div
                        key={washType.id}
                        className="flex flex-col items-center gap-2 w-[100px] py-2 px-2"
                      >
                        {WashTypes.find(type => type.name === washType.name)?.icon ?
                          <Image
                            src={WashTypes.find(type => type.name === washType.name)?.icon as string}
                            alt={washType.name}
                            width={36}
                            height={36}
                            className={`${data.wash_types
                              .map((type: any) => type.id)
                              .includes(Number(washType.id))
                              ? "filter-blue-500"
                              : "filter-neutral-400"
                              }`}
                          />
                          :
                          <div className={cn("w-5 h-5 border-2 rounded-full", data.wash_types
                            .map((type: any) => type.id)
                            .includes(Number(washType.id))
                            ? "border-blue-500"
                            : "border-neutral-400")}></div>
                        }
                        <span className={`text-sm text-center line-clamp-2 ${data.wash_types
                          .map((type: any) => type.id)
                          .includes(Number(washType.id))
                          ? "text-blue-500"
                          : "text-neutral-400"}`}>
                          {washType.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {validOffer() && (
              <div className="flex items-center justify-end my-4 mx-4">
                <Button size="sm" onClick={handleBuyNowClick}>Buy now</Button>
              </div>
            )}
          </>
        ) : (
          <div className="px-6 pb-3">
            <div className="flex justify-between mb-6">
              <div className="flex gap-2 flex-1">
                <Image src={carWash.image_url} alt={carWash.car_wash_name} width={48} height={48} className="rounded-lg" />
                <div className="flex flex-col gap-1">
                  <div className="text-title-1 text-neutral-900">{carWash.car_wash_name}</div>
                  <div className="text-body-2 text-neutral-500">{carWash.formatted_address}</div>
                </div>
              </div>
              <div className="flex flex-col items-end border-l border-neutral-100 pl-4">
                <div className="text-title-1 text-neutral-900">{data.name}</div>
                <div className="text-headline-5 text-neutral-900">${data.offer?.offer_price}</div>
              </div>
            </div>

            {!code && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm carWashPackage={data} onSuccess={handlePaymentSuccess} />
              </Elements>
            )}

            {code && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
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
        )}
      </div>
    )
  }
  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-neutral-100 p-2 rounded-lg flex-shrink-0 w-[150px] cursor-pointer hover:border-accent-blue transition-all duration-300"
      >
        <div className="text-title-2 text-neutral-900">{data.name}</div>
        <div className="flex items-center gap-1 text-headline-5 my-1">
          {validOffer() && (
            <div className="flex items-center gap-1">
              <span className="text-green-500 text-headline-5">${Math.floor(data.offer.offer_price)}</span>
              <span className="text-neutral-500 text-sm line-through">${Math.floor(data.price)}</span>
            </div>
          )}
          {!validOffer() && (
            <span className="text-neutral-900">${Math.floor(data.price)}</span>
          )}
        </div>
        {
          validOffer() && (
            <Button className="bg-badge-green hover:bg-badge-green/80 text-xs text-white w-fit px-2 py-1 rounded-lg">
              ${Math.floor(data.offer?.offer_price)} on WB, buy now!
            </Button>
          )
        }
      </div>

      {!isMobile && (
        <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="sm:max-w-[480px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b border-neutral-100 pb-4 py-4 px-6">
              <DialogTitle className="text-headline-4">
                {showPurchase ? "Your Purchase" : "Wash Types"}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                {showPurchase ? "Complete your purchase for the selected wash package" : "View available wash types in this package"}
              </DialogDescription>
            </DialogHeader>

            {packageModalContent()}
          </DialogContent>
        </Dialog>
      )}

      {isMobile &&

        <Sheet open={isModalOpen} onOpenChange={(check) => setIsModalOpen(check)}>
          <SheetHeader>
            <SheetTitle className="">

            </SheetTitle>
          </SheetHeader>
          <SheetContent
            side="bottom"
            className="p-0 rounded-t-xl flex flex-col max-h-[80vh]">
            <div className="text-headline-4 p-4 border-b border-neutral-100">
              {showPurchase ? "Your Purchase" : "Wash Types"}
            </div>
            <div className="flex-1 overflow-y-auto">
              {packageModalContent()}
            </div>
          </SheetContent>
        </Sheet >
      }
    </>
  );
};

export default WashPackage;
