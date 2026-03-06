import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import roomService from '../services/roomService';
import deviceService from '../services/deviceService';
import energyService from '../services/energyService';

// ── Mock Data ─────────────────────────────────────────────────────
const MOCK_ROOMS = [
    {
        id: 'test-room', name: 'Test Room T-001', location: 'Test Block',
        status: 'secure', person_count: 0, camera_source: 'CCTV-TEST',
        appliances: { lights: false, fan: false, projector: false, monitors: false },
        waste_detected: false, waste_duration: 0, last_updated: Date.now(),
    },
    {
        id: 'room-101', name: 'Lecture Hall A', location: 'Block A, Floor 1',
        status: 'secure', person_count: 12, camera_source: 'CCTV-01',
        appliances: { projector: true, monitors: false, lights: true },
        waste_detected: false, waste_duration: 0, last_updated: Date.now(),
    },
    {
        id: 'room-102', name: 'Computer Lab B', location: 'Block B, Floor 2',
        status: 'waste', person_count: 0, camera_source: 'CCTV-02',
        appliances: { projector: true, monitors: true, lights: true },
        waste_detected: true, waste_duration: 245, last_updated: Date.now(),
    },
    {
        id: 'room-103', name: 'Seminar Room C', location: 'Block A, Floor 3',
        status: 'recently_vacated', person_count: 0, camera_source: 'CCTV-03',
        appliances: { projector: false, monitors: false, lights: true },
        waste_detected: false, waste_duration: 0, last_updated: Date.now(),
    },
    {
        id: 'room-201', name: 'Physics Lab', location: 'Block C, Floor 1',
        status: 'secure', person_count: 8, camera_source: 'CCTV-04',
        appliances: { projector: false, monitors: true, lights: true },
        waste_detected: false, waste_duration: 0, last_updated: Date.now(),
    },
    {
        id: 'room-202', name: 'Library Reading Hall', location: 'Block D, Floor 1',
        status: 'waste', person_count: 0, camera_source: 'CCTV-05',
        appliances: { projector: false, monitors: false, lights: true },
        waste_detected: true, waste_duration: 1820, last_updated: Date.now(),
    },
    {
        id: 'room-203', name: 'Chemistry Lab', location: 'Block C, Floor 2',
        status: 'secure', person_count: 15, camera_source: 'CCTV-06',
        appliances: { projector: true, monitors: true, lights: true },
        waste_detected: false, waste_duration: 0, last_updated: Date.now(),
    },
];

const MOCK_DEVICES = [
    { id: 'dt1', room_id: 'test-room', name: 'Bulb 1', type: 'light', is_on: false, power_watts: 60, controllable: true },
    { id: 'dt2', room_id: 'test-room', name: 'Bulb 2', type: 'light', is_on: false, power_watts: 60, controllable: true },
    { id: 'dt3', room_id: 'test-room', name: 'Fan', type: 'fan', is_on: false, power_watts: 75, controllable: true },
    { id: 'dt4', room_id: 'test-room', name: 'Projector', type: 'projector', is_on: false, power_watts: 300, controllable: true },
    { id: 'dt5', room_id: 'test-room', name: 'Desktop', type: 'monitor', is_on: false, power_watts: 150, controllable: true },
    { id: 'd1', room_id: 'room-101', name: 'Ceiling Lights', type: 'light', is_on: true, power_watts: 120, controllable: true },
    { id: 'd2', room_id: 'room-101', name: 'Projector', type: 'projector', is_on: true, power_watts: 300, controllable: true },
    { id: 'd3', room_id: 'room-102', name: 'Lab Monitors (x12)', type: 'monitor', is_on: true, power_watts: 600, controllable: true },
    { id: 'd4', room_id: 'room-102', name: 'Projector', type: 'projector', is_on: true, power_watts: 300, controllable: true },
    { id: 'd5', room_id: 'room-102', name: 'Ceiling Lights', type: 'light', is_on: true, power_watts: 120, controllable: false },
    { id: 'd6', room_id: 'room-103', name: 'Tube Lights', type: 'light', is_on: true, power_watts: 80, controllable: true },
    { id: 'd7', room_id: 'room-201', name: 'Ceiling Lights', type: 'light', is_on: true, power_watts: 150, controllable: true },
    { id: 'd8', room_id: 'room-201', name: 'Lab PCs (x8)', type: 'monitor', is_on: true, power_watts: 480, controllable: false },
    { id: 'd9', room_id: 'room-202', name: 'Reading Lights', type: 'light', is_on: true, power_watts: 200, controllable: true },
    { id: 'd10', room_id: 'room-203', name: 'Fume Hood Lights', type: 'light', is_on: true, power_watts: 60, controllable: false },
];

