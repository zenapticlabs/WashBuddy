"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crosshair, Loader2, MapPin } from "lucide-react";
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
  getCarwashes,
  updateCarwash,
} from "@/services/CarwashService";
import AddressAutoComplete from "@/components/molecule/AddressAutoComplete";
import { RadarAddress } from "radar-sdk-js/dist/types";
import Topbar from "@/components/pages/main/Topbar";
import { useAmenities } from "@/hooks/useAmenities";
import { useWashTypes } from "@/hooks/useWashTypes";
import { Car_Wash_Type_Value } from "@/utils/constants";
import SelectCarwashType from "@/components/molecule/SelectCarwashType";
import { Switch } from "@/components/ui/switch";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const OPERATING_HOURS = Array.from({ length: 7 }, (_, index) => ({
  day_of_week: index,
  is_closed: false,
  opening_time: "06:00",
  closing_time: "18:00",
}));

const DEFAULT_IMAGES = Array.from({ length: 8 }, (_, index) => ({
  image_type: index,
  image_key: "string",
}));

const defaultPayload = {
  operating_hours: OPERATING_HOURS,
  images: DEFAULT_IMAGES,
  wash_types: [],
  amenities: [],
  phone: "",
  reviews_count: 0,
  reviews_average: 0,
  open_24_hours: true,
  verified: false,
};

const formConfig = [
  {
    name: "car_wash_name",
    label: "Name",
    type: "text",
    placeholder: "Enter car wash name",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    placeholder: "Enter phone number",
  },
  {
    name: "website",
    label: "Website",
    type: "text",
    placeholder: "Enter website",
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter email",
  },
];

const CarWashContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carwashId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const { locationData, error, loading, fetchLocationData } = useLocationData();
  const [isEdit, setIsEdit] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<any>(null);
  const [formData, setFormData] = useState<any>(defaultPayload);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"use_gps" | "enter_address">(
    "use_gps"
  );
  const {
    amenities,
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useAmenities();
  const {
    washTypes,
    isLoading: washTypesLoading,
    error: washTypesError,
  } = useWashTypes();

  useEffect(() => {
    if (locationData) {
      setAddress(locationData);
    }
  }, [locationData]);

  useEffect(() => {
    if (carwashId) {
      setFetchLoading(true);
      getCarwashById(carwashId)
        .then((data) => {
          setFormData(data);
          setIsEdit(true);
          setFetchLoading(false);
        })
        .catch((error) => {
          toast.error("Error fetching car wash by id");
          router.push("/carwash");
          setFetchLoading(false);
        });
    } else {
      setFetchLoading(false);
    }
  }, [carwashId]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let payload = { ...defaultPayload, ...formData };
      if (!isEdit) {
        setErrorMessage({
          ...errorMessage,
          location: address ? null : "Please enter a valid address",
        });
        if (!address) return;
        payload = { ...payload, ...address };
      }
      let response;
      if (isEdit) {
        response = await updateCarwash(carwashId || "", payload);
      } else {
        response = await createCarwash(payload);
      }
      toast.success(
        isEdit
          ? "Car wash updated successfully!"
          : "Car wash created successfully!"
      );
    } catch (error) {
      toast.error(
        isEdit
          ? "Failed to update car wash. Please try again."
          : "Failed to create car wash. Please try again.",
        {
          style: {
            backgroundColor: "#dc2626", // red-600
            color: "white",
            border: "none",
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = async () => {
    fetchLocationData();
  };

  const handleSelectAddress = (address: RadarAddress | null) => {
    if (address) {
      setAddress(address);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col h-screen">
        <Topbar sideBarAlwaysOpen={true} />
        <div className="flex flex-col ml-[210px] flex-1 overflow-hidden">
          {fetchLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="w-[750px] mx-auto text-headline-2 text-neutral-900 py-4 px-6">
                {isEdit ? "Edit Carwash" : "Create Carwash"}
              </div>
              <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-auto">
                <div className="w-[750px] mx-auto">
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
                  <div className="flex flex-col gap-4 px-6 py-10 ">
                    {formConfig.map((field) => (
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
                  <div className="px-6 py-10 ">
                    <div className="text-title-1 text-[#262626]">Location</div>
                    <Tabs defaultValue="use_gps" className="w-full">
                      <TabsList className="bg-transparent w-full">
                        <TabsTrigger
                          value="use_gps"
                          className="w-full text-title-2"
                          onClick={() => setActiveTab("use_gps")}
                        >
                          <Crosshair size={20} className="mr-2" /> Use GPS
                        </TabsTrigger>
                        <TabsTrigger
                          value="enter_address"
                          className="w-full text-title-2"
                          onClick={() => setActiveTab("enter_address")}
                        >
                          <MapPin size={20} className="mr-2" /> Enter Address
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="use_gps">
                        <div className="text-body-2 text-neutral-900 mb-3">
                          Automatically detect your location using GPS.
                        </div>
                        <div className="flex justify-between items-center">
                          <Button
                            variant="outline"
                            className="text-blue-500 border-blue-500 rounded-full  hover:bg-blue-500 hover:text-white"
                            onClick={handleDetectLocation}
                          >
                            <Crosshair size={20} className="mr-2" />
                            Detect Location
                          </Button>
                          {loading && (
                            <p className="pt-2 text-neutral-600">Loading...</p>
                          )}
                          {error && <p>Error: {error}</p>}

                          <div className="text-body-2 text-neutral-900">
                            {locationData?.formatted_address ||
                              formData.formatted_address}
                          </div>
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
                  <div className="flex flex-col px-6 gap-2  py-10">
                    <div className="text-title-1 text-[#262626] py-5">
                      Select Carwash Type
                    </div>
                    <SelectCarwashType
                      label="Automatic car wash"
                      checked={formData.automatic_car_wash}
                      onChange={(checked) =>
                        setFormData({
                          ...formData,
                          automatic_car_wash: !!checked,
                        })
                      }
                      amenitiyOptions={amenities.filter(
                        (amenity) =>
                          amenity.category == Car_Wash_Type_Value.AUTOMATIC
                      )}
                      washTypeOptions={washTypes.filter(
                        (washType) =>
                          washType.category == Car_Wash_Type_Value.AUTOMATIC
                      )}
                      amenities={formData.amenities}
                      washTypes={formData.wash_types}
                      setAmenities={(amenities) =>
                        setFormData({ ...formData, amenities })
                      }
                      setWashTypes={(washTypes) =>
                        setFormData({ ...formData, wash_types: washTypes })
                      }
                    />
                    <SelectCarwashType
                      label="Self-service car wash"
                      checked={formData.self_service_car_wash}
                      onChange={(checked) =>
                        setFormData({
                          ...formData,
                          self_service_car_wash: !!checked,
                        })
                      }
                      amenitiyOptions={amenities.filter(
                        (amenity) =>
                          amenity.category == Car_Wash_Type_Value.SELF_SERVICE
                      )}
                      washTypeOptions={washTypes.filter(
                        (washType) =>
                          washType.category == Car_Wash_Type_Value.SELF_SERVICE
                      )}
                      amenities={formData.amenities}
                      washTypes={formData.wash_types}
                      setAmenities={(amenities) =>
                        setFormData({ ...formData, amenities })
                      }
                      setWashTypes={(washTypes) =>
                        setFormData({ ...formData, wash_types: washTypes })
                      }
                    />
                  </div>
                  <div className="px-6 flex flex-col py-10">
                    <div className="text-title-1 text-[#262626] pb-6">
                      Operating Hours
                    </div>
                    <div className="h-7 flex items-center">
                      <Switch
                        label="Open 24 hours"
                        checked={formData.open_24_hours}
                        onCheckedChange={(value) =>
                          setFormData({ ...formData, open_24_hours: value })
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
                  </div>
                  <div className="px-6 pb-10 flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => {}}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const Page: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="absolute inset-0 z-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    }>
      <CarWashContent />
    </Suspense>
  );
};

export default Page;
