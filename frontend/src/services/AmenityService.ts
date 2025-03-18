import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getAmenities = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/carwash/amenities/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching amenities:", error);
    throw error;
  }
};