import { BarChart3, TrendingDown, TrendingUp, Zap, Clock, DoorOpen } from 'lucide-react';
import { useEnergy } from '../hooks/useEnergy';
import { useRooms } from '../hooks/useRooms';
import EnergyChart from '../components/EnergyChart';

export default function Analytics() {
    const { energyWasted, costWasted, totalWasteDuration, hourlyData, dailyData, wasteRoomCount } = useEnergy();
    const { rooms } = useRooms();

    // Per-room waste breakdown
    const roomBreakdown = rooms.map(r => ({
        name: r.name.split(' ').slice(0, 2).join(' '),
        waste: r.waste_detected ? Math.floor(Math.random() * 800 + 100) : Math.floor(Math.random() * 50),
        saved: Math.floor(Math.random() * 500 + 100),
    }));

    const totalSaved = dailyData.reduce((sum, d) => sum + d.saved, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-1)] flex items-center gap-2">
                    <BarChart3 size={24} className="text-[var(--accent)]" /> Analytics
                </h1>
                <p className="text-sm text-[var(--text-3)] mt-1">Energy waste trends and savings analysis</p>
            </div>

            {/* ── Summary cards ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={TrendingDown} color="text-waste" bg="bg-waste/10"
                    label="Total Wasted" value={`${energyWasted} Wh`} sub={`≈ ₹${costWasted} today`}
                />
                <SummaryCard
                    icon={TrendingUp} color="text-secure" bg="bg-secure/10"
                    label="Energy Saved" value={`${totalSaved} Wh`} sub="via alerts & shutoffs"
                />
                <SummaryCard
                    icon={Clock} color="text-caution" bg="bg-caution/10"
                    label="Waste Duration"
                    value={`${Math.floor(totalWasteDuration / 60)}m`}
                    sub="total across rooms"
                />
                <SummaryCard
                    icon={DoorOpen} color="text-[var(--accent)]" bg="bg-[var(--accent-dim)]"
                    label="Affected Rooms" value={wasteRoomCount} sub={`of ${rooms.length} total`}
                />
            </div>

            {/* ── Charts ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <EnergyChart data={hourlyData} variant="area" title="Hourly Energy Trend" />
                <EnergyChart data={dailyData} variant="bar" title="Weekly Overview" />
            </div>

            {/* ── Per-room breakdown ─────────────────────────────── */}
            <div className="card p-5">
                <h3 className="text-sm font-semibold text-[var(--text-1)] mb-4">Per-Room Breakdown</h3>
                <EnergyChart data={roomBreakdown} variant="bar" />
            </div>

            {/* ── Insights ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard
                    title="Peak Waste Hours"
                    desc="Energy wastage peaks between 6:00 PM and 10:00 PM when rooms empty but appliances remain active. Consider scheduling auto-shutdown alerts during these hours."
                    type="warning"
                />
                <InsightCard
                    title="Top Performer"
                    desc="Lecture Hall A consistently shows optimal energy usage with minimal waste events. The pattern here can be applied to other rooms as a best practice template."
                    type="success"
                />
            </div>
        </div>
    );
}

function SummaryCard({ icon: Icon, color, bg, label, value, sub }) {
    return (
        <div className="metric-card">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon size={20} className={color} />
                </div>
                <div>
                    <p className="text-xs text-[var(--text-3)]">{label}</p>
                    <p className="text-xl font-bold text-[var(--text-1)]">{value}</p>
                </div>
            </div>
            <p className="text-[11px] text-[var(--text-3)] mt-1 ml-[52px]">{sub}</p>
        </div>
    );
}

function InsightCard({ title, desc, type }) {
    const border = type === 'warning' ? 'border-caution/30' : 'border-secure/30';
    const icon = type === 'warning' ? '⚠️' : '✅';
    return (
        <div className={`card p-5 border-l-2 ${border}`}>
            <h4 className="text-sm font-semibold text-[var(--text-1)] mb-2">{icon} {title}</h4>
            <p className="text-xs text-[var(--text-3)] leading-relaxed">{desc}</p>
        </div>
    );
}
