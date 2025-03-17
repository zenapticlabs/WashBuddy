"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Crosshair, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OperatingHoursRange } from "@/components/molecule/OperatingHoursRange";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import useLocationData from "@/hooks/useLocationData";
import { createCarwash } from "@/services/CarwashService";
import ImageUploadZone from "@/components/ui/imageUploadZone";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import AddressAutoComplete from "@/components/molecule/AddressAutoComplete";
import { RadarAddress } from "radar-sdk-js/dist/types";
import Topbar from "@/components/pages/main/Topbar";

const OPERATING_HOURS = Array.from({ length: 7 }, (_, index) => ({
  day_of_week: index,
  is_closed: false,
  opening_time: "06:00",
  closing_time: "18:00"
}));

const DEFAULT_IMAGES = Array.from({ length: 8 }, (_, index) => ({
  image_type: index,
  image_key: "string"
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
  verified: false
};

const formConfig = [
  {
    name: "car_wash_name",
    label: "Name",
    type: "text",
    required: true,
  },
];


const CreateCarWashDiaolog: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { locationData, error, loading, fetchLocationData } = useLocationData();
  const [manualAddress, setManualAddress] = useState<RadarAddress | null>(null)
  const [errorMessage, setErrorMessage] = useState<any>(null)
  const [formData, setFormData] = useState<any>({
    car_wash_name: "",
    automatic_car_wash: false,
    self_service_car_wash: false,
  });
  const [knowPhone, setKnowPhone] = useState(false);
  const [knowHours, setKnowHours] = useState(false);
  const [activeTab, setActiveTab] = useState<"use_gps" | "enter_address">("use_gps");

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
      let payload = { ...formData, ...defaultPayload };
      if (activeTab == "use_gps") {
        if (locationData) {
          setErrorMessage({
            ...errorMessage,
            location: null
          });
          payload = { ...locationData, ...payload }
        } else {
          setErrorMessage({
            ...errorMessage,
            location: "Location data not found"
          });
          return;
        }
      } else {
        if (manualAddress) {
          setErrorMessage({
            ...errorMessage,
            location: null
          });
          payload = {
            ...payload,
            address: manualAddress?.addressLabel,
            city: manualAddress?.city,
            state: manualAddress?.state,
            state_code: manualAddress?.stateCode,
            postal_code: manualAddress?.postalCode,
            country: manualAddress?.country,
            country_code: manualAddress?.countryCode,
            formatted_address: manualAddress?.formattedAddress,
            location: {
              type: "Point",
              coordinates: [manualAddress?.longitude, manualAddress?.latitude],
            },
          }
        } else {
          setErrorMessage({
            ...errorMessage,
            location: "Manual address not found"
          });
          return;
        }
      }

      const response = await createCarwash(payload);

      if (!response.ok) {
        throw new Error("Failed to create car wash");
      }

      toast.success("Car wash created successfully!");

    } catch (error) {
      console.error("Error creating car wash:", error);
      toast.error("Failed to create car wash. Please try again.", {
        style: {
          backgroundColor: "#dc2626", // red-600
          color: "white",
          border: "none",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = async () => {
    fetchLocationData();
  };

  const handleSelectAddress = (address: RadarAddress | null) => {
    if (address) {
      setManualAddress(address)
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col h-screen">
        <Topbar sideBarAlwaysOpen={true} />
        <div className="flex flex-col ml-[210px] flex-1 overflow-hidden">
          <div className="w-[1024px] mx-auto text-headline-2 text-neutral-900 py-4 px-6">Edit Carwash</div>
          <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-auto">
            <div className="w-[1024px] mx-auto">
              <div className="">
                <div className="text-body-2 text-neutral-900 px-6 py-2">
                  Upload the following and we will reimburse you for a basic wash
                  at this site. Your contributions help keep your community car
                  wash running!
                </div>
                <div className="px-6 py-2 text-body-2 text-neutral-900">
                  Would you like Paypal or Venmo to your email address or phone
                  number?
                </div>
              </div>
              <div className="flex flex-col gap-4 px-6 py-4 ">
                {formConfig.map((field) => (
                  <div className="" key={field.name}>
                    <div className="text-title-1 text-[#262626]">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </div>
                    <Input
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChangeInput}
                      required={field.required}
                      className="p-3"
                    />
                    {errorMessage && errorMessage[field.name] && <p className="text-body-2 mt-1 text-red-500">{errorMessage[field.name]}</p>}
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 ">
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
                    <Button
                      variant="outline"
                      className="text-blue-500 lue-500 rounded-full border-blue-500 hover:bg-blue-500 hover:text-white"
                      onClick={handleDetectLocation}
                    >
                      <Crosshair size={20} className="mr-2" />
                      Detect Location
                    </Button>
                    {loading && <p className="pt-2 text-neutral-600">Loading...</p>}
                    {error && <p>Error: {error}</p>}
                    {locationData && (
                      <div className="flex flex-col gap-2 pt-4 text-neutral-800">
                        <div className="flex justify-between text-neutral-600">
                          <div className="text-title-1">Address</div>
                          <p>{locationData.formatted_address}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="enter_address" className="pt-2">
                    <AddressAutoComplete onSelect={handleSelectAddress} />
                  </TabsContent>
                </Tabs>
                {errorMessage && errorMessage.location && <p className="text-body-2 mt-1 text-red-500">{errorMessage.location}</p>}
              </div>
              <div className="flex flex-col gap-2 mt-4 px-6">
                <Checkbox
                  label="Automatic car wash"
                  checked={formData.automatic_car_wash}
                  onChange={(checked) =>
                    setFormData({
                      ...formData,
                      automatic_car_wash: !!checked,
                    })
                  }
                />
                <Checkbox
                  label="Self-service car wash"
                  checked={formData.self_service_car_wash}
                  onChange={(checked) =>
                    setFormData({
                      ...formData,
                      self_service_car_wash: !!checked,
                    })
                  }
                />
              </div>
              <div className="px-6 py-6 flex flex-col gap-5 ">
                <div className="text-title-1 text-[#262626]">Hours/Phone</div>
                <div className="text-title-1 text-[#262626]">
                  Do you know the hours of operation?
                </div>
                <RadioGroup
                  value={knowHours ? "yes" : "no"}
                  className="flex gap-10"
                  onValueChange={(value) => setKnowHours(value === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>
                {knowHours && <OperatingHoursRange />}
                <div className="text-title-1 text-[#262626]">
                  Do you know the phone number?
                </div>
                <RadioGroup
                  value={knowPhone ? "yes" : "no"}
                  className="flex gap-10"
                  onValueChange={(value) => setKnowPhone(value === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>
                {knowPhone && (
                  <Input
                    placeholder="Enter phone number"
                    className="p-3"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChangeInput}
                  />
                )}
              </div>
              <div className="px-6 py-6 flex flex-col gap-2 ">
                <div className="text-title-1">Photos</div>
                <div className="text-title-2">Site Photo</div>
                <ImageUploadZone title="Exterior photo of wash" required={true} />
                <Separator className="my-4" />
                <div className="text-title-2">Automatic wash</div>
                <ImageUploadZone title="Wash menu" required={true} />
                <ImageUploadZone title="Pay station or kiosk" required={true} />
                <ImageUploadZone title="Interior of wash bay" />
                <ImageUploadZone title="Amenitiy - such as air gun, vacuum, mat/pet station" />
                <Separator className="my-4" />
                <div className="text-title-2">Self-service bay</div>
                <ImageUploadZone title="Pay statino or kiosk" required={true} />
                <ImageUploadZone title="Wash bay photo" />
                <ImageUploadZone title="Amenitiy - such as changer, vending machines, vacuums" />
              </div>
              <div className="px-6 py-3 flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => { }}
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
        </div>
      </div>

    </>
  );
};

export default CreateCarWashDiaolog;
