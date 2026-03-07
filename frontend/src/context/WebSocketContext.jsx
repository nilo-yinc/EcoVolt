import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from './AppContext';

const WebSocketContext = createContext(null);
const WS_ENABLED = (import.meta.env.VITE_ENABLE_WS || 'false') === 'true';

function resolveWsUrl() {
    if (!WS_ENABLED) return '';
    const configured = (import.meta.env.VITE_WS_URL || '').trim();
    const nodeDefault = 'wss://ecovolt-node.onrender.com/ws';

    if (!configured) return nodeDefault;

    // Guard against misconfigured Python CV URL in frontend env.
    if (configured.includes('ecovolt.onrender.com')) return nodeDefault;

    return configured;
}

function resolveCvApiUrl() {
    const configured = (import.meta.env.VITE_CV_API_URL || '').trim();
    return configured || 'http://127.0.0.1:8000';
}

/**
 * WebSocket provider — connects to backend for real-time updates.
 * In demo mode (no backend), simulates live updates every few seconds.
 */
export function WebSocketProvider({ children }) {
    const { dispatch } = useApp();
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const demoTimer = useRef(null);
    const cvPollTimer = useRef(null);

    // ── Attempt real WebSocket connection ─────────────────────────
    const connect = useCallback(() => {
        const wsUrl = resolveWsUrl();
        if (!wsUrl) {
            setConnected(false);
            return;
        }

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                console.log('[WS] Connected to backend');
                // Stop demo mode if real connection established
                if (demoTimer.current) clearInterval(demoTimer.current);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'snapshot') {
                        if (data.payload?.rooms) {
                            dispatch({ type: 'SET_ROOMS', payload: data.payload.rooms });
                        }
                        if (data.payload?.devices) {
                            dispatch({ type: 'SET_DEVICES', payload: data.payload.devices });
                        }
                    } else if (data.type === 'room_update') {
                        dispatch({ type: 'UPDATE_ROOM', payload: data.payload });
                    } else if (data.type === 'device_update') {
                        dispatch({ type: 'UPDATE_DEVICE', payload: data.payload });
                    } else if (data.type === 'alert') {
                        dispatch({ type: 'ADD_ALERT', payload: data.payload });
                    } else if (data.type === 'ghost_frame') {
                        dispatch({
                            type: 'SET_GHOST_FRAME',
                            payload: { ...data.payload, received_at: Date.now() },
                        });
                    }
                } catch (err) {
                    console.warn('[WS] Invalid message:', err);
                }
            };

            ws.onclose = () => {
                setConnected(false);
                console.log('[WS] Disconnected — starting demo mode');
                startDemoMode();
                // Auto-reconnect after 5 seconds
                reconnectTimer.current = setTimeout(connect, 5000);
            };

            ws.onerror = () => {
                ws.close();
            };
        } catch {
            // WebSocket not available — use demo mode
            setConnected(false);
            startDemoMode();
        }
    }, [dispatch]);

    // ── Demo mode: simulate live updates ──────────────────────────
    const startDemoMode = useCallback(() => {
        if (demoTimer.current) return; // already running

        demoTimer.current = setInterval(() => {
            // Randomly update a room's person count
            const roomIds = ['room-101', 'room-102', 'room-103', 'room-201', 'room-202', 'room-203'];
            const targetRoom = roomIds[Math.floor(Math.random() * roomIds.length)];
            const newCount = Math.floor(Math.random() * 20);
            const isWaste = newCount === 0 && Math.random() > 0.4;

            dispatch({
                type: 'UPDATE_ROOM',
                payload: {
                    id: targetRoom,
                    person_count: newCount,
                    status: newCount > 0 ? 'secure' : (isWaste ? 'waste' : 'recently_vacated'),
                    waste_detected: isWaste,
                    waste_duration: isWaste ? Math.floor(Math.random() * 3600) : 0,
                    last_updated: Date.now(),
                },
            });
        }, 4000);
    }, [dispatch]);

    const startCvPolling = useCallback(() => {
        if (cvPollTimer.current) return;
        const cvBase = resolveCvApiUrl().replace(/\/+$/, '');

        cvPollTimer.current = setInterval(async () => {
            try {
                const res = await fetch(`${cvBase}/ghost/frame`, { cache: 'no-store' });
                if (!res.ok) return;
                const frame = await res.json();
                if (!frame?.image_b64) return;

                dispatch({
                    type: 'SET_GHOST_FRAME',
                    payload: { ...frame, received_at: Date.now() },
                });

                if (frame?.room_id) {
                    dispatch({
                        type: 'UPDATE_ROOM',
                        payload: {
                            id: frame.room_id,
                            person_count: frame.person_count ?? 0,
                            waste_detected: !!frame.waste_detected,
                            status: frame.waste_detected ? 'waste' : ((frame.person_count ?? 0) > 0 ? 'secure' : 'recently_vacated'),
                            last_updated: Date.now(),
                        },
                    });
                }

                dispatch({ type: 'SET_BACKEND_ONLINE', payload: true });
            } catch {
                // Leave existing status if another backend connection is active.
            }
        }, 700);
    }, [dispatch]);

    useEffect(() => {
        connect();
        startCvPolling();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (demoTimer.current) clearInterval(demoTimer.current);
            if (cvPollTimer.current) clearInterval(cvPollTimer.current);
        };
    }, [connect, startCvPolling]);

    return (
        <WebSocketContext.Provider value={{ connected }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocketStatus() {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error('useWebSocketStatus must be used within WebSocketProvider');
    return ctx;
}
