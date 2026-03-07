import api from './api';

export const deviceService = {
    getDevices: () => api.get('/api/devices').then(r => r.data),
    toggleDevice: (id) => api.post(`/api/devices/${id}/toggle`).then(r => r.data),
};

export default deviceService;
