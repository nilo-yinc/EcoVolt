import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, DoorOpen, Plug, Settings, ChevronLeft, ChevronRight,
    Map, Eye, Ghost, Power, TrendingUp, AlertTriangle, Monitor,
    FileText, Sliders, Shield, Sun, Moon,
} from 'lucide-react';
import logoImg from '../assets/ecovolt-logo.png';

const sections = [
    {
        title: 'Overview',
        links: [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/campus', label: 'Campus', icon: Map },
            { to: '/heatmap', label: 'Heatmap', icon: Eye },
        ],
    },
    {
        title: 'Monitor',
        links: [
            { to: '/rooms', label: 'Rooms', icon: DoorOpen },
            { to: '/ghost-view', label: 'Ghost View', icon: Ghost },
            { to: '/computer-labs', label: 'Labs', icon: Monitor },
        ],
    },
    {
        title: 'Energy',
        links: [
            { to: '/energy-analytics', label: 'Analytics', icon: TrendingUp },
            { to: '/energy-alerts', label: 'Alerts', icon: AlertTriangle },
            { to: '/manual-control', label: 'Control', icon: Power },
        ],
    },
    {
        title: 'System',
        links: [
            { to: '/devices', label: 'Devices', icon: Plug },
            { to: '/audit-logs', label: 'Logs', icon: FileText },
            { to: '/rules', label: 'Rules', icon: Sliders },
            { to: '/privacy', label: 'Privacy', icon: Shield },
            { to: '/settings', label: 'Settings', icon: Settings },
        ],
    },
];

/** EcoVolt Logo */
function Logo({ size = 32 }) {
    return (
        <img
            src={logoImg}
            alt="EcoVolt"
            width={size}
            height={size}
            style={{ borderRadius: '10px', objectFit: 'cover' }}
        />
    );
}

export default function Sidebar() {
    const { sidebarOpen, toggleSidebar } = useApp();
    const { isDark, toggleTheme } = useTheme();

    return (
        <aside
            style={{
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--border)',
                width: sidebarOpen ? '232px' : '60px',
                transition: 'width 0.25s ease',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 20,
            }}
        >
            {/* ── Logo area ──────────────────────────────── */}
            <Link
                to="/"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: sidebarOpen ? '1.1rem 1rem' : '1.1rem 0.75rem',
                    borderBottom: '1px solid var(--border)',
                    minHeight: '60px',
                    textDecoration: 'none',
                }}
            >
                <Logo size={32} />
                {sidebarOpen && (
                    <div className="animate-fade-in overflow-hidden">
                        <p className="brand-wordmark text-[15px]" style={{ color: 'var(--text-1)' }}>
                            Eco<span style={{ color: 'var(--accent)' }}>Volt</span>
                        </p>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>
                            Energy Surveillance
                        </p>
                    </div>
                )}
            </Link>

            {/* ── Navigation ─────────────────────────────── */}
            <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
                {sections.map((section) => (
                    <div key={section.title} style={{ marginBottom: '1.25rem' }}>
                        {sidebarOpen && (
                            <p className="nav-section-label" style={{ marginBottom: '0.375rem' }}>
                                {section.title}
                            </p>
                        )}
                        {!sidebarOpen && (
                            <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0.25rem 0.625rem' }} />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {section.links.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={to === '/dashboard'}
                                    className={({ isActive }) =>
                                        `nav-link${isActive ? ' nav-link-active' : ''}`
                                    }
                                    style={!sidebarOpen ? { justifyContent: 'center', padding: '0.5rem 0' } : undefined}
                                    title={!sidebarOpen ? label : undefined}
                                >
                                    <Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                                    {sidebarOpen && (
                                        <span className="animate-fade-in">{label}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── Bottom: theme toggle + collapse ─────────── */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                    onClick={toggleTheme}
                    className="nav-link"
                    style={{ justifyContent: sidebarOpen ? undefined : 'center' }}
                    title={isDark ? 'Light mode' : 'Dark mode'}
                >
                    {isDark
                        ? <Sun size={15} strokeWidth={1.75} />
                        : <Moon size={15} strokeWidth={1.75} />
                    }
                    {sidebarOpen && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                {/* Online indicator */}
                {sidebarOpen && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px rgba(52,211,153,0.5)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>
                            System Online
                        </span>
                    </div>
                )}
            </div>

            {/* Collapse button */}
            <button
                onClick={toggleSidebar}
                style={{
                    position: 'absolute',
                    top: '60px',
                    right: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-3)',
                    boxShadow: 'var(--shadow-sm)',
                    zIndex: 10,
                    transition: 'all 0.15s',
                }}
                aria-label="Toggle sidebar"
            >
                {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>
        </aside>
    );
}
