import { Bell, WifiOff, Search, Activity, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useWebSocketStatus } from '../context/WebSocketContext';
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_TITLES = {
    '/dashboard': { label: 'Dashboard', sub: 'Real-time campus overview' },
    '/campus': { label: 'Campus Map', sub: 'Multi-building overview' },
    '/heatmap': { label: 'Heatmap', sub: 'Thermal occupancy analysis' },
    '/rooms': { label: 'Rooms', sub: 'Live room monitoring' },
    '/ghost-view': { label: 'Ghost View', sub: 'Vacant room detection' },
    '/computer-labs': { label: 'Computer Labs', sub: 'Lab intelligence' },
    '/energy-analytics': { label: 'Energy Analytics', sub: 'Consumption trends' },
    '/energy-alerts': { label: 'Energy Alerts', sub: 'Active energy warnings' },
    '/manual-control': { label: 'Manual Control', sub: 'Device override' },
    '/devices': { label: 'Devices', sub: 'Device registry' },
    '/audit-logs': { label: 'Audit Logs', sub: 'System activity trail' },
    '/rules': { label: 'Rules', sub: 'Automation rule engine' },
    '/privacy': { label: 'Privacy', sub: 'Compliance & data governance' },
    '/settings': { label: 'Settings', sub: 'System configuration' },
};

function resolveCvApiUrl() {
    const configured = (import.meta.env.VITE_CV_API_URL || '').trim();
    return configured || 'http://127.0.0.1:8000';
}

