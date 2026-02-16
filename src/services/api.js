import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const analyzeSoil = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/analyze`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getHealthCheck = async () => {
    try {
        const response = await axios.get(`${API_URL}/`);
        return response.data;
    } catch (error) {
        console.error("Health Check Error:", error);
        throw error;
    }
};
