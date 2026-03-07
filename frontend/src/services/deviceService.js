import api from './api';

function resolveCvApiUrl() {
    const configured = (import.meta.env.VITE_CV_API_URL || '').trim();
    return configured || 'http://127.0.0.1:8000';
}

function isFastApiOnlyMode() {
    const apiUrl = (import.meta.env.VITE_API_URL || '').trim().toLowerCase();
    return apiUrl.includes('localhost:8000') || apiUrl.includes('127.0.0.1:8000');
}

async function getDevicesFromCvFallback() {
    const cvBase = resolveCvApiUrl().replace(/\/+$/, '');
    try {
        const res = await fetch(`${cvBase}/status`, { cache: 'no-store' });
        if (!res.ok) return [];
        const s = await res.json();
        return [
            { id: 'dt1', room_id: s.room_id || 'test-room', name: 'Bulb 1', type: 'light', is_on: !!s.lights_on, power_watts: 60, controllable: true },
            { id: 'dt2', room_id: s.room_id || 'test-room', name: 'Bulb 2', type: 'light', is_on: !!s.lights_on, power_watts: 60, controllable: true },
            { id: 'dt3', room_id: s.room_id || 'test-room', name: 'Fan', type: 'fan', is_on: (s.fan_count || 0) > 0, power_watts: 75, controllable: true },
        ];
    } catch {
        return [];
    }
}

export const deviceService = {
    getDevices: async () => {
        if (isFastApiOnlyMode()) return getDevicesFromCvFallback();
        return api.get('/api/devices').then(r => r.data);
    },
    toggleDevice: async (id) => {
        if (isFastApiOnlyMode()) return { id, toggled: true };
        return api.post(`/api/devices/${id}/toggle`).then(r => r.data);
    },
};

export default deviceService;
