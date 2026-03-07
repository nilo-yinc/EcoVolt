import { Power } from 'lucide-react';

/**
 * Toggle switch for controlling devices.
 * Shows device name, power, and ON/OFF state.
 */
export default function DeviceToggle({ device, onToggle }) {
    const { id, name, type, is_on, power_watts, controllable } = device;

    return (
        <div
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${is_on
                ? 'bg-[var(--accent-dim)] border border-[var(--border)]'
                : 'bg-[var(--surface-2)] border border-[var(--border)]'
                }`}
            id={`device-toggle-${id}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${is_on ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'bg-[var(--surface-3)] text-[var(--text-3)]'
                        }`}
                >
                    <Power size={18} />
                </div>
                <div>
                    <p className="text-sm font-medium text-[var(--text-1)]">{name}</p>
                    <p className="text-[10px] text-[var(--text-3)]">
                        {type} · {power_watts}W
                    </p>
                </div>
            </div>

            {/* Toggle switch */}
            <button
                onClick={() => controllable && onToggle?.(id)}
                disabled={!controllable}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${controllable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${is_on ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]'}`}
                aria-label={`Toggle ${name}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${is_on ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}
