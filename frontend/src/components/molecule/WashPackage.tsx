import { CarWashPackage, CarWashResponse } from "@/types/CarServices";
import { WashTypes } from "@/utils/constants";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from "@/lib/axios";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface WashPackageProps {
  data: CarWashPackage;
  carWash: CarWashResponse;
}

const washTypesBySubclass = WashTypes.reduce((acc, washType) => {
  const subclass = washType.subclass;
  if (!acc[subclass]) {
    acc[subclass] = [];
  }
  acc[subclass].push(washType);
  return acc;
}, {} as Record<string, typeof WashTypes>);

// Stripe Payment Form Component
const StripePaymentForm = ({ carWashPackage, onSuccess }: { carWashPackage: CarWashPackage, onSuccess: () => void }) => {
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
    } catch (err) {
      setError('An unexpected error occurred');
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

const WashPackage: React.FC<WashPackageProps> = ({ data, carWash }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  useEffect(() => {
    console.log(isModalOpen);
  }, [isModalOpen]);

  useEffect(() => {
    if (showPurchase && !clientSecret) {
      const fetchClientSecret = async () => {
        try {
          const response = await axiosInstance.post(`${window.location.origin}/api/create-payment-intent`, {
            amount: Number(data.price) * 100, // Convert to cents
            carWashId: carWash.id,
            packageName: data.name,
            carWashName: carWash.car_wash_name
          });
          setClientSecret(response.data.clientSecret);
        } catch (error) {
          console.error('Error fetching client secret:', error);
        }
      };

      fetchClientSecret();
    }
  }, [showPurchase, data.price, clientSecret, carWash, data.name]);

  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    setShowPurchase(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setShowPurchase(false);
  };

  const handleBuyNowClick = () => {
    setShowPurchase(true);
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-neutral-100 p-2 rounded-lg flex-shrink-0 w-[150px] cursor-pointer hover:border-accent-blue transition-all duration-300"
      >
        <div className="text-title-2 text-neutral-900">{data.name}</div>
        <div className="flex items-center gap-1 text-headline-5 my-1">
          <span className="text-neutral-900">${data.price}</span>
        </div>
      </div>

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

          <div className="px-6 py-4 overflow-y-auto flex-1">
            {!showPurchase ? (
              <>
                <div className="flex flex-col gap-4">
                  {Object.entries(washTypesBySubclass).map(([subclass, types]) => (
                    <div key={subclass} className="flex flex-col gap-2">
                      <div className="text-body-2 font-semibold text-neutral-900">
                        {subclass}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {types.map((washType) => (
                          <div
                            key={washType.id}
                            className="flex flex-col items-center gap-1"
                          >
                            <Image
                              src={washType.icon}
                              alt={washType.name}
                              width={24}
                              height={24}
                              className={`${data.wash_types
                                .map((type: any) => type.id)
                                .includes(Number(washType.id))
                                ? "text-blue-500 opacity-100"
                                : "text-gray-300 opacity-30"
                                }`}
                            />
                            <span className="text-xs text-neutral-600 text-center max-w-[80px] line-clamp-2">
                              {washType.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end mt-4">
                  <Button size="sm" onClick={handleBuyNowClick}>Buy now</Button>
                </div>
              </>
            ) : (
              <>
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
                    <div className="text-headline-5 text-neutral-900">${data.price}</div>
                  </div>
                </div>

                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm carWashPackage={data} onSuccess={handlePaymentSuccess} />
                  </Elements>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WashPackage;
