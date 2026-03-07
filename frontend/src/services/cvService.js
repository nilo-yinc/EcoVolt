import axios from 'axios';

function resolveCvApiUrl() {
    const configured = (import.meta.env.VITE_CV_API_URL || '').trim();
    return configured || 'http://127.0.0.1:8000';
}

const cvApi = axios.create({
    baseURL: resolveCvApiUrl(),
    timeout: 8000,
});

export const cvService = {
    getGhostFrame: () => cvApi.get('/ghost/frame').then((r) => r.data),
    getGhostStatus: () => cvApi.get('/ghost/status').then((r) => r.data),
};

export default cvService;
