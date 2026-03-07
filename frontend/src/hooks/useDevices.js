import { useApp } from '../context/AppContext';

/** Hook to access devices data with room grouping. */
export function useDevices() {
    const { devices, toggleDevice } = useApp();

    const totalPower = devices.filter(d => d.is_on).reduce((sum, d) => sum + d.power_watts, 0);
    const activeCount = devices.filter(d => d.is_on).length;

    const byRoom = devices.reduce((acc, d) => {
        if (!acc[d.room_id]) acc[d.room_id] = [];
        acc[d.room_id].push(d);
        return acc;
    }, {});

    return { devices, totalPower, activeCount, byRoom, toggleDevice };
}

export default useDevices;
