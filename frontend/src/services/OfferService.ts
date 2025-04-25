import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getOffers = async (userLat: number, userLng: number) => {
    const response = await axios.get(`${API_URL}/api/v1/carwash/offers/search`, {
        params: {
            userLat,
            userLng,
        },
    });
    return response.data;
};