export default function Navbar() {
    const { alerts, rooms, devices } = useApp();
    const { connected } = useWebSocketStatus();
    const [showAlerts, setShowAlerts] = useState(false);
    const [time, setTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [espIpInput, setEspIpInput] = useState('');
    const [espIpLocked, setEspIpLocked] = useState(false);
    const [espSaveMsg, setEspSaveMsg] = useState('');
    const [espBusy, setEspBusy] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const page = PAGE_TITLES[location.pathname] ?? { label: 'EcoVolt', sub: '' };
    const unreadCount = alerts.filter(a => a.severity === 'high').length;
    const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
    const showEspConfig = true;
    const cvApiBase = resolveCvApiUrl().replace(/\/+$/, '');
    const searchTargets = useMemo(() => {
        const pageTargets = Object.entries(PAGE_TITLES).map(([path, meta]) => ({
            path,
            label: meta.label,
            type: 'Page',
            text: `${meta.label} ${meta.sub}`.toLowerCase(),
        }));
        const roomTargets = (rooms || []).map((room) => ({
            path: `/rooms/${room.id}`,
            label: room.name || room.id,
            type: 'Room',
            text: `${room.name || ''} ${room.location || ''} ${room.id || ''}`.toLowerCase(),
        }));
        const deviceTargets = (devices || []).map((d) => ({
            path: '/devices',
            label: d.name || d.type || 'Device',
            type: 'Device',
            text: `${d.name || ''} ${d.type || ''} ${d.room_id || ''}`.toLowerCase(),
        }));
        const aliases = [
            { path: '/dashboard', label: 'Dashboard', type: 'Page', text: 'home overview main' },
            { path: '/ghost-view', label: 'Ghost View', type: 'Page', text: 'ghost camera cctv privacy feed' },
            { path: '/manual-control', label: 'Manual Control', type: 'Page', text: 'manual esp iot control led fan' },
            { path: '/rooms', label: 'Rooms', type: 'Page', text: 'room classroom lab' },
            { path: '/devices', label: 'Devices', type: 'Page', text: 'device appliance fan light projector monitor' },
            { path: '/energy-analytics', label: 'Energy Analytics', type: 'Page', text: 'energy graph trend usage' },
            { path: '/energy-alerts', label: 'Energy Alerts', type: 'Page', text: 'alerts warning threat' },
            { path: '/settings', label: 'Settings', type: 'Page', text: 'config configure setup' },
        ];
        return [...pageTargets, ...roomTargets, ...deviceTargets, ...aliases];
    }, [rooms, devices]);

    const suggestions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return searchTargets
            .filter((t) => t.text.includes(q))
            .slice(0, 6);
    }, [searchQuery, searchTargets]);

    const runSearch = (forcedTarget = null) => {
        const target = forcedTarget || suggestions[0] || null;
        if (target?.path) {
            navigate(target.path);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    useEffect(() => {
        if (!showEspConfig) return;
        let mounted = true;
        (async () => {
            try {
                const res = await fetch(`${cvApiBase}/config/esp32-ip`, { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                if (!mounted) return;
                const savedIp = (data?.ip_address || '').trim();
                setEspIpInput(savedIp);
                setEspIpLocked(!!savedIp);
            } catch {
                // no-op
            }
        })();
        return () => { mounted = false; };
    }, [showEspConfig, cvApiBase]);

    const saveEspIp = async () => {
        const ip = espIpInput.trim();
        setEspBusy(true);
        setEspSaveMsg('');
        try {
            const res = await fetch(`${cvApiBase}/config/esp32-ip`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip_address: ip }),
            });
            if (!res.ok) throw new Error('save failed');
            localStorage.setItem('esp32_ip', ip);
            setEspIpLocked(!!ip);
            setEspSaveMsg('ESP IP saved');
        } catch {
            setEspSaveMsg('Failed to save ESP IP');
        } finally {
            setEspBusy(false);
            setTimeout(() => setEspSaveMsg(''), 2500);
        }
    };

    const resetEspIp = async () => {
        setEspBusy(true);
        setEspSaveMsg('');
        try {
            const res = await fetch(`${cvApiBase}/config/esp32-ip`, { method: 'DELETE' });
            if (!res.ok) throw new Error('reset failed');
            localStorage.removeItem('esp32_ip');
            setEspIpInput('');
            setEspIpLocked(false);
            setEspSaveMsg('ESP IP reset');
        } catch {
            setEspSaveMsg('Failed to reset ESP IP');
        } finally {
            setEspBusy(false);
            setTimeout(() => setEspSaveMsg(''), 2500);
        }
    };

    return (
        <header
            style={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.25rem',
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                zIndex: 20,
                gap: '1rem',
            }}
        >
            {/* ── Left: Page title ──────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                <p
                    className="brand-wordmark"
                    style={{ fontSize: '0.9rem', color: 'var(--text-1)', lineHeight: 1 }}
                >
                    {page.label}
                </p>
                {page.sub && (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', lineHeight: 1 }}>
                        {page.sub}
                    </p>
                )}
            </div>

            {/* ── Center: search ────────────────────────────────── */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: showEspConfig ? '560px' : '360px' }} className="hidden lg:flex lg:items-center lg:gap-2">
                <div style={{ position: 'relative' }}>
                    <Search
                        size={13}
                        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search rooms, devices..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSearchOpen(true);
                        }}
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') runSearch();
                        }}
                        className="form-input"
                        style={{ paddingLeft: '2rem', fontSize: '0.8125rem', height: '34px', paddingTop: 0, paddingBottom: 0, width: '240px' }}
                    />
                    {searchOpen && suggestions.length > 0 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '38px',
                                left: 0,
                                width: '240px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                boxShadow: 'var(--shadow-xl)',
                                zIndex: 60,
                                overflow: 'hidden',
                            }}
                        >
                            {suggestions.map((s, idx) => (
                                <button
                                    key={`${s.path}-${idx}`}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        runSearch(s);
                                    }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.5rem 0.625rem',
                                        border: 'none',
                                        borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border)',
                                        background: 'transparent',
                                        color: 'var(--text-2)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontFamily: 'JetBrains Mono',
                                    }}
                                >
                                    <span style={{ color: 'var(--text-1)' }}>{s.label}</span>
                                    <span style={{ color: 'var(--text-4)', marginLeft: '6px' }}>· {s.type}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {showEspConfig && (
                    <>
                        <input
                            type="text"
                            value={espIpInput}
                            onChange={(e) => setEspIpInput(e.target.value)}
                            placeholder={espIpLocked ? '' : 'ESP32 IP (e.g. 10.175.12.15)'}
                            className="form-input"
                            readOnly={espIpLocked}
                            style={{
                                fontSize: '0.75rem',
                                height: '34px',
                                paddingTop: 0,
                                paddingBottom: 0,
                                width: '170px',
                                cursor: espIpLocked ? 'not-allowed' : 'text',
                                opacity: espIpLocked ? 0.9 : 1,
                            }}
                        />
                        <button
                            type="button"
                            onClick={saveEspIp}
                            disabled={espBusy || espIpLocked || !espIpInput.trim()}
                            style={{
                                height: '34px',
                                padding: '0 10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface-2)',
                                color: 'var(--text-2)',
                                fontSize: '0.6875rem',
                                fontFamily: 'JetBrains Mono',
                                cursor: 'pointer',
                            }}
                        >
                            SAVE
                        </button>
                        <button
                            type="button"
                            onClick={resetEspIp}
                            disabled={espBusy}
                            style={{
                                height: '34px',
                                padding: '0 10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(248,113,113,0.35)',
                                background: 'rgba(248,113,113,0.08)',
                                color: 'var(--red)',
                                fontSize: '0.6875rem',
                                fontFamily: 'JetBrains Mono',
                                cursor: 'pointer',
                            }}
                        >
                            RESET
                        </button>
                        {espIpLocked && (
                            <>
                                <span
                                    className="hidden xl:inline"
                                    style={{
                                        fontSize: '0.6875rem',
                                        color: 'var(--text-3)',
                                        fontFamily: 'JetBrains Mono',
                                        whiteSpace: 'nowrap',
                                    }}
                                    title={`ESP IP Address: ${espIpInput}`}
                                >
                                    ESP IP: {espIpInput}
                                </span>
                                <span
                                    className="inline xl:hidden"
                                    style={{
                                        fontSize: '0.6875rem',
                                        color: 'var(--text-3)',
                                        fontFamily: 'JetBrains Mono',
                                        whiteSpace: 'nowrap',
                                    }}
                                    title={`ESP IP Address: ${espIpInput}`}
                                >
                                    IP SAVED
                                </span>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* ── Right: status indicators ──────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

                {/* Clock */}
                <div
                    style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}
                >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-2)', letterSpacing: '0.06em', tabularNums: true }}>
                        {timeStr}
                    </span>
                </div>

                {/* Connection badge */}
                <div
                    className="hidden md:flex"
                    style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${connected ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
                        background: connected ? 'var(--green-dim)' : 'var(--amber-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}
                >
                    {connected ? (
                        <>
                            <Activity size={11} style={{ color: 'var(--green)' }} />
                            <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: 'var(--green)', letterSpacing: '0.06em' }}>LIVE</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={11} style={{ color: 'var(--amber)' }} />
                            <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: 'var(--amber)', letterSpacing: '0.06em' }}>DEMO</span>
                        </>
                    )}
                </div>

                {/* Threat level */}
                <div
                    className="hidden xl:flex"
                    style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${unreadCount > 0 ? 'rgba(248,113,113,0.25)' : 'var(--border)'}`,
                        background: unreadCount > 0 ? 'var(--red-dim)' : 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}
                >
                    <Shield size={11} style={{ color: unreadCount > 0 ? 'var(--red)' : 'var(--text-3)' }} />
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono', color: unreadCount > 0 ? 'var(--red)' : 'var(--text-3)', letterSpacing: '0.06em' }}>
                        {unreadCount > 0 ? `THREAT ${unreadCount}` : 'CLEAR'}
                    </span>
                </div>

                {/* Alerts bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowAlerts(!showAlerts)}
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-2)',
                            transition: 'all 0.15s',
                            position: 'relative',
                        }}
                        aria-label="Notifications"
                    >
                        <Bell size={14} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: 'var(--red)',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showAlerts && (
                        <div
                            className="animate-slide-up"
                            style={{
                                position: 'absolute',
                                top: '42px',
                                right: 0,
                                width: '320px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: 'var(--shadow-xl)',
                                overflow: 'hidden',
                                zIndex: 50,
                            }}
                        >
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)' }}>Alerts</p>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-4)', background: 'var(--surface-3)', padding: '2px 8px', borderRadius: '999px' }}>
                                    {alerts.length} total
                                </span>
                            </div>
                            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                {alerts.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-4)', fontSize: '0.8125rem' }}>No active alerts</p>
                                ) : (
                                    alerts.slice(0, 8).map(alert => (
                                        <div
                                            key={alert.id}
                                            style={{
                                                padding: '0.625rem 1rem',
                                                borderBottom: '1px solid var(--border)',
                                                borderLeft: `3px solid ${alert.severity === 'high' ? 'var(--red)' : 'var(--amber)'}`,
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)' }}>{alert.room_name}</p>
                                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-4)' }}>
                                                    {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                                                </p>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{alert.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {showEspConfig && espSaveMsg && (
                    <div
                        style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-2)',
                            color: 'var(--text-2)',
                            fontSize: '0.6875rem',
                            fontFamily: 'JetBrains Mono',
                        }}
                    >
                        {espSaveMsg}
                    </div>
                )}
            </div>
        </header>
    );
}
