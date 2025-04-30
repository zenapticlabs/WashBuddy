import axiosInstance from '../lib/axios';

export const getPaymentHistory = async () => {
    const response = await axiosInstance.get('/api/v1/carwash/payments/history');
    return response.data;
};

