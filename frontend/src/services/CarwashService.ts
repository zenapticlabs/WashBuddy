import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const createCarwash = async (formData: any) => {
  try {
    const response = await axios.post(`${API_URL}/api/carwashes`, formData);
    return response.data;
  } catch (error) {
    console.error("Error creating car wash:", error);
    throw error;
  }
};

export const getCarwashes = async (filters: Record<string, any> = {}) => {
  try {
    const params = new URLSearchParams();
    // Add filters to the query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(`${API_URL}/api/v1/carwash/list-car-wash`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching car washes:", error);
    throw error;
  }
};
