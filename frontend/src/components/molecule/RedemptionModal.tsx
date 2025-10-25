"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CarWashResponse } from "@/types/CarServices";
import { Copy, Check, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCarwashById } from "@/services/CarwashService";
import { RadarMap } from "@/components/organism/RadarMap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RedemptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  carWashId: string;
}

export function RedemptionModal({ open, onOpenChange, code, carWashId }: RedemptionModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [carWash, setCarWash] = useState<CarWashResponse | null>(null);

  useEffect(() => {
    const fetchCarWashDetails = async () => {
      if (carWashId) {
        try {
          const response = await getCarwashById(carWashId);
          setCarWash(response);
        } catch (error) {
          console.error("Error fetching car wash details:", error);
        }
      }
    };

    if (open) {
      fetchCarWashDetails();
    }
  }, [carWashId, open]);

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code copied!",
        description: "The wash code has been copied to your clipboard.",
      });
    }
  };

  const handleGetDirections = () => {
    if (carWash && carWash.location) {
      const lat = carWash.location.coordinates[1];
      const lon = carWash.location.coordinates[0];
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      window.open(mapsUrl, "_blank");
    }
  };

  if (!code || !carWash) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-green-500 text-white py-6 px-6">
          <DialogTitle className="text-2xl font-bold">Your WashBuddy Deal is Ready! 🎉</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Car Wash Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{carWash.car_wash_name}</h2>
            <div className="flex items-start gap-2 text-neutral-600">
              <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="hover:text-blue-600 cursor-pointer" onClick={handleGetDirections}>
                  {carWash.formatted_address}
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-blue-600 hover:text-blue-800 text-sm"
                  onClick={handleGetDirections}
                >
                  Get Directions →
                </Button>
              </div>
            </div>
          </div>

          {/* Map */}
          {carWash && (
            <div className="h-[300px] w-full rounded-lg overflow-hidden">
              <div id="radar-map" className="w-full h-full">
                <RadarMap
                  publishableKey={process.env.NEXT_PUBLIC_RADAR_API_KEY || ""}
                  carWashes={[carWash]}
                  loading={carWash.location === null}
                  presentCenter={carWash.location ? {
                    longitude: carWash.location.coordinates[0],
                    latitude: carWash.location.coordinates[1]
                  } : undefined}
                  onlyPin={true}
                />
              </div>
            </div>
          )}

          {/* Car Wash Image */}
          {carWash.image_url && (
            <div className="relative h-48 w-full rounded-lg overflow-hidden">
              <Image
                src={carWash.image_url}
                alt={carWash.car_wash_name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Wash Code */}
          <div className="bg-neutral-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🔑 Your Wash Code:</h3>
            <div className="bg-white p-4 rounded-lg border border-neutral-200 relative">
              <div className="text-3xl font-bold text-center tracking-wider">{code}</div>
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
            <div className="mt-3 space-y-2">
              <p className="text-sm text-neutral-500">
                ⏰ Code expires in 24 hours
              </p>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">💡 Quick Tip:</span> You can access this code anytime in your Purchase History
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">🚘 How to Redeem:</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-600">
                <li>Enter the code above at the pay station kiosk when you arrive</li>
                <li>If there's an attendant, simply show them the code</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">❓ Need Help?</h3>
              <p className="text-neutral-600">
                If your code doesn't work or you have any questions, email us at:
                <br />
                <a href="mailto:support@washbuddy.com" className="text-blue-500 hover:text-blue-600">
                  📧 support@washbuddy.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 