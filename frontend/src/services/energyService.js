import api from './api';

function isFastApiOnlyMode() {
    const apiUrl = (import.meta.env.VITE_API_URL || '').trim().toLowerCase();
    const cvUrl = (import.meta.env.VITE_CV_API_URL || '').trim().toLowerCase();
    if (!apiUrl) return true;
    if (cvUrl && apiUrl === cvUrl) return true;
    return apiUrl.includes('localhost:8000') || apiUrl.includes('127.0.0.1:8000');
}

export const energyService = {
    getLogs: async () => {
        if (isFastApiOnlyMode()) return [];
        return api.get('/api/energy/logs').then(r => r.data);
    },
    getStats: async () => {
        if (isFastApiOnlyMode()) return {};
        return api.get('/api/energy/stats').then(r => r.data);
    },
    getSavings: async () => {
        if (isFastApiOnlyMode()) return {};
        return api.get('/api/energy/savings').then(r => r.data);
    },
};

export default energyService;
