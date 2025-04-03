export interface IReviewShow {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  user_metadata: {
    iss: string;
    sub: string;
    name: string;
    email: string;
    picture: string;
    lastName: string;
    firstName: string;
    full_name: string;
    avatar_url: string;
    provider_id: string;
    email_verified: boolean;
    phone_verified: boolean;
  };
  comment: string;
  overall_rating: number;
  wash_quality_rating: number;
  price_value_rating: number;
  facility_cleanliness_rating: number;
  customer_service_rating: number;
  amenities_extra_rating: number;
  created_by: string | null;
  updated_by: string | null;
  car_wash: number;
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


