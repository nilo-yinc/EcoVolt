import { useWebSocketStatus } from '../context/WebSocketContext';

/** Hook to read WebSocket connection status. */
export function useWebSocket() {
    return useWebSocketStatus();
}

export default useWebSocket;
