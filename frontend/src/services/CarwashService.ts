import axiosInstance from "@/lib/axios";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const createCarwash = async (formData: any) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/v1/carwash/create/`, formData);
    return response.data;
  } catch (error) {
    console.error("Error creating car wash:", error);
    throw error;
  }
};

export const updateCarwash = async (id: string, formData: any) => {
  try {
    const response = await axiosInstance.patch(
      `${API_URL}/api/v1/carwash/update/${id}/`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating car wash:", error);
    throw error;
  }
};

export const getCarwashes = async (filters: Record<string, any> = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to the query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays by appending each item
          value.forEach((item) => {
            if (item !== undefined && item !== null) {
              params.append(key, item.toString());
            }
          });
        } else {
          params.append(key, value.toString());
        }
      }
    });
    const response = await axios.get(`${API_URL}/api/v1/carwash/search`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching car washes:", error);
  }
};

export const getCarwashById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/api/v1/carwash/get/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
