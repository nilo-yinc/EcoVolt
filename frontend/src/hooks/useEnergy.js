import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

/** Hook for energy stats derived from rooms and devices. */
export function useEnergy() {
    const { rooms, devices } = useApp();

    const stats = useMemo(() => {
        const wasteRooms = rooms.filter(r => r.waste_detected);
        const totalWasteDuration = wasteRooms.reduce((sum, r) => sum + r.waste_duration, 0);
        const wastePower = devices
            .filter(d => wasteRooms.some(r => r.id === d.room_id) && d.is_on)
            .reduce((sum, d) => sum + d.power_watts, 0);

        // Estimated energy wasted (Wh) = power * duration / 3600
        const energyWasted = (wastePower * totalWasteDuration) / 3600;
        // Estimated cost (₹8 per kWh average India rate)
        const costWasted = (energyWasted / 1000) * 8;

        return {
            totalWasteDuration,
            wastePower,
            energyWasted: Math.round(energyWasted),
            costWasted: costWasted.toFixed(2),
            wasteRoomCount: wasteRooms.length,
        };
    }, [rooms, devices]);

    // Mock historical data for charts
    const hourlyData = useMemo(() => {
        const hours = [];
        for (let i = 23; i >= 0; i--) {
            const h = new Date();
            h.setHours(h.getHours() - i);
            hours.push({
                hour: h.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                waste: Math.floor(Math.random() * 500 + 50),
                saved: Math.floor(Math.random() * 300 + 100),
                occupancy: Math.floor(Math.random() * 40),
            });
        }
        return hours;
    }, []);

    const dailyData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            day,
            waste: Math.floor(Math.random() * 5000 + 500),
            saved: Math.floor(Math.random() * 4000 + 1000),
        }));
    }, []);

    return { ...stats, hourlyData, dailyData };
}

export default useEnergy;
