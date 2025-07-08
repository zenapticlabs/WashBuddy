"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CarWashResponse } from "@/types/CarServices";
import axiosInstance from "@/lib/axios";
import { Copy, Check, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCarwashById } from "@/services/CarwashService";
import { RadarMap } from "@/components/organism/RadarMap";

export default function RedemptionPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [carWash, setCarWash] = useState<CarWashResponse | null>(null);
    const code = searchParams.get("code");
    const carWashId = searchParams.get("carWashId");
    const [mapLoading, setMapLoading] = useState(true);

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

        fetchCarWashDetails();
    }, [carWashId]);

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
        if (carWash) {
            const address = encodeURIComponent(carWash.formatted_address);
            window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
        }
    };

    if (!code || !carWash) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                    <p className="text-neutral-500">Please wait while we fetch your redemption details.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm">
                {/* Success Banner */}
                <div className="bg-green-500 text-white py-6 px-6 rounded-t-xl">
                    <h1 className="text-2xl font-bold">Your WashBuddy Deal is Ready! 🎉</h1>
                </div>

                <div className="p-6 space-y-8">
                    {/* Car Wash Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">{carWash.car_wash_name}</h2>
                        <div className="flex items-start gap-2 text-neutral-600">
                            <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                            <p>{carWash.formatted_address}</p>
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
                        <p className="text-sm text-neutral-500 mt-2">
                            ⏰ Code expires in 24 hours
                        </p>
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
                            <h3 className="text-lg font-semibold mb-2">💡 Access Your Code Later:</h3>
                            <p className="text-neutral-600">
                                You can re-access this code anytime by clicking the ☰ menu in the upper-left and selecting "Purchase History."
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">❓ Need Help?</h3>
                            <p className="text-neutral-600">
                                If your code doesn't work or you have any questions, email us at:
                                <br />
                                <a href="mailto:help@washbuddy.app" className="text-blue-500 hover:text-blue-600">
                                    📧 help@washbuddy.app
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 