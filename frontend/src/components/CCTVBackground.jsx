import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const FEEDS = [
    { id: 'CAM-01', label: 'MAIN LOBBY', status: 'live' },
    { id: 'CAM-02', label: 'CORRIDOR-B', status: 'live' },
    { id: 'CAM-03', label: 'SERVER ROOM', status: 'offline' },
    { id: 'CAM-04', label: 'ROOF ACCESS', status: 'live' },
    { id: 'CAM-05', label: 'LAB WING', status: 'alert' },
    { id: 'CAM-06', label: 'PARKING LOT', status: 'live' },
    { id: 'CAM-07', label: 'LECTURE HALL', status: 'live' },
    { id: 'CAM-08', label: 'CAFETERIA', status: 'live' },
    { id: 'CAM-09', label: 'LIBRARY', status: 'alert' },
];

const STATUS_COLORS = {
    live: '#22d3ee',
    alert: '#f59e0b',
    offline: '#ef4444',
};

const STATUS_LABELS = {
    live: 'LIVE',
    alert: 'ALERT',
    offline: 'NO SIGNAL',
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function CCTVBackground() {
    const { isDark } = useTheme();
    const [time, setTime] = useState(new Date());
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let raf = 0;
        const handleMove = (event) => {
            const xRatio = (event.clientX / window.innerWidth) * 2 - 1;
            const yRatio = (event.clientY / window.innerHeight) * 2 - 1;
            const target = {
                x: clamp(xRatio * 8, -8, 8),
                y: clamp(yRatio * 6, -6, 6),
            };

            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                setOffset((prev) => ({
                    x: prev.x + (target.x - prev.x) * 0.08,
                    y: prev.y + (target.y - prev.y) * 0.08,
                }));
            });
        };

        const reset = () => {
            setOffset((prev) => ({
                x: prev.x * 0.4,
                y: prev.y * 0.4,
            }));
        };

        window.addEventListener('mousemove', handleMove, { passive: true });
        window.addEventListener('mouseleave', reset);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseleave', reset);
        };
    }, []);

    const timeStr = useMemo(
        () => time.toLocaleTimeString('en-US', { hour12: false }),
        [time],
    );
    const dateStr = useMemo(
        () =>
            time
                .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                .toUpperCase(),
        [time],
    );

    /* ── Very subtle: 6% in dark, 5% in light ──────────── */
    const panelOpacity = isDark ? 'opacity-[0.06]' : 'opacity-[0.05]';
    const panelBase = isDark ? '#000000' : '#f8fbff';
    const panelDateColor = isDark ? 'text-cyan-200/30' : 'text-sky-700/25';
    const panelScanGlow = isDark ? 'rgba(34,211,238,0.10)' : 'rgba(14,165,233,0.12)';

    return (
        <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
            {/* Subtle ambient glow */}
            <div
                className="absolute -inset-8 transition-transform duration-700 ease-out"
                style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.06),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(14,116,144,0.08),transparent_45%)] dark:opacity-100 opacity-60" />
                <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.88),rgba(230,242,255,0.72),rgba(216,236,255,0.6))] dark:hidden" />
            </div>

            {/* Camera grid — very faint */}
            <div
                className={`absolute inset-0 p-3 grid grid-cols-3 grid-rows-3 gap-1.5 ${panelOpacity} transition-transform duration-700 ease-out`}
                style={{ transform: `translate3d(${offset.x * -0.25}px, ${offset.y * -0.25}px, 0)` }}
            >
                {FEEDS.map((feed, index) => {
                    const color = STATUS_COLORS[feed.status];
                    return (
                        <div
                            key={feed.id}
                            className="relative overflow-hidden rounded-md border"
                            style={{ borderColor: `${color}44`, background: panelBase }}
                        >
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[8px] font-mono tracking-[0.14em]">
                                <span style={{ color: `${color}99` }}>{feed.id}</span>
                                <span style={{ color: `${color}88` }}>{STATUS_LABELS[feed.status]}</span>
                            </div>
                            <div className="absolute top-2 left-16 right-16 text-center text-[8px] font-mono tracking-[0.11em]" style={{ color: `${color}66` }}>
                                {feed.label}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-px" style={{ background: `${color}44` }} />
                                <div className="absolute w-px h-12" style={{ background: `${color}44` }} />
                                <div className="absolute w-4 h-4 rounded-full border" style={{ borderColor: `${color}44` }} />
                            </div>
                            <div className="absolute left-0 right-0 top-1/3 h-px" style={{ background: `${color}15` }} />
                            <div className="absolute left-0 right-0 top-2/3 h-px" style={{ background: `${color}15` }} />

                            {feed.status === 'offline' && (
                                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono tracking-[0.2em] text-red-500/25">
                                    NO SIGNAL
                                </div>
                            )}

                            {feed.status !== 'offline' && (
                                <div
                                    className="absolute left-0 right-0 h-[1px]"
                                    style={{
                                        background: `linear-gradient(90deg,transparent,${panelScanGlow},transparent)`,
                                        animation: `feedScan ${3 + index * 0.65}s linear infinite`,
                                    }}
                                />
                            )}

                            <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-between text-[7px] font-mono tracking-[0.12em] ${panelDateColor}`}>
                                <span>{dateStr}</span>
                                <span>{timeStr}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Very soft vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_75%_at_50%_50%,transparent_40%,rgba(0,0,0,0.4)_100%)] dark:opacity-80 opacity-15" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent dark:from-black/40" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent dark:from-black/35" />
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent dark:from-black/25" />

            {/* Scanline — very subtle */}
            <div className="main-scanline opacity-40" />
        </div>
    );
}
