import { motion } from 'framer-motion';
import { rooms } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';
import { BackgroundBeams } from '../components/ui/background-beams';

export default function PrivacyCompliance() {
    const cctvRooms = rooms.filter((room) => room.monitoring === 'CCTV' || room.monitoring?.includes('CCTV'));
    const nonCctvRooms = rooms.filter((room) => room.monitoring !== 'CCTV' && !room.monitoring?.includes('CCTV'));

    return (
        <Spotlight className="min-h-full">
            <BackgroundBeams />
            <div className="relative z-10 max-w-[1200px] mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="hud-label">COMPLIANCE</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--ww-text-1)] tracking-tight mb-1">Privacy & Data Governance</h1>
                    <p className="text-xs font-mono text-[var(--ww-text-3)]">Transparent data practices · Privacy-by-design architecture</p>
                </div>

                <div className="hud-card p-6 mb-8 border-emerald-500/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="text-xs text-emerald-400">✓</span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--ww-text-1)]">Privacy-First Approach</span>
                    </div>
                    <p className="text-xs font-mono text-[var(--ww-text-2)] leading-relaxed">
                        EcoVolt collects only minimum data necessary for energy monitoring. No identifiable information is stored. All video processing happens locally and is immediately discarded.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="hud-card p-5">
                        <div className="hud-label mb-3">CCTV MONITORING</div>
                        <div className="text-3xl font-mono font-bold text-[var(--ww-text-1)] mb-3">{cctvRooms.length}</div>
                        <div className="space-y-1.5">
                            {cctvRooms.map((room) => (
                                <div key={room.id} className="flex items-center gap-2 py-1.5 px-2 bg-white/[0.01] rounded-md">
                                    <div className="w-1 h-1 rounded-full bg-purple-400" />
                                    <span className="text-[10px] font-mono text-[var(--ww-text-2)]">{room.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hud-card p-5">
                        <div className="hud-label mb-3">NON-CCTV METHODS</div>
                        <div className="text-3xl font-mono font-bold text-[var(--ww-text-1)] mb-3">{nonCctvRooms.length}</div>
                        <div className="space-y-1.5">
                            {['Smart Plug Monitoring', 'Sensor-Based Detection', 'Current Detector', 'Schedule-Based Analysis'].map((item, index) => (
                                <div key={index} className="flex items-center gap-2 py-1.5 px-2 bg-white/[0.01] rounded-md">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                    <span className="text-[10px] font-mono text-[var(--ww-text-2)]">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="hud-card p-5 border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-emerald-400 text-xs font-mono font-bold">✓</span>
                            <span className="hud-label">WHAT WE COLLECT</span>
                        </div>
                        {['Anonymous occupancy count', 'Room temperature & light levels', 'Appliance power consumption', 'Entry/exit timestamps (no ID)', 'Aggregate energy metrics'].map((item, index) => (
                            <motion.div key={index} className="flex items-center gap-2 py-1.5" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
                                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-mono text-[var(--ww-text-2)]">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                    <div className="hud-card p-5 border-red-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-red-400 text-xs font-mono font-bold">✕</span>
                            <span className="hud-label">WHAT WE DON'T COLLECT</span>
                        </div>
                        {['Facial recognition or biometrics', 'Individual identity data', 'Video recordings or images', 'Personal device tracking', 'Audio recordings'].map((item, index) => (
                            <motion.div key={index} className="flex items-center gap-2 py-1.5" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
                                <div className="w-1 h-1 rounded-full bg-red-400" />
                                <span className="text-[10px] font-mono text-[var(--ww-text-2)]">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="hud-card p-5 mb-8">
                    <div className="hud-label mb-5">CORE PRIVACY PROTOCOLS</div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { n: '01', title: 'No Raw Video', desc: 'Processed in real-time, immediately discarded.' },
                            { n: '02', title: 'Local Processing', desc: 'All analysis on-device. No external transmission.' },
                            { n: '03', title: 'Minimal Retention', desc: '30-day max. Aggregated analytics anonymized.' },
                            { n: '04', title: 'Full Transparency', desc: 'All system activities logged and auditable.' },
                            { n: '05', title: 'Anonymous Design', desc: 'Individual identification technically impossible.' },
                            { n: '06', title: 'User Control', desc: 'Ghost View and Data-Only modes available.' },
                        ].map((protocol, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/[0.01] border border-white/[0.03] rounded-md p-3"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-mono text-cyan-400">{protocol.n}</span>
                                    <span className="text-xs font-semibold text-[var(--ww-text-1)]">{protocol.title}</span>
                                </div>
                                <p className="text-[10px] font-mono text-[var(--ww-text-muted)] leading-relaxed">{protocol.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-8">
                    {[
                        { title: 'GDPR', subtitle: 'EU Data Protection' },
                        { title: 'CCPA', subtitle: 'California Privacy' },
                        { title: 'ISO 27001', subtitle: 'Info Security' },
                        { title: 'SOC 2', subtitle: 'Security & Avail.' },
                    ].map((item, index) => (
                        <div key={index} className="hud-card p-4 text-center">
                            <div className="text-sm font-mono font-bold text-emerald-400 mb-1">{item.title}</div>
                            <div className="text-[9px] font-mono text-[var(--ww-text-muted)]">{item.subtitle}</div>
                            <div className="corner-bracket corner-bracket-tl" />
                            <div className="corner-bracket corner-bracket-br" />
                        </div>
                    ))}
                </div>

                <div className="hud-card p-5 text-center">
                    <div className="text-sm font-semibold text-[var(--ww-text-1)] mb-2">Privacy Team Available</div>
                    <p className="text-[10px] font-mono text-[var(--ww-text-3)] mb-3">Questions about data handling or compliance?</p>
                    <button className="text-[10px] font-mono text-cyan-400 px-4 py-2 border border-cyan-500/20 rounded-md hover:bg-cyan-500/[0.04] transition-colors">
                        CONTACT PRIVACY TEAM
                    </button>
                </div>
            </div>
        </Spotlight>
    );
}
