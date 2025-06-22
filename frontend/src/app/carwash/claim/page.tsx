"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crosshair, Loader2, MapPin, Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperatingHoursRange } from "@/components/molecule/OperatingHoursRange";
import { Input } from "@/components/ui/input";
import { useEffect, useState, Suspense } from "react";
import { Toaster, toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import useLocationData from "@/hooks/useLocationData";
import {
    createCarwash,
    getCarwashById,
    updateCarwash,
} from "@/services/CarwashService";
import AddressAutoComplete from "@/components/molecule/AddressAutoComplete";
import { RadarAddress } from "radar-sdk-js/dist/types";
import Topbar from "@/components/pages/main/Topbar";
import { Amenities, Car_Wash_Type_Value, CarWashTypes, DEFAULT_PAYLOAD, FORM_CONFIG } from "@/utils/constants";
import { Switch } from "@/components/ui/switch";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import MultiImageUploadZone from "@/components/molecule/MultiImageUploadZone";
import { CarwashPackage } from "@/components/organism/carwashPackage";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Accordion } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AccordionItem, AccordionContent } from "@/components/ui/accordion";
import { CustomIconToggle } from "@/components/ui/customIconToggle";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { IAmenity } from "@/types";
import { getAmenities } from "@/services/AmenityService";
import VenmoIcon from "@/assets/payment-icons/venmo.svg";
import PayPalIcon from "@/assets/payment-icons/paypal.svg";
import CashAppIcon from "@/assets/payment-icons/cashapp.svg";
import { formatTimeAgo, generatePatchData } from "@/utils/functions";

