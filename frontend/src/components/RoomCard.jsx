import { Users, MonitorSmartphone, Projector, Lightbulb, Fan, Snowflake, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 60) { const h = Math.floor(m / 60); return `${h}h ${m % 60}m`; }
    return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

export default function RoomCard({ room }) {
    const { id, name, location, status, person_count, appliances, waste_detected, waste_duration } = room;

    return (
        <div
            className="card"
            id={`room-card-${id}`}
            style={{
                padding: '1.125rem',
                borderLeftWidth: waste_detected ? '3px' : '1px',
                borderLeftColor: waste_detected ? 'var(--red)' : 'var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.2 }}>{name}</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{location}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <div style={{ padding: '0.5rem 0.625rem', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={13} style={{ color: person_count > 0 ? 'var(--accent)' : 'var(--text-4)', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>{person_count}</p>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>People</p>
                    </div>
                </div>
                <div style={{ padding: '0.5rem 0.625rem', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={13} style={{ color: waste_detected ? 'var(--red)' : 'var(--text-4)', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: waste_detected ? 'var(--red)' : 'var(--text-1)', lineHeight: 1, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                            {formatDuration(waste_duration)}
                        </p>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>Waste</p>
                    </div>
                </div>
            </div>

            {/* Appliance chips */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                <ApplianceChip icon={Projector} label="Projector" on={appliances?.projector} />
                <ApplianceChip icon={MonitorSmartphone} label="Monitors" on={appliances?.monitors} />
                <ApplianceChip icon={Fan} label="Fan" on={appliances?.fan} />
                <ApplianceChip icon={Lightbulb} label="Lights" on={appliances?.lights} />
                <ApplianceChip icon={Snowflake} label="AC" on={appliances?.ac} />
            </div>
        </div>
    );
}

function ApplianceChip({ icon: Icon, label, on }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                background: on ? 'var(--accent-dim)' : 'var(--surface-3)',
                color: on ? 'var(--accent)' : 'var(--text-4)',
                border: `1px solid ${on ? 'rgba(79,110,247,0.2)' : 'var(--border)'}`,
            }}
            title={`${label}: ${on ? 'ON' : 'OFF'}`}
        >
            <Icon size={10} />
            {on ? 'ON' : 'OFF'}
        </span>
    );
}
