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
