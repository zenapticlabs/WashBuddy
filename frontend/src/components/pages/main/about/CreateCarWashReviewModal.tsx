import { Rate } from "@/components/ui/rate";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SelectRate } from "@/components/ui/selectRate";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useState } from "react";
import UploadedImageCard from "@/components/ui/uploadedImageCard";
import { toast } from "sonner";
import { createReview } from "@/services/ReviewService";
import { IReviewCreate } from "@/types/Review";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const defaultAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";
const CreateCarWashReviewModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carWashId: number;
}> = ({ open, onOpenChange, carWashId }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [wash_quality_rating, setWashQualityRating] = useState(0);
  const [price_value_rating, setPriceValueRating] = useState(0);
  const [facility_cleanliness_rating, setFacilityCleanlinessRating] =
    useState(0);
  const [customer_service_rating, setCustomerServiceRating] = useState(0);
  const [amenities_extra_rating, setAmenitiesExtraRating] = useState(0);
  const [overall_rating, setOverallRating] = useState(0);
  const [images, setImages] = useState<{ image_url: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteImage = (image_url: string) => {
    setImages(images.filter((image) => image.image_url !== image_url));
  };

  const calculateOverallRating = () => {
    const ratings = [
      wash_quality_rating,
      price_value_rating,
      facility_cleanliness_rating,
      customer_service_rating,
      amenities_extra_rating,
    ];
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    setOverallRating(Math.round(average));
  };

  const handleSubmit = async () => {
    if (!comment || !overall_rating) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const reviewData: IReviewCreate = {
        images,
        comment,
        overall_rating,
        wash_quality_rating,
        price_value_rating,
        facility_cleanliness_rating,
        customer_service_rating,
        amenities_extra_rating,
        car_wash: carWashId,
      };

      await createReview(reviewData);
      toast.success("Review submitted successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainContent = () => {
    return (
      <ScrollArea className="w-full flex-1 overflow-hidden flex-1 rounded-t-xl">
        <div className="w-full bg-white relative">
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
            <div className="flex flex-col md:flex-row gap-4  justify-between">
              <div className="flex gap-2 items-center">
                {
                  user?.user_metadata?.avatar_url ? (
                    <Image
                      src={user?.user_metadata?.avatar_url || defaultAvatar}
                      alt={`${user?.user_metadata?.full_name}'s avatar`}
                      className="w-10 h-10 rounded-full"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center">
                      {user?.user_metadata?.full_name?.charAt(0).toUpperCase()}
                    </div>
                  )
                }
                <Rate value={overall_rating} max={5} size="md" />
              </div>
              <div className="flex items-center gap-1">
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
            <Textarea
              placeholder="Type your comment"
              className="w-full mt-6"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Separator className="my-4" />
            <div className="text-title-1 text-neutral-900 mb-4">
              Rate this Wash location on the following categories
            </div>
            <div className="flex flex-col gap-4">
              <SelectRate
                title="Wash Quality"
                value={wash_quality_rating}
                onChange={(value) => {
                  setWashQualityRating(value);
                  calculateOverallRating();
                }}
              />
              <SelectRate
                title="Price & Value"
                value={price_value_rating}
                onChange={(value) => {
                  setPriceValueRating(value);
                  calculateOverallRating();
                }}
              />
              <SelectRate
                title="Facility Cleanliness & Safety"
                value={facility_cleanliness_rating}
                onChange={(value) => {
                  setFacilityCleanlinessRating(value);
                  calculateOverallRating();
                }}
              />
              <SelectRate
                title="Customer Service"
                value={customer_service_rating}
                onChange={(value) => {
                  setCustomerServiceRating(value);
                  calculateOverallRating();
                }}
              />
              <SelectRate
                title="Amenities & Extras"
                value={amenities_extra_rating}
                onChange={(value) => {
                  setAmenitiesExtraRating(value);
                  calculateOverallRating();
                }}
              />
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
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {images?.map((image) => (
                  <UploadedImageCard
                    key={image.image_url}
                    image_url={image.image_url}
                    handleDeleteImage={handleDeleteImage}
                    canDelete={true}
                  />
                ))}
                {/* {uploading && (
                  <div className="p-2 bg-neutral-50 rounded-lg w-32 h-32 relative flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex flex-col p-0 rounded-t-xl overflow-hidden h-[80vh]"
        >
          <SheetHeader className="hidden">
            <SheetTitle className="text-headline-4 px-6 py-6 text-neutral-900 border-b border-neutral-100 bg-white flex items-center justify-between">
              Rate and review
            </SheetTitle>
          </SheetHeader>
          {mainContent()}
          <SheetFooter>
            <div className="w-full py-3 px-6 border-t border-neutral-100 flex gap-2 bg-white rounded-b-xl">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      {open && (
        <div className="absolute p-2 top-0 left-[400px] w-[450px] h-full z-50 flex flex-col">
          {mainContent()}
          <div className="w-full py-3 px-6 border-t border-neutral-100 flex gap-2 bg-white rounded-b-xl">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCarWashReviewModal;
