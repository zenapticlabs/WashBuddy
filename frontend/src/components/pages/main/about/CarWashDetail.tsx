import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarWashAbout from "./CarWashAbout";
import CarWashReviews from "./CarWashReviews";
import {
  ArrowRight,
  Dot,
  MapPin,
  Phone,
  Star,
  XIcon,
  ImageIcon,
} from "lucide-react";
import { CarWashResponse } from "@/types";
import CreateCarWashReviewModal from "./CreateCarWashReviewModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { getReviews } from "@/services/ReviewService";
import { IReviewShow } from "@/types/Review";
import { ReviewsSummary } from "@/types";
import emptyImage from "@/assets/empty.png";

interface CarWashDetailProps {
  data?: CarWashResponse | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onNavigate?: (location: { lat: number; lng: number }) => void;
  selectedWashTypes: string[];
}


const CarWashDetail: React.FC<CarWashDetailProps> = ({
  data,
  onNavigate,
  open,
  setOpen,
  selectedWashTypes,
}) => {
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const [closingTime, setClosingTime] = useState<string>("");
  const [activeTab, setActiveTab] = useState("about");

  const handleReviewCreated = (newReview: IReviewShow) => {
    setReviews(prev => [newReview, ...prev]);
    // Update the reviews summary in the data object
    if (data?.reviews_summary) {
      const ratingKey = `rating_${newReview.overall_rating}` as keyof ReviewsSummary;
      const currentRating = (data.reviews_summary as any)[ratingKey] || 0;
      data.reviews_summary = {
        ...data.reviews_summary,
        total_reviews: (data.reviews_summary.total_reviews || 0) + 1,
        average_rating: ((data.reviews_summary.average_rating || 0) * (data.reviews_summary.total_reviews || 0) + newReview.overall_rating) / ((data.reviews_summary.total_reviews || 0) + 1),
        [ratingKey]: currentRating + 1
      } as ReviewsSummary;
    }
  };

  useEffect(() => {
    setActiveTab("about");
    setReviewOpen(false);
  }, [data]);

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

  useEffect(() => {
    setReviewLoading(true);
    getReviews(data?.id.toString() || "").then((res: any) => {
      setReviews(res.data[0].results || []);
      setReviewLoading(false);
    });
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

  const imageURL = data?.image_url ||
    data?.images.find((image) => image.image_type === "Site")?.image_url ||
    data?.images.find((image) => image.image_type === "Exterior")?.image_url ||
    data?.images.find((image) => image.image_type === "Interior")?.image_url ||
    data?.images.find((image) => image.image_type === "Amenities")?.image_url ||
    data?.images.find((image) => image.image_type === "Menu")?.image_url;

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
            {imageURL ? (
              <Image
                src={imageURL}
                alt={data?.car_wash_name || "car_wash_name"}
                className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                width={400}
                height={240}
                quality={75}
                onError={() => setImageLoading(false)}
                onLoadingComplete={() => setImageLoading(false)}
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-neutral-300" />
              </div>
            )}
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 cursor-pointer hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              <XIcon size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {reviewLoading && (
              <div className="flex h-full flex-col gap-2">
                <Skeleton className="w-48 h-6" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Separator className="" />
                <Tabs
                  defaultValue="aboutSkeleton"
                  className="w-full"
                >
                  <TabsList className="bg-transparent w-full">
                    <TabsTrigger value="aboutSkeleton" className="w-full text-title-2">
                      About
                    </TabsTrigger>
                    <TabsTrigger value="reviewsSkeleton" className="w-full text-title-2">
                      Reviews
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="aboutSkeleton">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-2/3 h-4" />
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-full h-4" />

                    </div>
                  </TabsContent>
                  <TabsContent value="reviewsSkeleton">
                    <Skeleton className="w-full h-4" />
                  </TabsContent>
                </Tabs>

              </div>
            )}
            {!reviewLoading && (
              <>
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
                    className={`text-body-2 ${isOpen ? "text-accent-green" : "text-accent-red"
                      }`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </span>
                  {data.open_24_hours && (
                    <>
                      <span className="w-1 h-1 bg-[#D9D9D9] rounded-full"></span>
                      <span className="text-body-2 text-neutral-500">24 hours</span>
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
                    {data?.reviews_summary?.average_rating || 0}
                    <span className="pl-1 text-body-3 text-neutral-300">
                      ({data.reviews_summary?.total_reviews || 0})
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
                <Tabs
                  defaultValue="about"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
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
                    <CarWashReviews
                      setReviewOpen={setReviewOpen}
                      reviews={reviews}
                      reviewsSummary={data?.reviews_summary}
                      onReviewCreated={handleReviewCreated}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
      <CreateCarWashReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        carWashId={data?.id || 0}
        onReviewCreated={handleReviewCreated}
      />
    </>
  );
  return (
    <>
      {open && data && (
        <div className="hidden md:block absolute top-0 left-[560px] text-black z-20 h-full pb-4">
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
