import { useState, useEffect, useCallback, useRef } from 'react';

const ESP_ENABLED = (import.meta.env.VITE_ENABLE_ESP32 || 'true') === 'true';
const ESP_IP = (import.meta.env.VITE_ESP32_IP || '').trim();
const LOCAL_STORAGE_KEY = 'esp32_ip';
const POLL_INTERVAL_MS = 3000;
const REQUEST_TIMEOUT_MS = 4500;
const MAX_CONSECUTIVE_FAILURES = 3;

function resolveCvApiUrl() {
  const configured = (import.meta.env.VITE_CV_API_URL || '').trim();
  return configured || 'http://127.0.0.1:8000';
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'on' || v === 'active';
  }
  return false;
}

function parseLedState(data) {
  return toBool(
    data?.ledState ?? data?.led ?? data?.lightState ?? data?.lights ?? data?.bulb ?? data?.relay1
  );
}

function parseFanState(data) {
  return toBool(
    data?.fanState ?? data?.fan ?? data?.fan_status ?? data?.relay2
  );
}

/**
 * Hook to communicate with the ESP32 IoT controller.
 * Polls /status every 5 s and exposes control functions for LED & Fan.
 */
export function useESP32(enabled = true) {
  const [espIp, setEspIp] = useState(() => {
    const fromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
    return (fromStorage || ESP_IP || '').trim();
  });
  const [ledState, setLedState] = useState(false);
  const [fanState, setFanState] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const intervalRef = useRef(null);
  const pollBusyRef = useRef(false);
  const failCountRef = useRef(0);
  const cvApiBase = resolveCvApiUrl().replace(/\/+$/, '');
  const baseUrl = espIp ? `http://${espIp}` : '';

  const syncIpFromBackend = useCallback(async () => {
    const fromStorage = (localStorage.getItem(LOCAL_STORAGE_KEY) || '').trim();
    if (fromStorage) {
      // Browser value is primary and should persist until reset/history clear.
      return;
    }
    try {
      const res = await fetchWithTimeout(`${cvApiBase}/config/esp32-ip`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const ip = (data?.ip_address || '').trim();
      if (ip) {
        localStorage.setItem(LOCAL_STORAGE_KEY, ip);
        setEspIp(ip);
      }
    } catch {
      // fallback: keep local value
    }
  }, [cvApiBase]);

  const fetchStatus = useCallback(async () => {
    if (!enabled || !ESP_ENABLED || !baseUrl) {
      setConnectionStatus('disconnected');
      return;
    }
    if (pollBusyRef.current) return;
    pollBusyRef.current = true;
    try {
      let data = null;
      // Prefer backend proxy to avoid browser-to-LAN restrictions.
      const proxyRes = await fetchWithTimeout(`${cvApiBase}/esp/status?ip=${encodeURIComponent(espIp)}`);
      if (proxyRes.ok) {
        data = await proxyRes.json();
      } else {
        // Fallback to direct browser call.
        const res = await fetchWithTimeout(`${baseUrl}/status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      }
      setLedState(parseLedState(data));
      setFanState(parseFanState(data));
      failCountRef.current = 0;
      setConnectionStatus('connected');
    } catch {
      failCountRef.current += 1;
      if (failCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
        setConnectionStatus('disconnected');
      }
    } finally {
      pollBusyRef.current = false;
    }
  }, [enabled, baseUrl, cvApiBase, espIp]);

  // Control LED
  const controlLED = useCallback(async (action) => {
    if (!ESP_ENABLED || !baseUrl) {
      setLastMessage('ESP32 IP not configured');
      return;
    }
    setIsLoading(true);
    setLastMessage('');
    try {
      let text = '';
      const proxyRes = await fetchWithTimeout(`${cvApiBase}/esp/led/${action}?ip=${encodeURIComponent(espIp)}`, {}, 2500);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        text = data?.message || `LED ${action}`;
      } else {
        const res = await fetchWithTimeout(`${baseUrl}/led/${action}`, {}, 2000);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
      }
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
  }, [fetchStatus, baseUrl, cvApiBase, espIp]);

  // Control Fan
  const controlFan = useCallback(async (action) => {
    if (!ESP_ENABLED || !baseUrl) {
      setLastMessage('ESP32 IP not configured');
      return;
    }
    setIsLoading(true);
    setLastMessage('');
    try {
      let text = '';
      const proxyRes = await fetchWithTimeout(`${cvApiBase}/esp/fan/${action}?ip=${encodeURIComponent(espIp)}`, {}, 2500);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        text = data?.message || `Fan ${action}`;
      } else {
        const res = await fetchWithTimeout(`${baseUrl}/fan/${action}`, {}, 2000);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
      }
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
  }, [fetchStatus, baseUrl, cvApiBase, espIp]);

  // Polling
  useEffect(() => {
    syncIpFromBackend();
    if (!enabled || !ESP_ENABLED || !baseUrl) {
      setConnectionStatus('disconnected');
      return;
    }
    failCountRef.current = 0;
    setConnectionStatus('checking');
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [enabled, fetchStatus, baseUrl, syncIpFromBackend]);

  return {
    ledState,
    fanState,
    connectionStatus,
    isLoading,
    lastMessage,
    controlLED,
    controlFan,
    refreshStatus: fetchStatus,
    espIp: espIp || 'not-configured',
  };
}
