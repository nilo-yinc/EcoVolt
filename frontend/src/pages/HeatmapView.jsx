import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rooms } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';

export default function HeatmapView() {
    const [timeFilter, setTimeFilter] = useState('today');

    const getStatusColor = (status) => {
        switch (status) {
            case 'efficient': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', dot: 'bg-emerald-400' };
            case 'waste': return { bg: 'bg-red-500/20', border: 'border-red-500/30', dot: 'bg-red-400' };
            case 'review': return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', dot: 'bg-amber-400' };
            default: return { bg: 'bg-slate-500/20', border: 'border-slate-500/30', dot: 'bg-slate-400' };
        }
    };

    const buildings = {};
    rooms.forEach(room => {
        if (!buildings[room.building]) buildings[room.building] = [];
        buildings[room.building].push(room);
    });

    const stats = {
        efficient: rooms.filter(r => r.status === 'efficient').length,
        waste: rooms.filter(r => r.status === 'waste').length,
        review: rooms.filter(r => r.status === 'review').length,
    };

    return (
        <Spotlight className="min-h-full">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="hud-label">THERMAL MAP</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-1">Campus Heatmap</h1>
                        <p className="text-xs font-mono text-[var(--text-3)]">Energy efficiency visualization by building</p>
                    </div>
                    <div className="flex gap-1">
                        {['today', 'week'].map(f => (
                            <button key={f} onClick={() => setTimeFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${timeFilter === f ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-[var(--text-4)] hover:text-[var(--text-2)]'}`}>
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="hud-card p-3 flex items-center gap-6 mb-6">
                    {[
                        { color: 'bg-emerald-400', label: `Clear (${stats.efficient})` },
                        { color: 'bg-amber-400', label: `Review (${stats.review})` },
                        { color: 'bg-red-400', label: `Alert (${stats.waste})` },
                    ].map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                            <span className="text-[10px] font-mono text-[var(--text-2)]">{l.label}</span>
                        </div>
                    ))}
                </div>

                {/* Buildings */}
                <div className="space-y-6">
                    {Object.entries(buildings).map(([building, buildingRooms]) => (
                        <div key={building}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-[var(--text-1)] tracking-wide">{building}</h2>
                                <span className="text-[10px] font-mono text-[var(--text-4)]">{buildingRooms.length} feeds</span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                {buildingRooms.map((room, i) => {
                                    const colors = getStatusColor(room.status);
                                    return (
                                        <Link key={room.id} to={`/room/${room.id}`}>
                                            <motion.div
                                                className={`aspect-square rounded-lg ${colors.bg} border ${colors.border} p-2 flex flex-col justify-between cursor-pointer hover:scale-110 transition-transform duration-200 relative group`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.04 }}
                                            >
                                                <div>
                                                    <div className="text-[10px] font-mono font-bold text-[var(--text-1)] truncate">{room.name.split(' ').slice(-1)[0]}</div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-mono text-[var(--text-2)]">{room.occupancy}/{room.capacity}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                                </div>

                                                {/* Hover tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                    <div className="bg-[#0a1018] border border-white/10 rounded-lg p-3 min-w-[160px] shadow-xl">
                                                        <div className="text-xs font-semibold text-[var(--text-1)] mb-1">{room.name}</div>
                                                        <div className="text-[9px] font-mono text-[var(--text-2)] space-y-0.5">
                                                            <div>Occupancy: {room.occupancy}/{room.capacity}</div>
                                                            <div>Power: {room.energyUsage} kWh</div>
                                                            <div>Type: {room.type}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                    {[
                        { label: 'CLEAR', val: stats.efficient, accent: 'text-emerald-400' },
                        { label: 'ACTIVE WASTE', val: stats.waste, accent: 'text-red-400' },
                        { label: 'EFFICIENCY', val: `${((stats.efficient / rooms.length) * 100).toFixed(0)}%`, accent: 'text-cyan-400' },
                    ].map((s, i) => (
                        <div key={i} className="hud-card p-4">
                            <div className="hud-label mb-2">{s.label}</div>
                            <div className={`text-xl font-mono font-bold ${s.accent}`}>{s.val}</div>
                            <div className="corner-bracket corner-bracket-tl" />
                            <div className="corner-bracket corner-bracket-br" />
                        </div>
                    ))}
                </div>
            </div>
        </Spotlight>
    );
}