const MOCK_ALERTS = [
    { id: 0, room_id: 'test-room', room_name: 'Test Room T-001', message: 'Test Room initialized — 2 Bulbs, 1 Fan, 1 Projector, 1 Desktop. All OFF. Monitoring: CCTV + Current Detector.', severity: 'low', timestamp: Date.now() },
    { id: 1, room_id: 'room-102', room_name: 'Computer Lab B', message: 'Energy waste detected — all appliances ON, room empty for 4 min', severity: 'high', timestamp: Date.now() - 60000 },
    { id: 2, room_id: 'room-202', room_name: 'Library Reading Hall', message: 'Lights left ON — room empty for 30 min', severity: 'high', timestamp: Date.now() - 120000 },
    { id: 3, room_id: 'room-103', room_name: 'Seminar Room C', message: 'Room recently vacated — monitoring appliances', severity: 'medium', timestamp: Date.now() - 300000 },
    { id: 4, room_id: 'room-201', room_name: 'Physics Lab', message: 'Occupancy normalized — 8 people detected', severity: 'low', timestamp: Date.now() - 600000 },
];

const MOCK_CONFIG = {
    empty_timeout: 30,
    waste_confirmation: 60,
    confidence_threshold: 0.5,
    process_fps: 1,
    notification_email: true,
    notification_sms: false,
    auto_shutoff: false,
};

// ── State ───────────────────────────────────────────────────────
const initialState = {
    rooms: MOCK_ROOMS,
    devices: MOCK_DEVICES,
    alerts: MOCK_ALERTS,
    ghostFrames: {},
    config: MOCK_CONFIG,
    loading: false,
    backendOnline: false,
    sidebarOpen: true,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_ROOMS':
            return { ...state, rooms: action.payload };
        case 'UPDATE_ROOM':
            return {
                ...state,
                rooms: state.rooms.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r),
            };
        case 'SET_DEVICES':
            return { ...state, devices: action.payload };
        case 'UPDATE_DEVICE':
            return {
                ...state,
                devices: state.devices.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d),
            };
        case 'TOGGLE_DEVICE': {
            const devices = state.devices.map(d =>
                d.id === action.payload ? { ...d, is_on: !d.is_on } : d
            );
            return { ...state, devices };
        }
        case 'SET_ALERTS':
            return { ...state, alerts: action.payload };
        case 'ADD_ALERT':
            return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 50) };
        case 'SET_GHOST_FRAME':
            return {
                ...state,
                ghostFrames: {
                    ...state.ghostFrames,
                    [action.payload.room_id]: {
                        ...action.payload,
                        received_at: Date.now()
                    },
                },
            };
        case 'SET_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_BACKEND_ONLINE':
            return { ...state, backendOnline: action.payload };
        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebarOpen: !state.sidebarOpen };
        default:
            return state;
    }
}

// ── Context ─────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const [rooms, devices, logs] = await Promise.all([
                    roomService.getRooms(),
                    deviceService.getDevices(),
                    energyService.getLogs(),
                ]);

                if (!mounted) return;

                dispatch({ type: 'SET_ROOMS', payload: rooms });
                dispatch({ type: 'SET_DEVICES', payload: devices });
                dispatch({
                    type: 'SET_ALERTS', payload: logs.filter(l => l.event === 'cv_update' && l.waste_detected).slice(0, 30).map((l, i) => ({
                        id: `boot-${i}`,
                        room_id: l.room_id,
                        room_name: l.room_id,
                        message: 'Waste event recovered from backend history',
                        severity: 'medium',
                        timestamp: l.timestamp * 1000,
                    }))
                });
                dispatch({ type: 'SET_BACKEND_ONLINE', payload: true });
            } catch {
                if (!mounted) return;
                dispatch({ type: 'SET_BACKEND_ONLINE', payload: false });
            } finally {
                if (mounted) {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            }
        };

        loadData();
        return () => {
            mounted = false;
        };
    }, []);

    const toggleDevice = useCallback(async (deviceId) => {
        dispatch({ type: 'TOGGLE_DEVICE', payload: deviceId });
        try {
            const updated = await deviceService.toggleDevice(deviceId);
            dispatch({ type: 'UPDATE_DEVICE', payload: updated });
        } catch {
            // Roll back optimistic update.
            dispatch({ type: 'TOGGLE_DEVICE', payload: deviceId });
        }
    }, []);

    const updateConfig = useCallback(async (updates) => {
        dispatch({ type: 'SET_CONFIG', payload: updates });
        try {
            await Promise.all(state.rooms.map(room => roomService.updateConfig(room.id, updates)));
        } catch {
            // Local UI config still updates in fallback mode.
        }
    }, [state.rooms]);

    const toggleSidebar = useCallback(() => {
        dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []);

    const value = { ...state, dispatch, toggleDevice, updateConfig, toggleSidebar };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
