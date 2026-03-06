import {
    Zap, Users, AlertTriangle, Shield, TrendingDown, Clock,
} from 'lucide-react';
import { useRooms } from '../hooks/useRooms';
import { useEnergy } from '../hooks/useEnergy';
import { useApp } from '../context/AppContext';
import RoomCard from '../components/RoomCard';
import EnergyChart from '../components/EnergyChart';
import { GlareCard } from '../components/ui/glare-card';

export default function Dashboard() {
    const { rooms, secureCount, wasteCount, totalPeople } = useRooms();
    const { energyWasted, costWasted, totalWasteDuration, hourlyData } = useEnergy();
    const { alerts } = useApp();

    const wasteMins = Math.floor(totalWasteDuration / 60);
    const wasteHrs = Math.floor(wasteMins / 60);
    const wasteTimeStr = wasteHrs > 0 ? `${wasteHrs}h ${wasteMins % 60}m` : `${wasteMins}m`;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Summary stats ───────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard
                    icon={Shield} iconColor="var(--green)" iconBg="var(--green-dim)"
                    label="Secure Rooms" value={secureCount} sub={`of ${rooms.length} total`}
                    accent="var(--green)"
                />
                <StatCard
                    icon={AlertTriangle} iconColor="var(--red)" iconBg="var(--red-dim)"
                    label="Waste Detected" value={wasteCount} sub={wasteCount > 0 ? 'Action needed' : 'All clear'}
                    pulse={wasteCount > 0} accent="var(--red)"
                />
                <StatCard
                    icon={Users} iconColor="var(--accent)" iconBg="var(--accent-dim)"
                    label="Occupancy" value={totalPeople} sub="People on campus"
                    accent="var(--accent)"
                />
                <StatCard
                    icon={Zap} iconColor="var(--amber)" iconBg="var(--amber-dim)"
                    label="Energy Wasted" value={`${energyWasted} Wh`} sub={`≈ ₹${costWasted}`}
                    accent="var(--amber)"
                />
            </div>

            {/* ── Charts + Recent alerts ────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: '1rem' }}>
                        Energy Trend — Last 24 Hours
                    </p>
                    <EnergyChart data={hourlyData} variant="area" />
                </div>

                <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>Recent Alerts</p>
                        <span className="badge badge-muted">{alerts.length}</span>
                    </div>
                    {alerts.length === 0 ? (
                        <p style={{ color: 'var(--text-4)', fontSize: '0.8125rem', textAlign: 'center', paddingTop: '2rem' }}>No active alerts</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', overflowY: 'auto', maxHeight: '280px' }}>
                            {alerts.slice(0, 8).map(alert => (
                                <div
                                    key={alert.id}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '8px',
                                        background: 'var(--surface-2)',
                                        borderLeft: `3px solid ${alert.severity === 'high' ? 'var(--red)' : 'var(--amber)'}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)' }}>{alert.room_name}</p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-4)' }}>{new Date(alert.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Quick stats row ───────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: '1rem' }}>Hourly Breakdown</p>
                    <EnergyChart data={hourlyData} variant="bar" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <MiniStat icon={TrendingDown} value={`${energyWasted} Wh`} label="Wasted Today" color="var(--red)" />
                    <MiniStat icon={Zap} value={`₹${costWasted}`} label="Cost Impact" color="var(--amber)" />
                    <MiniStat icon={Clock} value={wasteTimeStr} label="Total Waste Time" color="var(--accent)" />
                    <MiniStat icon={Shield} value={`${rooms.length - wasteCount}`} label="Clean Rooms" color="var(--green)" />
                </div>
            </div>

            {/* ── Room Status ────────────────────────────────────── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>Room Status</p>
                    <span className="badge badge-muted">{rooms.length} Total</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {rooms.map(room => <RoomCard key={room.id} room={room} />)}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, pulse, accent }) {
    return (
        <div
            className="card"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}
        >
            {/* accent top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: accent, opacity: 0.7, borderRadius: '14px 14px 0 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Icon size={18} style={{ color: iconColor }} />
                </div>
                <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: pulse ? 'var(--red)' : 'var(--text-1)', lineHeight: 1, fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '-0.02em' }}>
                        {value}
                    </p>
                </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{sub}</p>
        </div>
    );
}

function MiniStat({ icon: Icon, value, label, color }) {
    return (
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Icon size={16} style={{ color }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '-0.01em' }}>{value}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        </div>
    );
}
