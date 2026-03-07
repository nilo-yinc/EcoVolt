import axios from 'axios';

function resolveApiBaseUrl() {
    const configured = (import.meta.env.VITE_API_URL || '').trim();
    const nodeDefault = 'https://watt-watch-node.onrender.com';

    if (!configured) return nodeDefault;

    // Guard against misconfigured Python CV URL in frontend env.
    if (configured.includes('watt-watch.onrender.com') && !configured.includes('watt-watch-node.onrender.com')) {
        return nodeDefault;
    }

    return configured;
}

const api = axios.create({
    baseURL: resolveApiBaseUrl(),
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.warn('[API] Request failed:', error.message);
        return Promise.reject(error);
    }
);

export default api;
