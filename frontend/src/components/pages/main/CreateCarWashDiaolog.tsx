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

interface CreateCarWashDiaologProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCarWashDiaolog: React.FC<CreateCarWashDiaologProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[480px] max-h-[80vh] p-0 flex flex-col">
        <DialogHeader>
          <DialogTitle className="px-6 py-5 border-b">
            Create Carwash
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <div className="border-b">
            <div className="text-body-2 text-neutral-900 px-6 py-2">
              Upload the following and we will reimburse you for a basic wash at
              this site. Your contributions help keep your community car wash
              running!
            </div>
            <div className="px-6 py-2 text-body-2 text-neutral-900">
              Would you like Paypal or Venmo to your email address or phone
              number?
            </div>
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
                >
                  <Crosshair size={20} className="mr-2" />
                  Detect Location
                </Button>
              </TabsContent>
              <TabsContent value="enter_address"></TabsContent>
            </Tabs>
          </div>
          <div className="px-6 py-6 flex flex-col gap-5 border-b">
            <div className="text-title-1 text-[#262626]">Hours/Phone</div>
            <div className="text-title-1 text-[#262626]">
              Do you know the hours of operation?
            </div>
            <RadioGroup defaultValue="yes" className="flex gap-10">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>

            <Switch label="Open 24 hours" />
            <OperatingHoursRange />
            <div className="text-title-1 text-[#262626]">
              Do you know the phone number?
            </div>
            <RadioGroup defaultValue="yes" className="flex gap-10">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
            <Input placeholder="Enter phone number" className="p-3" />
          </div>
          <PhotoUploads />
        </div>
        <DialogFooter className="px-6 py-3 border-t flex gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCarWashDiaolog;
