import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getWashTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/wash-types`);
    return response.data;
  } catch (error) {
    console.error("Error fetching wash types:", error);
    throw error;
  }
};



