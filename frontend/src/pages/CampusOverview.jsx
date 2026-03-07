import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { rooms } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';
import { BackgroundBeams } from '../components/ui/background-beams';
import { MovingBorder } from '../components/ui/moving-border';
import { TextGenerateEffect } from '../components/ui/text-generate';

export default function CampusOverview() {
    const [viewMode, setViewMode] = useState('grid');
    const [filterType, setFilterType] = useState('all');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const stats = {
        totalRooms: rooms.length,
        activeWaste: rooms.filter(r => r.status === 'waste').length,
        efficient: rooms.filter(r => r.status === 'efficient').length,
        energySaved: 187,
    };

    const filteredRooms = filterType === 'all'
        ? rooms
        : rooms.filter(r => r.type === filterType);

    const getStatusColor = (status) => {
        switch (status) {
            case 'efficient': return { dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'CLEAR' };
            case 'waste': return { dot: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)] animate-pulse', text: 'text-red-400', border: 'border-red-500/20', label: 'ALERT' };
            case 'review': return { dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]', text: 'text-amber-400', border: 'border-amber-500/20', label: 'REVIEW' };
            default: return { dot: 'bg-slate-400', text: 'text-[var(--text-2)]', border: 'border-slate-500/20', label: 'UNKNOWN' };
        }
    };

    return (
        <Spotlight className="min-h-full">
            <BackgroundBeams />

            <div className="relative z-10 max-w-[1400px] mx-auto">
                {/* Header — surveillance style */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="hud-label">LIVE MONITORING</span>
                        </div>
                        <TextGenerateEffect
                            words="Campus Energy Surveillance"
                            className="text-3xl font-bold text-[var(--text-1)] tracking-tight"
                            duration={0.3}
                        />
                        <p className="text-[var(--text-3)] text-sm mt-2 font-mono">
                            {stats.totalRooms} feeds active · {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="hud-label mb-1">SYSTEM STATUS</div>
                        <div className="flex items-center gap-2 justify-end">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 text-xs font-mono">ALL SYSTEMS NOMINAL</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row — clean HUD cards */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'TOTAL FEEDS', value: stats.totalRooms, sub: 'monitored', accent: 'text-cyan-400' },
                        { label: 'EFFICIENT', value: stats.efficient, sub: 'rooms clear', accent: 'text-emerald-400' },
                        { label: 'WASTE DETECTED', value: stats.activeWaste, sub: 'requires action', accent: 'text-red-400' },
                        { label: 'ENERGY SAVED', value: `${stats.energySaved}`, sub: 'kWh today', accent: 'text-amber-400' },
                    ].map((s, i) => (
                        <div key={i} className="hud-card p-4">
                            <div className="hud-label mb-2">{s.label}</div>
                            <div className={`text-2xl font-mono font-bold ${s.accent}`}>{s.value}</div>
                            <div className="text-[10px] font-mono text-[var(--text-4)] mt-1">{s.sub}</div>
                            {/* Corner brackets */}
                            <div className="corner-bracket corner-bracket-tl" />
                            <div className="corner-bracket corner-bracket-br" />
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-5 py-3 px-4 hud-card">
                    <div className="flex items-center gap-3">
                        <span className="hud-label">FILTER</span>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-1.5 bg-transparent border border-[var(--border)] rounded-md text-[var(--text-2)] text-xs font-mono focus:border-cyan-500/30 focus:outline-none cursor-pointer">
                            <option value="all" className="bg-slate-900">All Types</option>
                            <option value="Classroom" className="bg-slate-900">Classrooms</option>
                            <option value="Computer Lab" className="bg-slate-900">Computer Labs</option>
                            <option value="Lab" className="bg-slate-900">Labs</option>
                            <option value="Office" className="bg-slate-900">Offices</option>
                            <option value="Hostel" className="bg-slate-900">Hostels</option>
                        </select>
                        <span className="text-[10px] font-mono text-[var(--text-4)]">{filteredRooms.length} results</span>
                    </div>
                    <div className="flex gap-1">
                        {['grid', 'list'].map(m => (
                            <button key={m} onClick={() => setViewMode(m)}
                                className={`px-3 py-1.5 rounded-md font-mono text-xs transition-all ${viewMode === m ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-[var(--text-4)] hover:text-[var(--text-2)]'}`}>
                                {m === 'grid' ? '▦ GRID' : '☰ LIST'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Room Grid */}
                <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    <AnimatePresence>
                        {filteredRooms.map((room, i) => {
                            const status = getStatusColor(room.status);
                            return (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.03 }}
                                >
                                    <Link to={`/room/${room.id}`} className="block group">
                                        <div className={`hud-card p-0 hover:border-cyan-500/15 transition-all duration-300`}>
                                            {/* Header strip */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.03]">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                                                    <span className="text-[var(--text-1)] text-sm font-medium tracking-wide">{room.name}</span>
                                                </div>
                                                <span className={`text-[9px] font-mono font-bold ${status.text} tracking-[0.15em]`}>{status.label}</span>
                                            </div>

                                            {/* Body */}
                                            <div className="px-4 py-3">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <span className="text-[10px] font-mono text-[var(--text-4)]">{room.type}</span>
                                                    <span className="text-[10px] font-mono text-[var(--text-4)]">·</span>
                                                    <span className="text-[10px] font-mono text-[var(--text-4)]">{room.building}</span>
                                                    <span className="text-[10px] font-mono text-[var(--text-4)]">·</span>
                                                    <span className="text-[10px] font-mono text-[var(--text-4)]">{room.monitoring}</span>
                                                </div>

                                                {/* Metrics Row */}
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    <div className="bg-white/[0.02] rounded-md px-2.5 py-2">
                                                        <div className="text-[9px] font-mono text-[var(--text-4)] mb-0.5">OCCUPANCY</div>
                                                        <div className="text-sm font-mono font-bold text-[var(--text-1)]">{room.occupancy}<span className="text-[var(--text-4)]">/{room.capacity}</span></div>
                                                    </div>
                                                    <div className="bg-white/[0.02] rounded-md px-2.5 py-2">
                                                        <div className="text-[9px] font-mono text-[var(--text-4)] mb-0.5">POWER</div>
                                                        <div className="text-sm font-mono font-bold text-[var(--text-1)]">{room.energyUsage}<span className="text-[var(--text-4)]"> kWh</span></div>
                                                    </div>
                                                    <div className="bg-white/[0.02] rounded-md px-2.5 py-2">
                                                        <div className="text-[9px] font-mono text-[var(--text-4)] mb-0.5">UTIL</div>
                                                        <div className="text-sm font-mono font-bold text-[var(--text-1)]">{((room.occupancy / room.capacity) * 100).toFixed(0)}<span className="text-[var(--text-4)]">%</span></div>
                                                    </div>
                                                </div>

                                                {/* Appliance indicators */}
                                                <div className="flex gap-2">
                                                    {[
                                                        { l: 'LT', on: room.appliances.lights },
                                                        { l: 'FN', on: room.appliances.fan },
                                                        { l: 'PJ', on: room.appliances.projector },
                                                        { l: 'AC', on: room.appliances.ac },
                                                        ...(room.appliances.desktops > 0 ? [{ l: `${room.appliances.desktops}PC`, on: true }] : []),
                                                    ].map((a, j) => (
                                                        <div key={j}
                                                            className={`px-2 py-1 rounded text-[9px] font-mono font-bold tracking-wider ${a.on ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/[0.02] text-[var(--text-4)] border border-white/[0.03]'
                                                                }`}>
                                                            {a.l}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer scan line */}
                                            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent group-hover:via-cyan-500/20 transition-all duration-500" />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </Spotlight>
    );
}
