import { Rate } from "@/components/ui/rate";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SelectRate } from "@/components/ui/selectRate";
import { Textarea } from "@/components/ui/textarea";
import { Star, XIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ImageUploadZone from "@/components/ui/imageUploadZone";
import { Button } from "@/components/ui/button";
const defaultAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";

const CreateCarWashReviewModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  if (!open) return null;
  return (
    <div className="absolute p-2 top-0 left-[400px] h-full z-50 flex flex-col">
      <ScrollArea className="w-full h-full overflow-hidden flex-1 rounded-t-xl">
        <div className="w-[480px] bg-white relative">
          <div className="px-6 py-6 text-headline-4 text-neutral-900 border-b border-neutral-100 flex items-center justify-between">
            Rate and review
            <button
              onClick={() => onOpenChange(false)}
              className="bg-white rounded-full p-1.5 cursor-pointer hover:bg-neutral-100"
            >
              <XIcon className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
          <div className="px-6 py-4 text-body-2 text-neutral-500">
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <img
                  src={defaultAvatar}
                  alt={`${defaultAvatar}'s avatar`}
                  className="w-10 h-10 rounded-full"
                />
                <Rate value={4.8} max={5} size="md" />
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-t from-[#FFA100] to-[#FFC35C] flex items-center justify-center">
                  <Star className="text-white stroke-0.5" size={16} />
                </div>
                <span className="text-body-2 text-neutral-500">
                  + 25 Points
                </span>
                <span className="text-xs text-neutral-200 w-4 h-4 rounded-full border border-neutral-200 flex items-center justify-center">
                  i
                </span>
              </div>
            </div>
            <Textarea placeholder="Type your comment" className="w-full mt-6" />
            <Separator className="my-4" />
            <div className="text-title-1 text-neutral-900 mb-4">
              Rate this Wash location on the following categories
            </div>
            <div className="flex flex-col gap-4">
              <SelectRate title="Wash Quality" />
              <SelectRate title="Price & Value" />
              <SelectRate title="Facility Cleanliness & Safety" />
              <SelectRate title="Customer Service" />
              <div className="flex items-center justify-between">
                <div className="text-title-3 text-neutral-900">
                  Amenities & Extras
                </div>
                <Switch label="Not Applicable" labelPosition="start" />
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between mb-2">
              <div className="text-title-1 text-neutral-900">Upload photo</div>
              <div className="flex items-center justify-center gap-1">
                <div className="h-6 w-6 rounded-full bg-gradient-to-t from-[#FFA100] to-[#FFC35C] flex items-center justify-center">
                  <Star className="text-white stroke-0.5" size={16} />
                </div>
                <span className="text-body-2 text-neutral-500">
                  + 25 Points
                </span>
                <span className="text-xs text-neutral-200 w-4 h-4 rounded-full border border-neutral-200 flex items-center justify-center">
                  i
                </span>
              </div>
            </div>
            <ImageUploadZone />
          </div>
        </div>
      </ScrollArea>
      <div className="w-full py-3 px-6 border-t border-neutral-100 flex gap-2 bg-white rounded-b-xl">
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
      </div>
    </div>
  );
};

export default CreateCarWashReviewModal;
