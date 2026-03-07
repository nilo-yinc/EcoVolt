import api from './api';

export const energyService = {
    getLogs: () => api.get('/api/energy/logs').then(r => r.data),
    getStats: () => api.get('/api/energy/stats').then(r => r.data),
    getSavings: () => api.get('/api/energy/savings').then(r => r.data),
};

export default energyService;
