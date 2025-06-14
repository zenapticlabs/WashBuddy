import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const signIn = async (email: string, type: string, password?: string) => {
    try {
        const requestBody = type === 'password' ? { email, password } : { email };
        const response = await axios.post(`${API_URL}/api/v1/accounts/signIn/${type}/`, requestBody);

        return response.data;
    } catch (error) {
        console.error("Error during sign in:", error);
        throw error;
    }
};

export const verifyOTP = async (email: string, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/api/v1/accounts/verifyOTP/`, { email, token });
        return response.data;
    } catch (error) {
        console.error("Error fetching amenities:", error);
        throw error;
    }
};

export const signUpWithOTP = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
        const response = await axios.post(`${API_URL}/api/v1/accounts/signUpWithOTP/`, { email, password, firstName, lastName });
        return response.data;
    } catch (error) {
        console.error("Error during sign up:", error);
        throw error;
    }
};