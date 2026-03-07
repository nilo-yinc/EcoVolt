import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { computerLabs } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';
import { BackgroundBeams } from '../components/ui/background-beams';

export default function ComputerLabIntelligence() {
    const totalDesktops = computerLabs.reduce((s, l) => s + l.totalDesktops, 0);
    const totalOn = computerLabs.reduce((s, l) => s + l.desktopsOn, 0);
    const totalWaste = computerLabs.reduce((s, l) => s + l.energyWaste, 0);
    const hiddenCount = computerLabs.filter(l => l.hiddenWaste).length;

    return (
        <Spotlight className="min-h-full">
            <BackgroundBeams />
            <div className="relative z-10 max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="hud-label">LAB INTELLIGENCE</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-1">Computer Lab Monitoring</h1>
                    <p className="text-xs font-mono text-[var(--text-3)]">Desktop array analysis · Hidden waste detection</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'TOTAL DESKTOPS', val: totalDesktops, accent: 'text-cyan-400' },
                        { label: 'CURRENTLY ON', val: totalOn, sub: `${((totalOn / totalDesktops) * 100).toFixed(0)}% utilization`, accent: 'text-[var(--text-1)]' },
                        { label: 'HIDDEN WASTE', val: hiddenCount, sub: 'Labs with ghost CPUs', accent: 'text-red-400' },
                        { label: 'ENERGY WASTE', val: `${totalWaste.toFixed(1)}`, sub: 'kWh total', accent: 'text-amber-400' },
                    ].map((s, i) => (
                        <motion.div key={i} className="hud-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="hud-label mb-2">{s.label}</div>
                            <div className={`text-2xl font-mono font-bold ${s.accent}`}>{s.val}</div>
                            {s.sub && <div className="text-[9px] font-mono text-[var(--text-4)] mt-1">{s.sub}</div>}
                            <div className="corner-bracket corner-bracket-tl" />
                            <div className="corner-bracket corner-bracket-br" />
                        </motion.div>
                    ))}
                </div>

                {/* Lab Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    {computerLabs.map((lab, i) => (
                        <motion.div key={lab.id} className={`hud-card ${lab.hiddenWaste ? 'border-red-500/15' : ''}`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.03]">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2 h-2 rounded-full ${lab.hiddenWaste ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                                    <span className="text-sm font-semibold text-[var(--text-1)]">{lab.name}</span>
                                </div>
                                {lab.hiddenWaste && (
                                    <span className="text-[9px] font-mono font-bold text-red-400 tracking-wider">⚠ HIDDEN WASTE</span>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="text-[10px] font-mono text-[var(--text-4)] mb-4">{lab.building}</div>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[
                                        { l: 'OCCUPANTS', v: lab.occupancy, a: lab.occupancy === 0 ? 'text-red-400' : 'text-cyan-400' },
                                        { l: 'PCS ON', v: `${lab.desktopsOn}/${lab.totalDesktops}`, a: 'text-[var(--text-1)]' },
                                        { l: 'WASTE', v: `${lab.energyWaste} kWh`, a: 'text-amber-400' },
                                    ].map((m, j) => (
                                        <div key={j} className="bg-white/[0.02] rounded-md p-2.5">
                                            <div className="text-[8px] font-mono text-[var(--text-4)] mb-0.5">{m.l}</div>
                                            <div className={`text-sm font-mono font-bold ${m.a}`}>{m.v}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Analysis */}
                                <div className="bg-white/[0.01] border border-[var(--border)] rounded-md p-4 mb-4">
                                    <div className="text-[9px] font-mono text-cyan-400 tracking-wider mb-3">DESKTOP ARRAY ANALYSIS</div>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        {[
                                            { v: lab.desktopsOn, l: 'POWERED', a: 'text-[var(--text-1)]' },
                                            { v: lab.monitorsOff, l: 'MON OFF', a: 'text-orange-400' },
                                            { v: lab.cpuActive, l: 'CPU ON', a: 'text-emerald-400' },
                                        ].map((d, j) => (
                                            <div key={j}>
                                                <div className={`text-xl font-mono font-bold ${d.a}`}>{d.v}</div>
                                                <div className="text-[8px] font-mono text-[var(--text-4)] mt-0.5">{d.l}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {lab.monitorsOff > 5 && (
                                        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-red-400" />
                                            <span className="text-[9px] font-mono text-red-400/80">{lab.monitorsOff} desktops running with monitors off — phantom load detected</span>
                                        </div>
                                    )}
                                </div>

                                {/* Efficiency bar */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[9px] font-mono text-[var(--text-4)] w-16">EFFICIENCY</span>
                                    <div className="flex-1 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500/40 rounded-full" style={{ width: `${(lab.occupancy / lab.desktopsOn) * 100 || 0}%` }} />
                                    </div>
                                    <span className="text-[9px] font-mono text-cyan-400 w-8 text-right">{((lab.occupancy / lab.desktopsOn) * 100 || 0).toFixed(0)}%</span>
                                </div>

                                <Link to={`/room/${lab.id}`} className="block text-center text-[10px] font-mono text-cyan-400 py-2 border border-cyan-500/20 rounded-md hover:bg-cyan-500/[0.04] transition-colors">
                                    OPEN FEED →
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tips */}
                <div className="hud-card p-5">
                    <div className="hud-label mb-4">OPTIMIZATION PROTOCOLS</div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'PHANTOM LOAD', desc: 'CPUs with monitors off still draw 60% power. Enable auto-sleep after 15min idle.' },
                            { label: 'GROUP MGMT', desc: 'Wake-on-LAN + scheduled shutdown. Potential daily savings: 45 kWh.' },
                            { label: 'LOW OCCUPANCY', desc: 'Below 20% utilization — reduce AC and dim lights automatically.' },
                        ].map((tip, i) => (
                            <div key={i} className="bg-white/[0.01] rounded-md p-3 border border-white/[0.03]">
                                <div className="text-[9px] font-mono text-cyan-400 tracking-wider mb-2">{tip.label}</div>
                                <p className="text-[10px] font-mono text-[var(--text-3)] leading-relaxed">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Spotlight>
    );
}
