import axiosInstance from '../lib/axios';

export const getOffers = async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.append(key, value.toString());
        }
    });
    const response = await axiosInstance.get('/api/v1/carwash/offers/search', {
        params,
    });
    return response.data;
};

