const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const deviceService = {
    async getDevices() {
        const res = await fetch(`${API}/devices`);
        if (!res.ok) throw new Error('Failed to fetch devices');
        return res.json();
    },
    async toggleDevice(deviceId) {
        const res = await fetch(`${API}/devices/${deviceId}/toggle`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to toggle device');
        return res.json();
    },
};

export default deviceService;
