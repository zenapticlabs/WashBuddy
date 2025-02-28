import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Crosshair, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OperatingHoursRange } from "@/components/molecule/OperatingHoursRange";
import { Input } from "@/components/ui/input";
import PhotoUploads from "./PhotoUploads";
import { Dialog, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import useLocationData from "@/hooks/useLocationData";
import { createCarwash } from "@/services/CarwashService";

const formConfig = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "text",
  },
  {
    name: "website",
    label: "Website",
    type: "text",
  },
];

interface CreateCarWashDiaologProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCarWashDiaolog: React.FC<CreateCarWashDiaologProps> = ({
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { locationData, error, loading, fetchLocationData } = useLocationData();
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    website: "",
    phone: "",
  });
  const [knowPhone, setKnowPhone] = useState(false);
  const [knowHours, setKnowHours] = useState(false);

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

      const payload = { ...locationData, ...formData };
      
      console.log(payload);
      const response = await createCarwash(payload);

      if (!response.ok) {
        throw new Error("Failed to create car wash");
      }

      toast.success("Car wash created successfully!");

      onOpenChange(false);
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

  return (
    <>
      <Toaster position="top-center" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[480px] h-[80vh] p-0 flex flex-col">
          <DialogHeader>
            <DialogTitle className="px-6 py-5 border-b">
              Create Carwash
            </DialogTitle>
          </DialogHeader>
          <ScrollArea>
            <div className="border-b">
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
            <div className="flex flex-col gap-4 px-6 py-4 border-b">
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
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-b">
              <div className="text-title-1 text-[#262626]">Location</div>
              <Tabs defaultValue="use_gps" className="w-full">
                <TabsList className="bg-transparent w-full">
                  <TabsTrigger value="use_gps" className="w-full text-title-2">
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
                  <Button
                    variant="outline"
                    className="text-blue-500 border-blue-500 rounded-full hover:bg-blue-500 hover:text-white"
                    onClick={handleDetectLocation}
                  >
                    <Crosshair size={20} className="mr-2" />
                    Detect Location
                  </Button>
                  {loading && <p>Loading...</p>}
                  {error && <p>Error: {error}</p>}
                  {locationData && (
                    <div className="flex flex-col gap-2 pt-4">
                      <div className="flex justify-between text-neutral-800">
                        <div className="text-title-1">Address</div>
                        <p>{locationData.address}</p>
                      </div>
                      <div className="flex justify-between text-neutral-800">
                        <div className="text-title-1">City</div>
                        <p>{locationData.city}</p>
                      </div>
                      <div className="flex justify-between text-neutral-800">
                        <div className="text-title-1">State</div>
                        <p>{locationData.state}</p>
                      </div>
                      <div className="flex justify-between text-neutral-800">
                        <div className="text-title-1">Postal Code</div>
                        <p>{locationData.postal_code}</p>
                      </div>
                      <div className="flex justify-between text-neutral-800">
                        <div className="text-title-1">Country</div>
                        <p>{locationData.country}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="enter_address"></TabsContent>
              </Tabs>
            </div>
            <div className="px-6 py-6 flex flex-col gap-5 border-b">
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
            <PhotoUploads />
          </ScrollArea>
          <DialogFooter className="px-6 py-3 border-t flex gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateCarWashDiaolog;
