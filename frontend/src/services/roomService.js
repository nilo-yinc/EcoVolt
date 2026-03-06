const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const roomService = {
    async getRooms() {
        const res = await fetch(`${API}/rooms`);
        if (!res.ok) throw new Error('Failed to fetch rooms');
        return res.json();
    },
    async updateConfig(roomId, config) {
        const res = await fetch(`${API}/rooms/${roomId}/config`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error('Failed to update config');
        return res.json();
    },
};

export default roomService;
