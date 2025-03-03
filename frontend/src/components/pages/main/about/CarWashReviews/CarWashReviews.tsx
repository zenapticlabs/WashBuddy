import { ReviewShow } from "@/components/organism/reviewShow";
import { IReviewShow } from "@/types/Review";

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

const CarWashReviews: React.FC = ({}) => {
  return (
    <div className="flex flex-col gap-3">
      <ReviewShow data={review1} />
    </div>
  );
};

export default CarWashReviews;
