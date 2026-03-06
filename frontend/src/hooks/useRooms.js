import { useApp } from '../context/AppContext';

/** Hook to access rooms data from global state. */
export function useRooms() {
    const { rooms } = useApp();

    const secureCount = rooms.filter(r => r.status === 'secure').length;
    const wasteCount = rooms.filter(r => r.status === 'waste').length;
    const totalPeople = rooms.reduce((sum, r) => sum + r.person_count, 0);

    return { rooms, secureCount, wasteCount, totalPeople };
}

export default useRooms;