const UploadFormConfig = [
    {
        name: "Site",
        label: "Site",
    },
    {
        name: "Amenities",
        label: "Amenities",
    },
    {
        name: "Menu",
        label: "Menu",
    },
    {
        name: "Exterior",
        label: "Exterior",
    },
    {
        name: "Interior",
        label: "Interior",
    },
];
const CarWashContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const carwashId = searchParams.get("id");
    const [isLoading, setIsLoading] = useState(false);
    const { locationData, fetchLocationData } = useLocationData();
    const [locationLoading, setLocationLoading] = useState(false);
    const [address, setAddress] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [formData, setFormData] = useState<any>(DEFAULT_PAYLOAD);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [originalData, setOriginalData] = useState<any>(null);
    const [originalImages, setOriginalImages] = useState<any>([]);
    const [knowHours, setKnowHours] = useState(true);
    const [knowPhone, setKnowPhone] = useState(false);
    const [amenities, setAmenities] = useState<IAmenity[]>([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentHandle, setPaymentHandle] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("venmo");

    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^\+1\d{10}$/;
        return phoneRegex.test(phone);
    };

    useEffect(() => {
        getAmenities().then((data: IAmenity[]) => {
            setAmenities(data);
            setAmenitiesLoading(false);
        }).catch((error: any) => {
            toast.error(error?.message || "Error fetching amenities");
            setAmenitiesLoading(false);
        });
    }, []);

    useEffect(() => {
        if (locationData) {
            setAddress(locationData);
        }
    }, [locationData]);

    useEffect(() => {
        if (!carwashId) {
            toast.error("No car wash ID provided");
            router.push("/carwash");
            return;
        }

        setFetchLoading(true);
        getCarwashById(carwashId)
            .then((data) => {
                const modifiedData = {
                    ...data,
                    packages: data.packages.map(
                        (pkg: { id: number; wash_types: any[] }) => ({
                            ...pkg,
                            wash_types: pkg.wash_types.map(
                                (wash_type: any) => wash_type.id
                            ),
                        })
                    ),
                    amenities: data.amenities.map((amenity: any) => amenity.id),
                };
                if (modifiedData.phone) {
                    setKnowPhone(true);
                }
                setOriginalData(modifiedData);
                setFormData(modifiedData);
                setOriginalImages(modifiedData.images);
                setFetchLoading(false);
            })
            .catch((error: any) => {
                toast.error(error?.message || "Error fetching car wash by id");
                router.push("/carwash");
                setFetchLoading(false);
            });
    }, [carwashId]);

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldConfig = FORM_CONFIG.find(field => field.name === name);

        if (name === 'phone') {
            // Only allow digits and + at the start
            const sanitizedValue = value.replace(/[^\d+]/g, '');
            // Ensure only one + at the start
            const formattedValue = sanitizedValue.startsWith('+')
                ? '+' + sanitizedValue.slice(1).replace(/\+/g, '')
                : sanitizedValue;

            setFormData((prevData: any) => ({
                ...prevData,
                [name]: formattedValue,
            }));

            // Validate phone number if it's not empty
            if (formattedValue && !validatePhoneNumber(formattedValue)) {
                setErrorMessage((prev: any) => ({
                    ...prev,
                    phone: 'Phone number must be in format +1xxxxxxxxxx',
                }));
            } else {
                setErrorMessage((prev: any) => ({
                    ...prev,
                    phone: null,
                }));
            }
        } else {
            setFormData((prevData: any) => ({
                ...prevData,
                [name]: value,
            }));

            // Validate field if it has validation rules
            if (fieldConfig?.validation) {
                const { validation } = fieldConfig;

                if (validation.required && !value) {
                    setErrorMessage((prev: any) => ({
                        ...prev,
                        [name]: validation.message,
                    }));
                } else if (validation.pattern && value && !validation.pattern.test(value)) {
                    setErrorMessage((prev: any) => ({
                        ...prev,
                        [name]: validation.message,
                    }));
                } else {
                    setErrorMessage((prev: any) => ({
                        ...prev,
                        [name]: null,
                    }));
                }
            }
        }
    };

    const handleFilterOperatingHours = (payload: any) => {
        if (knowHours) {
            const { operating_hours } = payload;
            const isOpen24Hours = payload.open_24_hours;
            if (isOpen24Hours) {
                return {
                    ...payload,
                    operating_hours: [],
                };
            } else {
                // Filter out operating hours where is_closed is true
                const filteredOperatingHours =
                    operating_hours?.filter((hour: any) => !hour.is_closed) || [];
                return {
                    ...payload,
                    operating_hours: filteredOperatingHours,
                };
            }
        } else {
            return { ...payload, operating_hours: [], open_24_hours: true };
        }
    };

    const handleFilterPhone = (payload: any) => {
        if (!knowPhone) {
            return { ...payload, phone: "" };
        }
        return payload;
    };

    const validateForm = () => {
        const errors: any = {};
        let isValid = true;

        // Validate required fields and patterns from FORM_CONFIG
        FORM_CONFIG.forEach((field) => {
            const value = formData[field.name];

            if (field.validation?.required && !value) {
                errors[field.name] = field.validation.message;
                isValid = false;
            } else if (field.validation?.pattern && value && !field.validation.pattern.test(value)) {
                errors[field.name] = field.validation.message;
                isValid = false;
            }
        });

        // Validate phone if knowPhone is true
        if (knowPhone && formData.phone && !validatePhoneNumber(formData.phone)) {
            errors.phone = 'Phone number must be in format +1xxxxxxxxxx';
            isValid = false;
        }

        setErrorMessage(errors);
        return isValid;
    };

    const handleSubmit = async () => {
        try {
            // Validate form before submission
            if (!validateForm()) {
                toast.error("Please fix the errors in the form before submitting");
                return;
            }

            if (!paymentHandle) {
                toast.error("Please enter your payment handle");
                return;
            }

            setIsLoading(true);
            let currentData = { ...DEFAULT_PAYLOAD, ...formData };
            currentData = handleFilterOperatingHours(currentData);
            currentData = handleFilterPhone(currentData);

            // Generate patch data with only modified fields
            const patchData = generatePatchData(
                currentData,
                originalData,
                {
                    payment_method: paymentMethod,
                    payment_handle: paymentHandle
                }
            );

            await updateCarwash(carwashId || "", patchData);
            console.log(patchData);
            toast.success("Car wash updated successfully!");
            handleNavigateDashboard();
        } catch (error: any) {
            toast.error(error.response.data.error || "Failed to update car wash. Please try again.", {
                style: {
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigateDashboard = () => {
        const filters = sessionStorage.getItem('dashboardFilters');
        const params = new URLSearchParams();
        if (filters) {
            const filtersObj = JSON.parse(filters);
            Object.entries(filtersObj).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        params.append(key, item);
                    });
                } else {
                    params.append(key, value as string);
                }
            });
            router.push(`/?${params.toString()}`);
        } else {
            router.push(`/`);
        }
    };

    const handleDetectLocation = async () => {
        setLocationLoading(true);
        await fetchLocationData();
        setLocationLoading(false);
    };

    const handleSelectAddress = (address: RadarAddress | null) => {
        if (address) {
            setAddress(address);
        }
    };

    const handleUploadImage = (images: any[]) => {
        setFormData((prevData: any) => ({
            ...prevData,
            images: [...prevData.images, ...images],
        }));
    };
    const handleDeleteImage = (image_url: string) => {
        setFormData((prevData: any) => ({
            ...prevData,
            images: prevData.images.filter(
                (image: any) => image.image_url != image_url
            ),
        }));
    };

    const handleSelectCarWashType = (carWashType: string) => {
        if (carWashType == Car_Wash_Type_Value.AUTOMATIC) {
            setFormData((prevData: any) => ({
                ...prevData,
                automatic_car_wash: true,
                self_service_car_wash: false,
            }));
        } else {
            setFormData((prevData: any) => ({
                ...prevData,
                automatic_car_wash: false,
                self_service_car_wash: true,
            }));
        }
    };

    const renderBountyInstructions = () => (
        <>
            <div className="w-full md:w-[750px] mx-auto text-headline-2 text-neutral-900 py-4 px-6">
                Bounty Instructions
            </div>
            <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-auto">
                <div className="w-full md:w-[750px] mx-auto p-6 bg-white">
                    <h1 className="text-2xl font-bold mb-4">💸 WashBuddy Bounty – Get a Car Wash for Just $3!</h1>
                    <p className="mb-6">Help us build the ultimate car wash map — and get your next wash nearly free.</p>
                    
                    <h2 className="text-xl font-semibold mb-3">🧽 Here's How It Works:</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>Buy the entry level or basic wash at this location.</li>
                        <li>You only pay $3 — we'll reimburse the rest!</li>
                        <li>Take 7–10 clear photos of the car wash:
                            <ul className="list-disc pl-6 mt-2">
                                <li>Sign, pricing board, entrance, wash bay, payment options, vacuums, etc.</li>
                                <li>Must include photos of the wash bay interior from your perspective - we want to see what you see!</li>
                            </ul>
                        </li>
                        <li>Fill out the form with:
                            <ul className="list-disc pl-6 mt-2">
                                <li>Wash hours</li>
                                <li>Wash package info (Basic, Deluxe, Ceramic, etc.)</li>
                                <li>Your Venmo, CashApp, or PayPal to get paid</li>
                            </ul>
                        </li>
                    </ul>

                    <h2 className="text-xl font-semibold mb-3">✅ You'll Receive:</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>A reimbursement of everything beyond $3, up to a $15 max</li>
                        <li>Payment within 48 hours of review and approval</li>
                        <li>Limit: 1 bounty per user per day</li>
                    </ul>

                    <h2 className="text-xl font-semibold mb-3">🛑 Submission Rules:</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>Photos must be clear and taken by you</li>
                        <li>No duplicates, AI images, or random internet photos</li>
                        <li>Only valid for new or unverified locations</li>
                    </ul>

                    <p className="mb-6">Questions? Reach out anytime at bounty@washbuddy.com</p>

                    <div className="sticky bottom-0 bg-white py-4">
                        <Button 
                            className="w-full" 
                            size="lg" 
                            onClick={() => setCurrentStep(2)}
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </>
    );

    const renderPaymentHandleForm = () => (
        <div className="w-full md:w-[750px] mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <p className="text-sm text-gray-600 mb-6">Please select your preferred payment method and enter your handle.</p>

            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center ${paymentMethod === 'venmo' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('venmo')}
                    >
                        <Image src={VenmoIcon} alt="Venmo" width={40} height={40} />
                        <span className="mt-2 text-sm">Venmo</span>
                    </div>
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center ${paymentMethod === 'cashapp' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('cashapp')}
                    >
                        <Image src={CashAppIcon} alt="CashApp" width={40} height={40} />
                        <span className="mt-2 text-sm">CashApp</span>
                    </div>
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('paypal')}
                    >
                        <Image src={PayPalIcon} alt="PayPal" width={40} height={40} />
                        <span className="mt-2 text-sm">PayPal</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Handle</label>
                    <div className="relative">
                        <Wallet2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            className="pl-10 py-2.5"
                            placeholder={`Enter your ${paymentMethod} handle`}
                            value={paymentHandle}
                            onChange={(e) => setPaymentHandle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setCurrentStep(2)}
                    >
                        Back
                    </Button>
                    <Button 
                        className="flex-1"
                        onClick={handleSubmit}
                        disabled={!paymentHandle || isLoading}
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
            <Toaster position="top-center" />
            <div className="flex flex-col h-screen">
                <Topbar sideBarAlwaysOpen={true} />
                <div className="flex flex-col md:ml-[210px] flex-1 overflow-hidden">
                    {fetchLoading ? (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {currentStep === 1 && renderBountyInstructions()}
                            {currentStep === 2 && (
                                <>
                                    <div className="w-full md:w-[750px] mx-auto text-headline-2 text-neutral-900 py-4 px-6">
                                        Edit Carwash
                                    </div>
                                    <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-auto">
                                        <div className="w-full md:w-[750px] mx-auto">
                                            <div className="">
                                                <div className="text-body-2 text-neutral-900 px-6 py-2">
                                                    Upload the following and we will reimburse you for a basic
                                                    wash at this site. Your contributions help keep your
                                                    community car wash running!
                                                </div>
                                                <div className="px-6 py-2 text-body-2 text-neutral-900">
                                                    Would you like Paypal or Venmo to your email address or
                                                    phone number?
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-4 px-6 py-4 ">
                                                {FORM_CONFIG.map((field) => (
                                                    <div className="" key={field.name}>
                                                        <div className="text-title-1 text-[#262626] pb-2">
                                                            {field.label}
                                                            {field.required && (
                                                                <span className="text-red-500">*</span>
                                                            )}
                                                        </div>
                                                        <Input
                                                            name={field.name}
                                                            value={formData[field.name] || ""}
                                                            onChange={handleChangeInput}
                                                            required={field.required}
                                                            placeholder={field.placeholder}
                                                            className="px-3 py-2.5"
                                                        />
                                                        {errorMessage && errorMessage[field.name] && (
                                                            <p className="text-body-2 mt-1 text-red-500">
                                                                {errorMessage[field.name]}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="px-6 py-4 ">
                                                <div className="text-title-1 text-[#262626]">Location</div>
                                                <Tabs defaultValue="use_gps" className="w-full">
                                                    <TabsList className="bg-transparent w-full">
                                                        <TabsTrigger
                                                            value="use_gps"
                                                            className="w-full text-title-2"
                                                        >
                                                            <Crosshair size={20} className="mr-2" /> Use GPS
                                                        </TabsTrigger>
                                                        <TabsTrigger
                                                            value="enter_address"
                                                            className="w-full text-title-2"
                                                        >
                                                            <MapPin size={20} className="mr-2" /> Enter Address
                                                        </TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="use_gps">
                                                        <div className="text-body-2 text-neutral-900 mb-3">
                                                            Automatically detect your location using GPS.
                                                        </div>
                                                        <div className="flex md:justify-between flex-col md:flex-row gap-3 md:items-center">
                                                            <Button
                                                                variant="outline"
                                                                className="text-blue-500 border-blue-500 rounded-full  hover:bg-blue-500 hover:text-white w-fit"
                                                                onClick={handleDetectLocation}
                                                            >
                                                                <Crosshair size={20} className="mr-2" />
                                                                Detect Location
                                                            </Button>
                                                            {locationLoading ? (
                                                                <p className="text-neutral-600">Loading...</p>
                                                            ) : (
                                                                <div className="text-body-2 text-neutral-900">
                                                                    {locationData?.formatted_address ||
                                                                        formData.formatted_address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent value="enter_address" className="pt-2">
                                                        <AddressAutoComplete onSelect={handleSelectAddress} />
                                                    </TabsContent>
                                                </Tabs>
                                                {errorMessage && errorMessage.location && (
                                                    <p className="text-body-2 mt-1 text-red-500">
                                                        {errorMessage.location}
                                                    </p>
                                                )}
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex flex-col px-6 gap-2 py-4">
                                                <div className="text-title-1 text-[#262626]">
                                                    Select Carwash Type
                                                </div>
                                                <div className="flex gap-2 w-full bg-[#F4F4F4] rounded-full">
                                                    {CarWashTypes.map((carWashType) => (
                                                        <div
                                                            key={carWashType.id}
                                                            className={`flex-1 flex items-center justify-center rounded-full py-2 px-3 text-title-2 gap-2 cursor-pointer
                            ${(formData.automatic_car_wash == true && carWashType.value == Car_Wash_Type_Value.AUTOMATIC) ||
                                                            (formData.self_service_car_wash == true && carWashType.value == Car_Wash_Type_Value.SELF_SERVICE) ?
                                                            "bg-blue-500 text-white" : "text-neutral-900"}`}
                                                            onClick={() => handleSelectCarWashType(carWashType.value)}
                                                        >
                                                            <Image
                                                                src={carWashType.value == Car_Wash_Type_Value.AUTOMATIC ? AutomaticIcon : SelfServiceIcon}
                                                                alt={carWashType.name}
                                                                width={16} height={16}
                                                                className={`${(formData.automatic_car_wash == true && carWashType.value == Car_Wash_Type_Value.AUTOMATIC) ||
                                                                    (formData.self_service_car_wash == true && carWashType.value == Car_Wash_Type_Value.SELF_SERVICE) ?
                                                                    "filter-white" : "filter-neutral-400"}`}
                                                            />
                                                            {carWashType.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex flex-col px-6 gap-2  py-4">
                                                <div className="text-title-1 text-[#262626] pb-4">
                                                    Select Amenities
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {amenitiesLoading ? (
                                                        <p className="text-neutral-600">Loading...</p>
                                                    ) : (
                                                        amenities
                                                            .filter((amenity) => amenity.category === ((formData.automatic_car_wash ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE) || null))
                                                            .map((amenity) => {
                                                                // Find matching local amenity for icon
                                                                const localAmenity = Amenities.find(
                                                                    (local) => local.name.toLowerCase() === amenity.name.toLowerCase()
                                                                );
                                                                return (
                                                                    <CustomIconToggle
                                                                        key={amenity.id}
                                                                        label={amenity.name}
                                                                        icon={localAmenity?.icon || Amenities[0].icon}
                                                                        checked={formData.amenities.includes(amenity.id)}
                                                                        onChange={(checked) =>
                                                                            setFormData({
                                                                                ...formData,
                                                                                amenities: checked
                                                                                    ? [...formData.amenities, amenity.id]
                                                                                    : formData.amenities.filter(
                                                                                        (id: any) => id !== amenity.id
                                                                                    ),
                                                                            })
                                                                        }
                                                                    />
                                                                );
                                                            })
                                                    )}
                                                </div>
                                            </div>
                                            <Separator className="my-2" />

                                            <CarwashPackage
                                                carwashPackages={formData.packages}
                                                setCarwashPackages={(carwashPackages) =>
                                                    setFormData({
                                                        ...formData,
                                                        packages: carwashPackages,
                                                    })
                                                }
                                            />
                                            <Separator className="my-2" />
                                            <div className="px-6 flex flex-col py-4">
                                                <div className="text-title-1 text-[#262626] pb-6">
                                                    Hours/Phone
                                                </div>
                                                <div className="text-title-2 text-neutral-900 pb-4">
                                                    Do you know the hours of operation?
                                                </div>
                                                <RadioGroup
                                                    defaultValue={knowHours ? "true" : "false"}
                                                    onValueChange={(value) => setKnowHours(value === "true")}
                                                    className="flex flex-row gap-2 pb-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="true" id="r1" />
                                                        <Label htmlFor="r1">Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="false" id="r2" />
                                                        <Label htmlFor="r2">No</Label>
                                                    </div>
                                                </RadioGroup>

                                                <Accordion
                                                    type="single"
                                                    collapsible
                                                    className="w-full"
                                                    value={knowHours ? "item-1" : ""}
                                                >
                                                    <AccordionItem value="item-1">
                                                        <AccordionContent>
                                                            <div className="h-7 flex items-center">
                                                                <Switch
                                                                    label="Open 24 hours"
                                                                    checked={formData.open_24_hours}
                                                                    onCheckedChange={(value) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            open_24_hours: value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                            <OperatingHoursRange
                                                                open_24_hours={formData.open_24_hours}
                                                                operatingHours={formData.operating_hours}
                                                                setOperatingHours={(operating_hours) =>
                                                                    setFormData({ ...formData, operating_hours })
                                                                }
                                                            />
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                                <div className="text-title-2 text-neutral-900 pb-4">
                                                    Do you know the phone number?
                                                </div>
                                                <RadioGroup
                                                    defaultValue={knowPhone ? "true" : "false"}
                                                    onValueChange={(value) => setKnowPhone(value === "true")}
                                                    className="flex flex-row gap-2 pb-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="true" id="r1" />
                                                        <Label htmlFor="r1">Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="false" id="r2" />
                                                        <Label htmlFor="r2">No</Label>
                                                    </div>
                                                </RadioGroup>
                                                <Accordion
                                                    type="single"
                                                    collapsible
                                                    className="w-full"
                                                    value={knowPhone ? "item-1" : ""}
                                                >
                                                    <AccordionItem value="item-1">
                                                        <AccordionContent className="p-0.5">
                                                            <Input
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleChangeInput}
                                                                className="px-3 py-2.5"
                                                                placeholder="Enter phone number (e.g. +12345678901)"
                                                            />
                                                            {errorMessage?.phone && (
                                                                <p className="text-body-2 mt-1 text-red-500">
                                                                    {errorMessage.phone}
                                                                </p>
                                                            )}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="px-6 flex flex-col gap-1 pt-6">
                                                <div className="text-title-1 text-[#262626] pb-4">
                                                    Photos
                                                </div>
                                                {UploadFormConfig.map((config) => (
                                                    <MultiImageUploadZone
                                                        key={config.name}
                                                        image_type={config.name}
                                                        title={config.label}
                                                        images={formData.images}
                                                        originalImages={originalImages}
                                                        handleAddImage={handleUploadImage}
                                                        handleDeleteImage={handleDeleteImage}
                                                    />
                                                ))}
                                            </div>
                                            <div className="px-6 pb-10 flex gap-2 flex-wrap">
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    size="lg"
                                                    onClick={() => setCurrentStep(1)}
                                                    disabled={isLoading}
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    className="w-full"
                                                    size="lg"
                                                    onClick={() => setCurrentStep(3)}
                                                    disabled={isLoading}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </>
                            )}
                            {currentStep === 3 && renderPaymentHandleForm()}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
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
            <CarWashContent />
        </Suspense>
    );
};

export default Page;
