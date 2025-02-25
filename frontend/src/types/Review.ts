export interface IReviewShow {
  id: string;
  username: string;
  avatar?: string;
  reviewText: string;
  reviewRating: number;
  photos?: string[];
  createdAt: string;
}
