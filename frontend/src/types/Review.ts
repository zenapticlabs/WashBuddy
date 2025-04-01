export interface IReviewShow {
  id: string;
  username: string;
  avatar?: string;
  reviewText: string;
  reviewRating: number;
  photos?: string[];
  createdAt: string;
}

export interface IMyReview {
  id: string;
  carWashName: string;
  carWashImage: string;
  carWashAddress: string;
  reviewText: string;
  reviewRating: number;
  photos?: string[];
  createdAt: string;
}

interface ReviewImage {
  image_url: string;
}

export interface IReviewCreate {
  images: ReviewImage[];
  comment: string;
  overall_rating: number;
  wash_quality_rating: number;
  price_value_rating: number;
  facility_cleanliness_rating: number;
  customer_service_rating: number;
  amenities_extra_rating: number;
  car_wash: number;
}

