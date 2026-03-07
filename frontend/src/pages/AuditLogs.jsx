import { useState } from 'react';
import { motion } from 'framer-motion';
import { auditLogs } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    const actions = ['all', ...new Set(auditLogs.map(l => l.action))];

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.room.toLowerCase().includes(searchTerm.toLowerCase()) || log.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'all' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    const formatTs = (ts) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return (
        <Spotlight className="min-h-full">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            <span className="hud-label">AUDIT TRAIL</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-1">System Logs</h1>
                        <p className="text-xs font-mono text-[var(--text-3)]">Immutable activity record · Tamper-evident</p>
                    </div>
                    <button className="text-[10px] font-mono text-cyan-400 px-3 py-1.5 border border-cyan-500/20 rounded-md hover:bg-cyan-500/[0.04] transition-colors">
                        EXPORT ↓
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'TOTAL ENTRIES', val: filteredLogs.length, accent: 'text-cyan-400' },
                        { label: 'SYSTEM ACTIONS', val: auditLogs.filter(l => l.user === 'System').length, accent: 'text-indigo-400' },
                        { label: 'MANUAL ACTIONS', val: auditLogs.filter(l => l.user !== 'System').length, accent: 'text-amber-400' },
                    ].map((s, i) => (
                        <div key={i} className="hud-card p-4">
                            <div className="hud-label mb-2">{s.label}</div>
                            <div className={`text-2xl font-mono font-bold ${s.accent}`}>{s.val}</div>
                            <div className="corner-bracket corner-bracket-tl" />
                            <div className="corner-bracket corner-bracket-br" />
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="hud-card p-3 flex items-center gap-4 mb-6">
                    <span className="hud-label">SEARCH</span>
                    <div className="relative flex-1">
                        <input type="text" placeholder="Room, reason..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-1.5 bg-transparent border border-[var(--border)] rounded-md text-xs font-mono text-[var(--text-2)] focus:border-cyan-500/30 focus:outline-none placeholder-slate-700" />
                    </div>
                    <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
                        className="px-3 py-1.5 bg-transparent border border-[var(--border)] rounded-md text-xs font-mono text-[var(--text-2)] focus:border-cyan-500/30 focus:outline-none">
                        {actions.map(a => <option key={a} value={a} className="bg-slate-900">{a === 'all' ? 'All Actions' : a}</option>)}
                    </select>
                </div>

                {/* Log Table */}
                <div className="hud-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    {['TIMESTAMP', 'ROOM', 'ACTION', 'REASON', 'CONF', 'ACTOR'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-[9px] font-mono font-bold text-[var(--text-4)] tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr><td colSpan="6" className="px-4 py-12 text-center"><span className="text-xs font-mono text-[var(--text-4)]">NO RECORDS</span></td></tr>
                                ) : filteredLogs.map((log, i) => (
                                    <motion.tr key={log.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                        <td className="px-4 py-3 text-[10px] font-mono text-[var(--text-3)]">{formatTs(log.timestamp)}</td>
                                        <td className="px-4 py-3 text-xs font-mono text-[var(--text-2)]">{log.room}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${log.action.includes('OFF') ? 'text-red-400 border-red-500/15 bg-red-500/[0.04]' : 'text-emerald-400 border-emerald-500/15 bg-emerald-500/[0.04]'
                                                }`}>{log.action}</span>
                                        </td>
                                        <td className="px-4 py-3 text-[10px] font-mono text-[var(--text-3)] max-w-[200px] truncate">{log.reason}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${log.confidence >= 95 ? 'bg-emerald-400/60' : log.confidence >= 80 ? 'bg-amber-400/60' : 'bg-red-400/60'}`}
                                                        style={{ width: `${log.confidence}%` }} />
                                                </div>
                                                <span className="text-[9px] font-mono text-[var(--text-3)]">{log.confidence}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[9px] font-mono ${log.user === 'System' ? 'text-indigo-400' : 'text-[var(--text-2)]'}`}>
                                                {log.user === 'System' ? '⊙ SYS' : `◉ ${log.user}`}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                        { label: 'RETENTION', desc: '90-day rolling window. Archives accessible via admin.' },
                        { label: 'INTEGRITY', desc: 'SHA-256 signed. Tamper attempts flagged immediately.' },
                        { label: 'EXPORT', desc: 'CSV, JSON, PDF formats. Filterable by date/room/action.' },
                    ].map((info, i) => (
                        <div key={i} className="hud-card p-3">
                            <div className="text-[9px] font-mono text-cyan-400 tracking-wider mb-1">{info.label}</div>
                            <p className="text-[10px] font-mono text-[var(--text-4)] leading-relaxed">{info.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Spotlight>
    );
}
