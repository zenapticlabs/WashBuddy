import Image from "next/image";
import carlogo from "@/assets/carlogo.jpg";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarWashAbout from "./CarWashAbout";
import CarWashReviews from "./CarWashReviews";
import {
  ArrowRight,
  CrossIcon,
  Dot,
  MapPin,
  Phone,
  Star,
  XIcon,
} from "lucide-react";
import { CarWashResponse, ICarWashCard } from "@/types";
import CreateCarWashReviewModal from "./CreateCarWashReviewModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import { extractCoordinates } from "@/utils/functions";
import { Skeleton } from "@/components/ui/skeleton";

interface CarWashDetailProps {
  data?: CarWashResponse | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onNavigate?: (location: { lat: number; lng: number }) => void;
}

const CarWashDetail: React.FC<CarWashDetailProps> = ({
  data,
  onNavigate,
  open,
  setOpen,
}) => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const [closingTime, setClosingTime] = useState<string>("");

  useEffect(() => {
    setImageLoading(true);
    if (data?.open_24_hours) {
      setIsOpen(true);
      setClosingTime("");
      return;
    }
    if (data?.operating_hours) {
      const now = new Date();
      const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
      const currentTime = now.toLocaleTimeString("en-US", { hour12: false });

      const todayHours = data.operating_hours.find(
        (hours) => hours.day_of_week === currentDay
      );

      if (todayHours && !todayHours.is_closed) {
        const isCurrentlyOpen =
          currentTime >= todayHours.opening_time &&
          currentTime <= todayHours.closing_time;
        setIsOpen(isCurrentlyOpen);

        // Convert 24h time to 12h format for display
        const closeTime = new Date(`1970-01-01T${todayHours.closing_time}`);
        setClosingTime(
          closeTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        );
      } else {
        setIsOpen(false);
        setClosingTime("");
      }
    }
  }, [data]);

  const handleNavigate = () => {
    if (data?.location) {
      const coordinates = {
        lat: data.location.coordinates[1],
        lng: data.location.coordinates[0],
      };
      onNavigate?.(coordinates);
    }
  };

  const CarWashDetailContent = ({ data }: { data: CarWashResponse }) => (
    <>
      <ScrollArea className="w-full h-full rounded-xl overflow-hidden md:mt-2">
        <div className="w-full md:w-[400px] bg-white rounded-xl relative">
          <div className="w-full h-[240px] overflow-hidden flex items-center justify-center rounded-t-xl relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <Skeleton className="w-full h-full rounded-t-xl" />
              </div>
            )}
            <Image
              src={data?.image_url || ""}
              alt={data?.car_wash_name || ""}
              className="w-full h-full object-cover"
              width={400}
              height={240}
              priority={true}
              loading="eager"
              quality={50}
              onLoadingComplete={() => setImageLoading(false)}
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIRshHRsdIR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              placeholder="blur"
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 cursor-pointer hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              <XIcon size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
              <div className="text-headline-4 text-neutral-900">
                {data?.car_wash_name}
              </div>
              <button
                onClick={handleNavigate}
                className="flex items-center justify-center text-white gap-2 w-8 h-8 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-body-2 ${
                  isOpen ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {isOpen ? "Open" : "Closed"}
              </span>
              {data.open_24_hours && (
                <>
                  <span className="w-1 h-1 bg-[#D9D9D9] rounded-full"></span>
                  <span className="text-body-2 text-neutral-500">
                    24 hours
                  </span>
                </>
              )}
              {!data.open_24_hours && isOpen && (
                <>
                  <span className="w-1 h-1 bg-[#D9D9D9] rounded-full"></span>
                  <span className="text-body-2 text-neutral-500">
                    Closes {closingTime}
                  </span>
                </>
              )}
              <Star className="w-4 h-4 text-accent-yellow fill-accent-yellow" />
              <span className="text-title-2 text-accent-yellow">
                {data?.reviews_average}
                <span className="pl-1 text-body-3 text-neutral-300">
                  ({data.reviews_count || 0})
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <div className="flex items-center gap-0.5 text-body-2 text-neutral-500">
                  {data?.formatted_address}
                  <Dot className="w-4 h-4 text-neutral-500" />
                  {Number(data.distance).toFixed(2)} miles
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500" />
                <span className="text-body-2 text-neutral-500">
                  {data?.phone || "No phone number"}
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
                <CarWashAbout data={data} />
              </TabsContent>
              <TabsContent value="reviews">
                <CarWashReviews setReviewOpen={setReviewOpen} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
      <CreateCarWashReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />
    </>
  );
  return (
    <>
      {open && data && (
        <div className="hidden md:block absolute top-0 left-[560px] text-black z-10 h-full pb-4">
          <CarWashDetailContent data={data} />
        </div>
      )}

      {isMobile && data && (
        <Sheet open={open} onOpenChange={(check) => setOpen(check)}>
          <SheetHeader>
            <SheetTitle className="hidden text-headline-4 px-6 py-6 text-neutral-900 border-b border-neutral-100 bg-white">
              {data?.car_wash_name}
            </SheetTitle>
          </SheetHeader>
          <SheetContent
            side="bottom"
            className="p-0 rounded-t-xl overflow-hidden h-[80vh]"
          >
            <CarWashDetailContent data={data} />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default CarWashDetail;
