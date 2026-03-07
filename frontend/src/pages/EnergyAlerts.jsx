import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { alerts } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';

export default function EnergyAlerts() {
    const [filterBuilding, setFilterBuilding] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');

    const buildings = ['all', ...new Set(alerts.map(a => a.building))];

    const filteredAlerts = alerts.filter(a => {
        if (filterBuilding !== 'all' && a.building !== filterBuilding) return false;
        if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
        return true;
    });

    const getSeverity = (s) => {
        switch (s) {
            case 'high': return { dot: 'bg-red-400 animate-pulse', text: 'text-red-400', border: 'border-red-500/15', label: 'HIGH' };
            case 'medium': return { dot: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-500/15', label: 'MED' };
            case 'low': return { dot: 'bg-blue-400', text: 'text-blue-400', border: 'border-blue-500/15', label: 'LOW' };
            default: return { dot: 'bg-slate-400', text: 'text-[var(--text-2)]', border: 'border-[var(--border)]', label: '—' };
        }
    };

    const formatTime = (ts) => {
        const diff = Math.floor((Date.now() - ts) / 60000);
        if (diff < 60) return `${diff}m ago`;
        return `${Math.floor(diff / 60)}h ago`;
    };

    const totalWaste = filteredAlerts.reduce((s, a) => s + a.estimatedWaste, 0);

    return (
        <Spotlight className="min-h-full">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                            <span className="hud-label">ACTIVE ALERTS</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-1">Energy Alerts</h1>
                        <p className="text-xs font-mono text-[var(--text-3)]">Waste detection feed · {filteredAlerts.length} active</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="hud-card px-4 py-3 text-center">
                            <div className="text-xl font-mono font-bold text-red-400">{filteredAlerts.length}</div>
                            <div className="text-[8px] font-mono text-[var(--text-4)]">ALERTS</div>
                        </div>
                        <div className="hud-card px-4 py-3 text-center">
                            <div className="text-xl font-mono font-bold text-amber-400">{totalWaste.toFixed(1)}</div>
                            <div className="text-[8px] font-mono text-[var(--text-4)]">kWh WASTE</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="hud-card p-3 flex items-center gap-4 mb-6">
                    <span className="hud-label">FILTER</span>
                    <select value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value)}
                        className="px-3 py-1.5 bg-transparent border border-[var(--border)] rounded-md text-xs font-mono text-[var(--text-2)] focus:border-cyan-500/30 focus:outline-none">
                        {buildings.map(b => <option key={b} value={b} className="bg-slate-900">{b === 'all' ? 'All Buildings' : b}</option>)}
                    </select>
                    <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
                        className="px-3 py-1.5 bg-transparent border border-[var(--border)] rounded-md text-xs font-mono text-[var(--text-2)] focus:border-cyan-500/30 focus:outline-none">
                        <option value="all" className="bg-slate-900">All Severity</option>
                        <option value="high" className="bg-slate-900">High</option>
                        <option value="medium" className="bg-slate-900">Medium</option>
                        <option value="low" className="bg-slate-900">Low</option>
                    </select>
                </div>

                {/* Alert List */}
                <div className="space-y-3">
                    {filteredAlerts.length === 0 ? (
                        <div className="hud-card p-12 text-center">
                            <div className="text-2xl text-[var(--text-4)] mb-2">◉</div>
                            <span className="text-xs font-mono text-[var(--text-4)]">NO ALERTS MATCHING CRITERIA</span>
                        </div>
                    ) : filteredAlerts.map((alert, i) => {
                        const sev = getSeverity(alert.severity);
                        return (
                            <motion.div key={alert.id} className={`hud-card border-l-2 ${sev.border}`}
                                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-2 h-2 rounded-full ${sev.dot}`} />
                                            <span className="text-sm font-semibold text-[var(--text-1)]">{alert.roomName}</span>
                                            <span className={`text-[9px] font-mono font-bold ${sev.text} tracking-wider`}>{sev.label}</span>
                                        </div>
                                        <span className="text-[9px] font-mono text-[var(--text-4)]">{formatTime(alert.timestamp)}</span>
                                    </div>

                                    <p className="text-xs font-mono text-[var(--text-2)] mb-3 leading-relaxed">{alert.issue}</p>

                                    <div className="flex items-center gap-4 mb-3">
                                        {[
                                            { l: 'Duration', v: alert.duration },
                                            { l: 'Waste', v: `${alert.estimatedWaste} kWh` },
                                            { l: 'Type', v: alert.roomType },
                                            { l: 'Building', v: alert.building },
                                        ].map((m, j) => (
                                            <div key={j} className="flex items-center gap-1.5">
                                                <span className="text-[8px] font-mono text-[var(--text-4)]">{m.l}:</span>
                                                <span className="text-[10px] font-mono text-[var(--text-2)]">{m.v}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link to={`/room/${alert.roomId}`} className="text-[10px] font-mono text-cyan-400 px-2.5 py-1 border border-cyan-500/20 rounded-md hover:bg-cyan-500/[0.04] transition-colors">
                                            VIEW FEED
                                        </Link>
                                        <Link to="/manual-control" className="text-[10px] font-mono text-red-400 px-2.5 py-1 border border-red-500/20 rounded-md hover:bg-red-500/[0.04] transition-colors">
                                            TAKE ACTION
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </Spotlight>
    );
}
