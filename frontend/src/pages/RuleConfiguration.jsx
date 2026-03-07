import { useState } from 'react';
import { rules as initialRules } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';

export default function RuleConfiguration() {
    const [rules, setRules] = useState(initialRules);
    const [saved, setSaved] = useState(false);

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };
    const updateRule = (key, value) => setRules(prev => ({ ...prev, [key]: value }));
    const updateAppliance = (appliance, value) => setRules(prev => ({ ...prev, appliances: { ...prev.appliances, [appliance]: parseFloat(value) } }));

    return (
        <Spotlight className="min-h-full">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            <span className="hud-label">CONFIGURATION</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-1">Rule Engine</h1>
                        <p className="text-xs font-mono text-[var(--text-3)]">System behavior and threshold parameters</p>
                    </div>
                    {saved && (
                        <div className="flex items-center gap-2 px-3 py-2 hud-card border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-mono text-emerald-400 tracking-wider">SAVED</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Detection Threshold */}
                    <div className="hud-card p-5">
                        <div className="hud-label mb-4">EMPTY ROOM DETECTION</div>
                        <label className="block">
                            <span className="text-[10px] font-mono text-[var(--text-2)] block mb-2">Threshold (minutes)</span>
                            <input type="number" value={rules.emptyRoomThreshold} onChange={(e) => updateRule('emptyRoomThreshold', parseInt(e.target.value))} min="5" max="120"
                                className="w-full px-3 py-2.5 bg-transparent border border-[var(--border)] rounded-md text-lg font-mono font-bold text-[var(--text-1)] focus:border-cyan-500/30 focus:outline-none text-center" />
                        </label>
                        <div className="text-[9px] font-mono text-[var(--text-4)] mt-2">Time before room flagged as empty</div>
                    </div>

                    {/* Automation */}
                    <div className="hud-card p-5">
                        <div className="hud-label mb-4">AUTOMATION</div>
                        <div className="space-y-3">
                            {[
                                { label: 'Auto Power-Off', desc: 'Disable appliances in empty rooms', checked: rules.autoPowerOff, key: 'autoPowerOff' },
                                { label: 'Alert-Only Mode', desc: 'Notify instead of auto-action', checked: rules.alertOnly, key: 'alertOnly' },
                            ].map((toggle, i) => (
                                <label key={i} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/[0.03] rounded-md cursor-pointer hover:bg-white/[0.02] transition-colors">
                                    <div>
                                        <div className="text-xs font-mono text-[var(--text-1)] mb-0.5">{toggle.label}</div>
                                        <div className="text-[9px] font-mono text-[var(--text-4)]">{toggle.desc}</div>
                                    </div>
                                    <div className="relative">
                                        <input type="checkbox" checked={toggle.checked} onChange={(e) => updateRule(toggle.key, e.target.checked)} className="sr-only peer" />
                                        <div className="w-10 h-5 bg-white/[0.06] rounded-full peer peer-checked:bg-cyan-500/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-600 peer-checked:after:bg-cyan-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Appliance Wattage */}
                <div className="hud-card p-5 mb-6">
                    <div className="hud-label mb-4">APPLIANCE POWER RATINGS</div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { code: 'LT', label: 'Lights', key: 'lights' },
                            { code: 'FN', label: 'Fan', key: 'fan' },
                            { code: 'PJ', label: 'Projector', key: 'projector' },
                            { code: 'PC', label: 'Desktop', key: 'desktop' },
                            { code: 'AC', label: 'Air Conditioning', key: 'ac' },
                        ].map(({ code, label, key }) => (
                            <div key={key} className="bg-white/[0.01] border border-white/[0.03] rounded-md p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-mono font-bold text-[var(--text-1)]">{code}</span>
                                    <span className="text-[9px] font-mono text-[var(--text-4)]">{label}</span>
                                </div>
                                <div className="relative">
                                    <input type="number" step="0.01" value={rules.appliances[key]} onChange={(e) => updateAppliance(key, e.target.value)}
                                        className="w-full px-3 py-2 pr-12 bg-transparent border border-[var(--border)] rounded-md text-sm font-mono font-bold text-[var(--text-1)] focus:border-cyan-500/30 focus:outline-none" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[var(--text-4)]">kWh</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operating Hours */}
                <div className="hud-card p-5 mb-6">
                    <div className="hud-label mb-4">OPERATING WINDOW</div>
                    <div className="grid grid-cols-2 gap-4">
                        {[{ label: 'START', key: 'start' }, { label: 'END', key: 'end' }].map(({ label, key }) => (
                            <div key={key}>
                                <span className="text-[10px] font-mono text-[var(--text-3)] block mb-2">{label}</span>
                                <input type="time" value={rules.operatingHours[key]}
                                    onChange={(e) => setRules(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, [key]: e.target.value } }))}
                                    className="w-full px-3 py-2.5 bg-transparent border border-[var(--border)] rounded-md text-lg font-mono font-bold text-[var(--text-1)] focus:border-cyan-500/30 focus:outline-none" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button className="flex-1 py-3 text-xs font-mono text-[var(--text-3)] border border-[var(--border)] rounded-md hover:bg-white/[0.02] transition-colors">
                        RESET DEFAULTS
                    </button>
                    <button onClick={handleSave} className="flex-1 py-3 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/20 bg-cyan-500/[0.06] rounded-md hover:bg-cyan-500/[0.1] transition-colors">
                        SAVE CONFIGURATION
                    </button>
                </div>
            </div>
        </Spotlight>
    );
}
