import Image from "next/image";
import carlogo from "@/assets/carlogo.jpg";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarWashAbout from "./CarWashAbout/CarWashAbout";
import CarWashReviews from "./CarWashReviews/CarWashReviews";
import {
  ArrowRight,
  CrossIcon,
  Dot,
  MapPin,
  Phone,
  Star,
  XIcon,
} from "lucide-react";
import { ICarWashCard } from "@/types";
import CreateCarWashReviewModal from "./CreateCarWashReviewModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Rate } from "@/components/ui/rate";
import { Textarea } from "@/components/ui/textarea";
import { SelectRate } from "@/components/ui/selectRate";
import { Switch } from "@/components/ui/switch";
import ImageUploadZone from "@/components/ui/imageUploadZone";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const defaultAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";

interface CarWashDetailProps {
  onClose: () => void;
  data?: ICarWashCard;
  onNavigate?: (location: { lat: number; lng: number }) => void;
}

const CarWashDetail: React.FC<CarWashDetailProps> = ({
  onClose,
  data,
  onNavigate,
}) => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const handleNavigate = () => {
    if (data?.location) {
      onNavigate?.(data.location);
    }
  };

  return (
    <div className="absolute top-0 left-[560px] text-black z-10 h-full pb-4 ">
      <ScrollArea className="w-full h-full rounded-xl overflow-hidden mt-2">
        <div className="w-[400px] bg-white rounded-xl relative">
          <div className="w-full h-[240px] overflow-hidden flex items-center justify-center rounded-t-xl relative">
            <Image src={carlogo} alt="logo" className="w-[400px] h-[400px]" />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 cursor-pointer hover:bg-neutral-100"
              onClick={onClose}
            >
              <XIcon size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
              <div className="text-headline-4 text-neutral-900">
                {data?.name}
              </div>
              <button
                onClick={handleNavigate}
                className="flex items-center justify-center text-white gap-2 w-8 h-8 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-2 text-accent-green">Open</span>
              <span className="w-1 h-1 bg-[#D9D9D9] rounded-full"></span>
              <span className="text-body-2 text-neutral-500">Closes 17:00</span>
              <Star className="w-4 h-4 text-accent-yellow fill-accent-yellow" />
              <span className="text-title-2 text-accent-yellow">
                4.8
                <span className="pl-1 text-body-3 text-neutral-300">(123)</span>
              </span>
            </div>
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <div className="flex items-center gap-0.5 text-body-2 text-neutral-500">
                  {data?.address}
                  <Dot className="w-4 h-4 text-neutral-500" />
                  {data?.howFarAway} miles
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500" />
                <span className="text-body-2 text-neutral-500">
                  +1972 325 2970
                </span>
              </div>
            </div>
            <Separator className="" />
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-transparent w-full">
                <TabsTrigger value="about" className="w-full text-title-2">
                  About
                </TabsTrigger>
                <TabsTrigger value="reviews" className="w-full text-title-2">
                  Reviews
                </TabsTrigger>
              </TabsList>
              <TabsContent value="about">
                <CarWashAbout />
              </TabsContent>
              <TabsContent value="reviews">
                <CarWashReviews setReviewOpen={setReviewOpen} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
      <CreateCarWashReviewModal open={reviewOpen} onOpenChange={setReviewOpen} />
    </div>
  );
};

export default CarWashDetail;
