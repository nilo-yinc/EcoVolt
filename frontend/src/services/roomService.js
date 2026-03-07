import api from './api';

function resolveCvApiUrl() {
    const configured = (import.meta.env.VITE_CV_API_URL || '').trim();
    return configured || 'http://127.0.0.1:8000';
}

function isFastApiOnlyMode() {
    const apiUrl = (import.meta.env.VITE_API_URL || '').trim().toLowerCase();
    return apiUrl.includes('localhost:8000') || apiUrl.includes('127.0.0.1:8000');
}

async function getRoomsFromCvFallback() {
    const cvBase = resolveCvApiUrl().replace(/\/+$/, '');
    try {
        const res = await fetch(`${cvBase}/status`, { cache: 'no-store' });
        if (!res.ok) return [];
        const s = await res.json();
        return [{
            id: s.room_id || 'test-room',
            name: 'Test Room T-001',
            location: 'Test Block',
            status: s.waste_detected ? 'waste' : ((s.people_count || 0) > 0 ? 'secure' : 'recently_vacated'),
            person_count: s.people_count || 0,
            appliances: {
                lights: !!s.lights_on,
                fan: (s.fan_count || 0) > 0,
                projector: false,
                monitors: !!s.screens_on,
            },
            waste_detected: !!s.waste_detected,
            waste_duration: 0,
            monitoring: 'CCTV',
            last_updated: Date.now(),
        }];
    } catch {
        return [];
    }
}

export const roomService = {
    getRooms: async () => {
        if (isFastApiOnlyMode()) return getRoomsFromCvFallback();
        return api.get('/api/rooms').then(r => r.data);
    },
    getRoom: async (id) => {
        if (isFastApiOnlyMode()) {
            const rooms = await getRoomsFromCvFallback();
            return rooms.find((r) => r.id === id) || rooms[0] || null;
        }
        return api.get(`/api/rooms/${id}`).then(r => r.data);
    },
    updateConfig: async (id, config) => {
        if (isFastApiOnlyMode()) return { id, ...config };
        return api.put(`/api/rooms/${id}/config`, config).then(r => r.data);
    },
};

export default roomService;
