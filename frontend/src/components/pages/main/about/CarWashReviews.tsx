import { ReviewShow } from "@/components/organism/reviewShow";
import { CheckTag } from "@/components/ui/checkTag";
import { Input } from "@/components/ui/input";
import { Rate } from "@/components/ui/rate";
import { RateCountBar } from "@/components/ui/RateCountBar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewsSummary } from "@/types";
import { IReviewShow } from "@/types/Review";
import { SlidersVertical, Star, TextSearch } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

const defaultAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";

const orders = ["Newest", "Relevance", "Highest", "Lowest"];

interface CarWashReviewsProps {
  setReviewOpen: (open: boolean) => void;
  reviews: IReviewShow[];
  reviewsSummary: ReviewsSummary;
  onReviewCreated?: (review: IReviewShow) => void;
}

const CarWashReviews: React.FC<CarWashReviewsProps> = ({
  setReviewOpen,
  reviews,
  reviewsSummary,
  onReviewCreated,
}) => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string>(orders[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localReviews, setLocalReviews] = useState<IReviewShow[]>(reviews);

  // Update local reviews when prop reviews change
  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const handleReviewCreated = (review: IReviewShow) => {
    setLocalReviews(prev => [review, ...prev]);
    onReviewCreated?.(review);
  };

  const filteredAndSortedReviews = useMemo(() => {
    let filteredReviews = [...localReviews];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredReviews = filteredReviews.filter(
        (review) =>
          review.user_metadata?.name?.toLowerCase().includes(query) ||
          review.comment?.toLowerCase().includes(query)
      );
    }

    // Sort the filtered reviews
    switch (selectedOrder) {
      case "Newest":
        return filteredReviews.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "Highest":
        return filteredReviews.sort((a, b) => b.overall_rating - a.overall_rating);
      case "Lowest":
        return filteredReviews.sort((a, b) => a.overall_rating - b.overall_rating);
      default:
        return filteredReviews;
    }
  }, [localReviews, selectedOrder, searchQuery]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 items-center justify-center px-8">
          <div className="text-title-2 text-neutral-900 text-[32px]">
            {reviewsSummary?.average_rating}
          </div>
          <Rate value={reviewsSummary?.average_rating} max={5} size="xs" />
          <div className="text-body-3 text-neutral-400">
            ({reviewsSummary?.total_reviews} reviews)
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <RateCountBar
            mark={5}
            total={reviewsSummary?.total_reviews}
            value={reviewsSummary?.rating_5}
          />
          <RateCountBar
            mark={4}
            total={reviewsSummary?.total_reviews}
            value={reviewsSummary?.rating_4}
          />
          <RateCountBar
            mark={3}
            total={reviewsSummary?.total_reviews}
            value={reviewsSummary?.rating_3}
          />
          <RateCountBar
            mark={2}
            total={reviewsSummary?.total_reviews}
            value={reviewsSummary?.rating_2}
          />
          <RateCountBar
            mark={1}
            total={reviewsSummary?.total_reviews}
            value={reviewsSummary?.rating_1}
          />
        </div>
      </div>
      <Separator />
      <div className="">
        <div className="text-title-2 text-neutral-900 mb-2">
          Rate and review
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {
            user?.user_metadata?.avatar_url ? (
              <Image
                src={user?.user_metadata?.avatar_url || defaultAvatar}
                alt={`${user?.user_metadata?.firstName}'s avatar`}
                className="w-10 h-10 rounded-full"
                width={40}
                height={40}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center">
                {user?.user_metadata?.firstName?.charAt(0).toUpperCase()}
              </div>
            )
          }
          <span onClick={() => setReviewOpen(true)}>
            <Rate
              value={reviewsSummary?.average_rating}
              max={5}
              size="md"
              color="default-yellow"
            />
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
          placeholder="Search by name or comment"
          className="w-full p-3 pl-8"
          maxLength={1000}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SlidersVertical size={16} className="text-neutral-800 mx-1" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {orders.map((order) => (
          <CheckTag
            key={order}
            label={order}
            checked={selectedOrder === order}
            onClick={() => setSelectedOrder(order)}
          />
        ))}
      </div>
      {filteredAndSortedReviews.map((review) => (
        <ReviewShow key={review.id} data={review} />
      ))}
    </div>
  );
};

export default CarWashReviews;
