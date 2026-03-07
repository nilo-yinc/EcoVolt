import { motion } from 'framer-motion';
import { energyData } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';
import { BackgroundBeams } from '../components/ui/background-beams';

export default function EnergyAnalytics() {
    const { savedOverTime, wasteByRoom, kpis } = energyData;
    const maxSaved = Math.max(...savedOverTime.map(d => d.kwh));
    const maxWaste = Math.max(...wasteByRoom.map(d => d.waste));

    return (
        <Spotlight className="min-h-full">
            <BackgroundBeams />
            <div className="relative z-10 max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="hud-label">ENERGY TELEMETRY</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-1">Energy Analytics</h1>
                    <p className="text-xs font-mono text-[var(--text-3)]">Performance metrics and consumption trends</p>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'TOTAL SAVED', value: kpis.totalSaved.toLocaleString(), unit: 'kWh', accent: 'text-emerald-400' },
                        { label: 'CO₂ REDUCED', value: kpis.co2Reduced.toLocaleString(), unit: 'kg', accent: 'text-cyan-400' },
                        { label: 'COST SAVED', value: `₹${kpis.costSaved.toLocaleString()}`, unit: 'this month', accent: 'text-amber-400' },
                    ].map((kpi, i) => (
                        <motion.div key={i} className="hud-card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <div className="hud-label mb-2">{kpi.label}</div>
                            <div className={`text-3xl font-mono font-bold ${kpi.accent}`}>{kpi.value}</div>
                            <div className="text-[10px] font-mono text-[var(--text-4)] mt-1">{kpi.unit}</div>
                            <div className="corner-bracket corner-bracket-tl" />
                            <div className="corner-bracket corner-bracket-br" />
                        </motion.div>
                    ))}
                </div>

                {/* Bar Chart — Energy Saved Over Time */}
                <div className="hud-card p-5 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="hud-label">DAILY SAVINGS</div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-sm bg-emerald-400/60" />
                            <span className="text-[9px] font-mono text-[var(--text-4)]">kWh saved</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-1.5 h-48">
                        {savedOverTime.map((data, i) => {
                            const height = (data.kwh / maxSaved) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="flex-1 w-full flex items-end">
                                        <motion.div
                                            className="w-full bg-emerald-500/20 border border-emerald-500/20 rounded-sm hover:bg-emerald-500/30 transition-colors relative cursor-pointer"
                                            style={{ height: `${height}%` }}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.05 }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-mono text-emerald-400 bg-[#0a1018] px-1.5 py-0.5 rounded border border-emerald-500/20">{data.kwh}</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-[8px] font-mono text-[var(--text-4)] -rotate-45 origin-top-left whitespace-nowrap">
                                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Horizontal Bars — Waste by Room */}
                <div className="hud-card p-5 mb-6">
                    <div className="hud-label mb-5">WASTE BY ROOM</div>
                    <div className="space-y-3">
                        {wasteByRoom.map((data, i) => {
                            const width = (data.waste / maxWaste) * 100;
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-mono text-[var(--text-2)]">{data.room}</span>
                                        <span className="text-xs font-mono font-bold text-[var(--text-1)]">{data.waste} <span className="text-[var(--text-4)]">kWh</span></span>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-red-500/40 to-orange-500/40 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${width}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 + i * 0.04 }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Insights */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'PEAK DAY', desc: 'Thursday — 178 kWh saved during peak hours', accent: 'text-emerald-400' },
                        { label: 'TOP TARGET', desc: 'Computer Lab B-204 — 42% of total waste. Auto-shutdown saves 60 kWh/day', accent: 'text-red-400' },
                        { label: 'WEEKEND GAP', desc: 'Savings drop 45% on weekends. Reduced monitoring coverage', accent: 'text-amber-400' },
                    ].map((insight, i) => (
                        <div key={i} className="hud-card p-4">
                            <div className="hud-label mb-2">{insight.label}</div>
                            <div className={`text-xs font-mono ${insight.accent} mb-1 font-bold`}>⬤ Insight</div>
                            <p className="text-[10px] font-mono text-[var(--text-3)] leading-relaxed">{insight.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Spotlight>
    );
}
