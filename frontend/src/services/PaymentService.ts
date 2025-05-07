import axiosInstance from '../lib/axios';

export const getPaymentHistory = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/carwash/payments/history/');
        return response.data;
    } catch (error) {
        console.error('Error fetching payment history:', error);
        throw error;
    }
};

