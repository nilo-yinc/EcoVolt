import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function EnergyChart({ data = [], variant = 'area', title }) {
    const { isDark } = useTheme();

    const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(14,26,48,0.06)';
    const tick = isDark ? '#6879a0' : '#96a5c4';
    const tooltip = {
        contentStyle: {
            background: isDark ? '#111827' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e2e7f5'}`,
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            fontSize: '0.8125rem',
            color: isDark ? '#e8eeff' : '#0e1a30',
        },
        cursor: { fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
    };

    const fmt = (v) => `${v} Wh`;

    return (
        <div style={{ width: '100%' }}>
            {title && (
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: '0.875rem' }}>
                    {title}
                </p>
            )}
            <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {variant === 'area' ? (
                        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.22} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke={grid} vertical={false} />
                            <XAxis dataKey="hour" stroke="none" tick={{ fill: tick, fontSize: 11 }} tickLine={false} />
                            <YAxis stroke="none" tick={{ fill: tick, fontSize: 11 }} tickLine={false} tickFormatter={fmt} />
                            <Tooltip {...tooltip} formatter={fmt} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
                            <Area type="monotone" dataKey="waste" name="Wasted" stroke="#ef4444" strokeWidth={2} fill="url(#wasteGrad)" dot={false} />
                            <Area type="monotone" dataKey="saved" name="Saved" stroke="#10b981" strokeWidth={2} fill="url(#savedGrad)" dot={false} />
                        </AreaChart>
                    ) : (
                        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke={grid} vertical={false} />
                            <XAxis dataKey={data[0]?.hour !== undefined ? 'hour' : 'name'} stroke="none" tick={{ fill: tick, fontSize: 11 }} tickLine={false} />
                            <YAxis stroke="none" tick={{ fill: tick, fontSize: 11 }} tickLine={false} />
                            <Tooltip {...tooltip} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
                            <Bar dataKey="waste" name="Wasted" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="saved" name="Saved" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
