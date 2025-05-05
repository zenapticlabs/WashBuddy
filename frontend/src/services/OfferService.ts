import axiosInstance from '../lib/axios';

export const getOffers = async (userLat: number, userLng: number) => {
    const response = await axiosInstance.get('/api/v1/carwash/offers/search', {
        params: {
            userLat,
            userLng,
        },
    });
    return response.data;
};

