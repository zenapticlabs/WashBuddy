import { ReviewShow } from "@/components/organism/reviewShow";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckTag } from "@/components/ui/checkTag";
import { Input } from "@/components/ui/input";
import { Rate } from "@/components/ui/rate";
import { RateCountBar } from "@/components/ui/RateCountBar";
import { Separator } from "@/components/ui/separator";
import { IReviewShow } from "@/types/Review";
import { Search, SlidersVertical, Star, TextSearch } from "lucide-react";
import { useState } from "react";

const defaultAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";

const review1: IReviewShow = {
  id: "1",
  username: "John Doe",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
  reviewText:
    "Error veniam velit aut non aut eligendi voluptatem non cupiditate. Quia quis inventore ad unde natus ab fugiat officia. Sunt assumenda necessitatibus explicabo sit officia. Voluptates tempore ipsa cumque amet nesciunt numquam. Voluptatem facilis quia laboriosam neque praesentium ut.",
  reviewRating: 4.5,
  photos: [],
  createdAt: "2025-02-16",
};

const orders = ["Relevance", "Newest", "Highest", "Lowest"];

interface CarWashReviewsProps {
  setReviewOpen: (open: boolean) => void;
}

const CarWashReviews: React.FC<CarWashReviewsProps> = ({ setReviewOpen }) => {
  const [selectedOrder, setSelectedOrder] = useState<string>(orders[0]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1 items-center justify-center">
          <div className="text-title-2 text-neutral-900 text-[32px]">4.8</div>
          <Rate value={4.8} max={5} size="xs" />
          <div className="text-body-3 text-neutral-400">(123 reviews)</div>
        </div>
        <div className="flex flex-col gap-1 w-[240px]">
          <RateCountBar mark={5} total={130} value={119} />
          <RateCountBar mark={4} total={130} value={3} />
          <RateCountBar mark={3} total={130} value={2} />
          <RateCountBar mark={2} total={130} value={1} />
          <RateCountBar mark={1} total={130} value={1} />
        </div>
      </div>
      <Separator />
      <div className="">
        <div className="text-title-2 text-neutral-900 mb-2">
          Rate and review
        </div>
        <div className="flex gap-2 items-center">
          <img
            src={defaultAvatar}
            alt={`${defaultAvatar}'s avatar`}
            className="w-10 h-10 rounded-full"
          />
          <span onClick={() => setReviewOpen(true)}>
            <Rate value={4.8} max={5} size="md" color="text-neutral-500" />
          </span>
          <div className="flex items-center justify-center gap-1">
            <div className="h-6 w-6 rounded-full bg-gradient-to-t from-[#FFA100] to-[#FFC35C] flex items-center justify-center">
              <Star className="text-white stroke-0.5" size={16} />
            </div>
            <span className="text-body-2 text-neutral-500">+ 25 Points</span>
            <span className="text-xs text-neutral-200 w-4 h-4 rounded-full border border-neutral-200 flex items-center justify-center">
              i
            </span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex items-center gap-2 relative">
        <TextSearch className="text-neutral-500 absolute left-3" size={16} />
        <Input
          placeholder="Search review"
          className="w-full p-3 pl-8"
          maxLength={1000}
        />
        <SlidersVertical size={16} className="text-neutral-800 mx-1" />
      </div>
      <div className="flex items-center gap-2">
        {orders.map((order) => (
          <CheckTag
            key={order}
            label={order}
            checked={selectedOrder === order}
            onClick={() => setSelectedOrder(order)}
          />
        ))}
      </div>
      <ReviewShow data={review1} />
    </div>
  );
};

export default CarWashReviews;
