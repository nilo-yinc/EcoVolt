import { Bell, WifiOff, Search, Activity, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useWebSocketStatus } from '../context/WebSocketContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

export default function Navbar() {
    const { alerts } = useApp();
    const { connected } = useWebSocketStatus();
    const [showAlerts, setShowAlerts] = useState(false);
    const [time, setTime] = useState(new Date());
    const location = useLocation();

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const page = PAGE_TITLES[location.pathname] ?? { label: 'EcoVolt', sub: '' };
    const unreadCount = alerts.filter(a => a.severity === 'high').length;
    const timeStr = time.toLocaleTimeString('en-US', { hour12: false });

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
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '280px' }} className="hidden lg:block">
                <div style={{ position: 'relative' }}>
                    <Search
                        size={13}
                        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search rooms, devices..."
                        className="form-input"
                        style={{ paddingLeft: '2rem', fontSize: '0.8125rem', height: '34px', paddingTop: 0, paddingBottom: 0 }}
                    />
                </div>
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
            </div>
        </header>
    );
}
