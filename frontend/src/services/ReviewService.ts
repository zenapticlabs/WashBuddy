import axios from "axios";
import { IReviewCreate } from "@/types/Review";
import axiosInstance from "@/lib/axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const createReview = async (review: IReviewCreate) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/v1/carwash/reviews/create/`,
      review
    );
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const getReviews = async (carwashId: string) => {
  const response = await axiosInstance.get(
    `${API_URL}/api/v1/carwash/reviews/search?carWashId=${carwashId}`
  );
  return response.data;
};
