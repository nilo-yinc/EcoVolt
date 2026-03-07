import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rooms, timeline } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';
import { BackgroundBeams } from '../components/ui/background-beams';

export default function RoomDetail() {
    const { roomId } = useParams();
    const room = rooms.find((item) => item.id === roomId);
    const roomTimeline = timeline[roomId] || [];

    if (!room) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-[var(--ww-text-muted)] text-6xl font-mono mb-4">404</div>
                    <p className="text-[var(--ww-text-3)] text-sm font-mono mb-6">FEED NOT FOUND</p>
                    <Link to="/campus" className="text-cyan-400 text-xs font-mono hover:underline">← RETURN TO CAMPUS</Link>
                </div>
            </div>
        );
    }

    const getStatus = (status) => {
        switch (status) {
            case 'efficient':
                return { dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]', label: 'CLEAR', text: 'text-emerald-400' };
            case 'waste':
                return { dot: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)] animate-pulse', label: 'ALERT', text: 'text-red-400' };
            case 'review':
                return { dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]', label: 'REVIEW', text: 'text-amber-400' };
            default:
                return { dot: 'bg-slate-400', label: 'UNKNOWN', text: 'text-[var(--ww-text-2)]' };
        }
    };

    const status = getStatus(room.status);
    const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    return (
        <Spotlight className="min-h-full">
            <BackgroundBeams />
            <div className="relative z-10 max-w-[1200px] mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/campus" className="text-[var(--ww-text-muted)] text-xs font-mono hover:text-cyan-400 transition-colors">CAMPUS</Link>
                    <span className="text-[var(--ww-text-muted)] text-xs">/</span>
                    <span className="text-cyan-400 text-xs font-mono">{room.name.toUpperCase()}</span>
                </div>

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                            <span className={`text-xs font-mono font-bold ${status.text} tracking-[0.15em]`}>{status.label}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--ww-text-1)] tracking-tight mb-1">{room.name}</h1>
                        <p className="text-[var(--ww-text-3)] text-xs font-mono">{room.type} · {room.building} · {room.monitoring}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'OCCUPANCY', value: `${room.occupancy}/${room.capacity}`, accent: 'text-cyan-400' },
                        { label: 'POWER DRAW', value: `${room.energyUsage} kWh`, accent: 'text-amber-400' },
                        { label: 'UTILIZATION', value: `${((room.occupancy / room.capacity) * 100).toFixed(0)}%`, accent: 'text-[var(--ww-text-1)]' },
                        { label: 'MONITORING', value: room.monitoring, accent: 'text-emerald-400' },
                    ].map((stat, index) => (
                        <motion.div key={index} className="hud-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                            <div className="hud-label mb-2">{stat.label}</div>
                            <div className={`text-xl font-mono font-bold ${stat.accent}`}>{stat.value}</div>
                            <div className="corner-bracket corner-bracket-tl" />
                            <div className="corner-bracket corner-bracket-br" />
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="col-span-2 hud-card p-5">
                        <div className="hud-label mb-4">APPLIANCE STATUS</div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { code: 'LT', label: 'Lights', on: room.appliances.lights },
                                { code: 'FN', label: 'Fan', on: room.appliances.fan },
                                { code: 'PJ', label: 'Projector', on: room.appliances.projector },
                                { code: 'AC', label: 'Air Conditioning', on: room.appliances.ac },
                            ].map((appliance, index) => (
                                <div key={index} className={`p-3 rounded-lg border ${appliance.on ? 'border-amber-500/15 bg-amber-500/[0.03]' : 'border-[var(--ww-border)] bg-white/[0.01]'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono font-bold text-[var(--ww-text-1)]">{appliance.code}</span>
                                        <div className={`w-2 h-2 rounded-full ${appliance.on ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]' : 'bg-slate-700'}`} />
                                    </div>
                                    <div className="text-[10px] font-mono text-[var(--ww-text-3)]">{appliance.label}</div>
                                    <div className={`text-[9px] font-mono font-bold mt-1 tracking-wider ${appliance.on ? 'text-amber-400' : 'text-[var(--ww-text-muted)]'}`}>
                                        {appliance.on ? 'ACTIVE' : 'INACTIVE'}
                                    </div>
                                </div>
                            ))}
                            {room.appliances.desktops > 0 && (
                                <div className="p-3 rounded-lg border border-cyan-500/15 bg-cyan-500/[0.03] col-span-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-mono font-bold text-[var(--ww-text-1)]">DESKTOP ARRAY</span>
                                            <div className="text-[10px] font-mono text-[var(--ww-text-3)] mt-0.5">{room.appliances.desktops} units active</div>
                                        </div>
                                        <div className="text-right">
                                            {room.desktopDetails && (
                                                <div className="text-[9px] font-mono text-red-400">
                                                    {room.desktopDetails.monitorsOff} monitors off · {room.desktopDetails.cpuActive} CPU active
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hud-card p-5">
                        <div className="hud-label mb-4">ACTIVITY LOG</div>
                        <div className="space-y-2">
                            {roomTimeline.length > 0 ? roomTimeline.map((event, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start gap-2 p-2 rounded-md bg-white/[0.01] border border-white/[0.03]"
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.08 }}
                                >
                                    <span className="text-sm mt-0.5">{event.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[var(--ww-text-2)] truncate">{event.message}</p>
                                        <p className="text-[9px] font-mono text-[var(--ww-text-muted)]">{formatTime(event.time)}</p>
                                    </div>
                                </motion.div>
                            )) : (
                                <p className="text-xs text-[var(--ww-text-muted)] font-mono text-center py-4">NO RECENT ACTIVITY</p>
                            )}
                        </div>
                    </div>
                </div>

                {(room.monitoring === 'CCTV' || room.monitoring?.includes('CCTV')) && (
                    <div className="hud-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs font-mono text-[var(--ww-text-2)]">CCTV feed active · Privacy protocols enforced</span>
                        </div>
                        <Link to="/ghost-view" className="text-[10px] font-mono text-cyan-400 hover:underline tracking-wider">GHOST MODE →</Link>
                    </div>
                )}
            </div>
        </Spotlight>
    );
}
