import axiosInstance from '../lib/axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getOffers = async (userLat: number, userLng: number) => {
    const response = await axiosInstance.get('/api/v1/carwash/payments/history', {
        params: {
            userLat,
            userLng,
        },
    });
    return response.data;
};

