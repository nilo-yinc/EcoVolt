const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const energyService = {
    async getLogs() {
        const res = await fetch(`${API}/energy/logs`);
        if (!res.ok) throw new Error('Failed to fetch energy logs');
        return res.json();
    },
};

export default energyService;
