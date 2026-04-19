import axios, { AxiosResponse } from 'axios';

const API_URL = 'https://d35b12e35xr9rp.cloudfront.net';

interface SoilAnalysisRequest {
    [key: string]: unknown;
}

interface SoilAnalysisResponse {
    [key: string]: unknown;
}

interface HealthCheckResponse {
    status: string;
    [key: string]: unknown;
}

export const analyzeSoil = async (formData: SoilAnalysisRequest): Promise<SoilAnalysisResponse> => {
    try {
        const response: AxiosResponse<SoilAnalysisResponse> = await axios.post(`${API_URL}/analyze`, formData, {
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

export const getHealthCheck = async (): Promise<HealthCheckResponse> => {
    try {
        const response: AxiosResponse<HealthCheckResponse> = await axios.get(`${API_URL}/`);
        return response.data;
    } catch (error) {
        console.error("Health Check Error:", error);
        throw error;
    }
};
