import { useState, useEffect, useCallback, useRef } from 'react';

const ESP_ENABLED = (import.meta.env.VITE_ENABLE_ESP32 || 'false') === 'true';
const ESP_IP = (import.meta.env.VITE_ESP32_IP || '').trim();
const BASE_URL = `http://${ESP_IP}`;
const POLL_INTERVAL_MS = 5000;

/**
 * Hook to communicate with the ESP32 IoT controller.
 * Polls /status every 5 s and exposes control functions for LED & Fan.
 */
export function useESP32(enabled = true) {
  const [ledState, setLedState] = useState(false);
  const [fanState, setFanState] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const intervalRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (!enabled || !ESP_ENABLED || !ESP_IP) return;
    try {
      const res = await fetch(`${BASE_URL}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLedState(data.ledState);
      setFanState(data.fanState);
      setConnectionStatus('connected');
    } catch {
      setConnectionStatus('disconnected');
    }
  }, [enabled]);

  // Control LED
  const controlLED = useCallback(async (action) => {
    if (!ESP_ENABLED || !ESP_IP) {
      setLastMessage('ESP32 disabled in deployment');
      return;
    }
    setIsLoading(true);
    setLastMessage('');
    try {
      const res = await fetch(`${BASE_URL}/led/${action}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setLastMessage(text);
      if (action === 'on') setLedState(true);
      else if (action === 'off') setLedState(false);
      else if (action === 'toggle') setLedState((prev) => !prev);
      setTimeout(fetchStatus, 500);
    } catch {
      setLastMessage('Failed to send LED command');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  // Control Fan
  const controlFan = useCallback(async (action) => {
    if (!ESP_ENABLED || !ESP_IP) {
      setLastMessage('ESP32 disabled in deployment');
      return;
    }
    setIsLoading(true);
    setLastMessage('');
    try {
      const res = await fetch(`${BASE_URL}/fan/${action}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setLastMessage(text);
      if (action === 'on') setFanState(true);
      else if (action === 'off') setFanState(false);
      else if (action === 'toggle') setFanState((prev) => !prev);
      setTimeout(fetchStatus, 500);
    } catch {
      setLastMessage('Failed to send Fan command');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  // Polling
  useEffect(() => {
    if (!enabled || !ESP_ENABLED || !ESP_IP) {
      setConnectionStatus('disconnected');
      return;
    }
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [enabled, fetchStatus]);

  return {
    ledState,
    fanState,
    connectionStatus,
    isLoading,
    lastMessage,
    controlLED,
    controlFan,
    refreshStatus: fetchStatus,
    espIp: ESP_IP || 'not-configured',
  };
}
