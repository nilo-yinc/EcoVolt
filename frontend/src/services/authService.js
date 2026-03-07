import axios from 'axios';

function resolveAuthApiUrl() {
    const configured = (import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_CV_API_URL || '').trim();
    return configured || 'http://127.0.0.1:8000';
}

const authApi = axios.create({
    baseURL: resolveAuthApiUrl(),
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

export const authService = {
    async login(email, password) {
        const payload = { email, password };
        try {
            const response = await authApi.post('/auth/login', payload);
            return response.data;
        } catch (error) {
            // Compatibility fallback when API is served behind an /api prefix.
            if (error?.response?.status === 404) {
                const response = await authApi.post('/api/auth/login', payload);
                return response.data;
            }
            throw error;
        }
    },
};

export default authService;
