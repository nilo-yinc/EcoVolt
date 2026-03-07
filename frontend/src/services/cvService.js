import api from './api';

export const cvService = {
    processGhostFrame: (payload) => api.post('/api/cv/ghost-frame', payload).then(r => r.data),
};

export default cvService;
