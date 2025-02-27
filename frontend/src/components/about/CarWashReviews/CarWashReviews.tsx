import { ReviewShow } from "@/components/organism/reviewShow";
import { CheckTag } from "@/components/ui/checkTag";
import { Rate } from "@/components/ui/rate";
import { RateCountBar } from "@/components/ui/RateCountBar";

export interface CarWashReviewsProps {}

const reviews = [119, 3, 0, 0, 0];

const review1 = {
  username: "John Doe",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
  reviewText: "Error veniam velit aut non aut eligendi voluptatem non cupiditate. Quia quis inventore ad unde natus ab fugiat officia. Sunt assumenda necessitatibus explicabo sit officia. Voluptates tempore ipsa cumque amet nesciunt numquam. Voluptatem facilis quia laboriosam neque praesentium ut.",
  reviewPoint: "4.5",
  reviewRating: 4.5,
  photos:[],
};
const CarWashReviews: React.FC<CarWashReviewsProps> = ({}) => {
  return (
    <div className="flex flex-col gap-3">
      <RateCountBar total={120} value={110} mark={5} />
      <Rate value={3.3} max={5} size="xs" />
      <Rate value={3.3} max={5} size="sm" />
      <Rate value={3.7} max={5} size="md" />
      <Rate value={4.5} max={5} size="md" color="blue-500" />
      <Rate value={4.5} max={5} size="md" fullWidth />
      <div className="flex gap-2">
        <CheckTag label="Relevance" checked />
        <CheckTag label="Relevance" />
      </div>
      <ReviewShow
        username={review1.username}
        avatar={review1.avatar}
        reviewText={review1.reviewText}
        reviewRating={review1.reviewRating}
        createdAt="2025-02-16"
      />
    </div>
  );
};

export default CarWashReviews;
