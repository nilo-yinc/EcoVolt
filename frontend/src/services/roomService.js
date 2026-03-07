import api from './api';

export const roomService = {
    getRooms: () => api.get('/api/rooms').then(r => r.data),
    getRoom: (id) => api.get(`/api/rooms/${id}`).then(r => r.data),
    updateConfig: (id, config) => api.put(`/api/rooms/${id}/config`, config).then(r => r.data),
};

export default roomService;
