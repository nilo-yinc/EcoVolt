import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Settings as SettingsIcon, Clock, Eye, Bell, Mail, Smartphone,
    Power, Save, RotateCcw, ShieldCheck,
} from 'lucide-react';

export default function Settings() {
    const { config, updateConfig } = useApp();
    const [local, setLocal] = useState({ ...config });
    const [saved, setSaved] = useState(false);

    const update = (key, value) => {
        setLocal(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        updateConfig(local);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        setLocal({
            empty_timeout: 30,
            waste_confirmation: 60,
            confidence_threshold: 0.5,
            process_fps: 1,
            notification_email: true,
            notification_sms: false,
            auto_shutoff: false,
        });
        setSaved(false);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-1)] flex items-center gap-2">
                    <SettingsIcon size={24} className="text-[var(--accent)]" /> Settings
                </h1>
                <p className="text-sm text-[var(--text-3)] mt-1">Configure detection thresholds and notifications</p>
            </div>

            {/* ── Detection Settings ────────────────────────────── */}
            <section className="card p-6 space-y-5">
                <h2 className="text-sm font-semibold text-[var(--text-1)] uppercase tracking-wide flex items-center gap-2">
                    <Eye size={16} className="text-[var(--accent)]" /> Detection Settings
                </h2>

                <RangeInput
                    label="Empty Room Timeout"
                    desc="Seconds of 0 detections before room is flagged as 'empty'"
                    value={local.empty_timeout}
                    min={5} max={120} step={5} unit="s"
                    onChange={v => update('empty_timeout', v)}
                />

                <RangeInput
                    label="Waste Confirmation Time"
                    desc="Seconds of waste condition before triggering an alert"
                    value={local.waste_confirmation}
                    min={10} max={300} step={10} unit="s"
                    onChange={v => update('waste_confirmation', v)}
                />

                <RangeInput
                    label="Confidence Threshold"
                    desc="Minimum YOLO detection confidence (0.1 – 1.0)"
                    value={local.confidence_threshold}
                    min={0.1} max={1.0} step={0.05} unit=""
                    onChange={v => update('confidence_threshold', parseFloat(v.toFixed(2)))}
                />

                <RangeInput
                    label="Processing FPS"
                    desc="Frames processed per second (lower = less CPU, higher = faster detection)"
                    value={local.process_fps}
                    min={0.5} max={5} step={0.5} unit="fps"
                    onChange={v => update('process_fps', v)}
                />
            </section>

            {/* ── Notification Settings ──────────────────────────── */}
            <section className="card p-6 space-y-5">
                <h2 className="text-sm font-semibold text-[var(--text-1)] uppercase tracking-wide flex items-center gap-2">
                    <Bell size={16} className="text-[var(--accent)]" /> Notifications
                </h2>

                <ToggleRow
                    icon={Mail} label="Email Alerts"
                    desc="Send email when waste is confirmed"
                    checked={local.notification_email}
                    onChange={v => update('notification_email', v)}
                />
                <ToggleRow
                    icon={Smartphone} label="SMS Alerts"
                    desc="Send SMS via Twilio (requires API keys)"
                    checked={local.notification_sms}
                    onChange={v => update('notification_sms', v)}
                />
                <ToggleRow
                    icon={Power} label="Auto Shutoff (IoT)"
                    desc="Automatically trigger smart plugs to cut power on waste"
                    checked={local.auto_shutoff}
                    onChange={v => update('auto_shutoff', v)}
                />
            </section>

            {/* ── Privacy ────────────────────────────────────────── */}
            <section className="card p-6">
                <h2 className="text-sm font-semibold text-[var(--text-1)] uppercase tracking-wide flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-secure" /> Privacy Policy
                </h2>
                <div className="text-xs text-[var(--text-3)] space-y-2 leading-relaxed">
                    <p>✅ Raw video frames are <strong className="text-[var(--text-1)]">never stored or transmitted</strong>.</p>
                    <p>✅ All preview feeds are <strong className="text-[var(--text-1)]">anonymized</strong> (face/body blur) before display.</p>
                    <p>✅ Only metadata is logged: room ID, timestamp, person count, appliance state, waste status.</p>
                    <p>✅ No facial recognition is used.</p>
                </div>
            </section>

            {/* ── Save / Reset ───────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${saved
                            ? 'bg-secure/20 text-secure border border-secure/30'
                            : 'bg-[var(--accent)] text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20'
                        }`}
                >
                    <Save size={16} />
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-3)] bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-all"
                >
                    <RotateCcw size={16} />
                    Reset Defaults
                </button>
            </div>
        </div>
    );
}

/** Range slider input with label, description, and value display. */
function RangeInput({ label, desc, value, min, max, step, unit, onChange }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <div>
                    <p className="text-sm text-[var(--text-1)] font-medium">{label}</p>
                    <p className="text-[11px] text-[var(--text-3)]">{desc}</p>
                </div>
                <span className="text-lg font-bold text-[var(--accent)] font-mono min-w-[60px] text-right">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-[var(--surface-3)] cursor-pointer accent-brand-500
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-500/30"
            />
        </div>
    );
}

/** Toggle row with icon, label, description, and switch. */
function ToggleRow({ icon: Icon, label, desc, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${checked ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'bg-[var(--surface-3)] text-[var(--text-3)]'
                    }`}>
                    <Icon size={16} />
                </div>
                <div>
                    <p className="text-sm text-[var(--text-1)] font-medium">{label}</p>
                    <p className="text-[11px] text-[var(--text-3)]">{desc}</p>
                </div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-[var(--accent)]' : 'bg-surface-600'
                    }`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`} />
            </button>
        </div>
    );
}
