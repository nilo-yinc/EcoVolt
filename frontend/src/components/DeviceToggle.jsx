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
                    ? 'bg-brand-500/5 border border-brand-500/20'
                    : 'bg-surface-800/30 border border-surface-700/20'
                }`}
            id={`device-toggle-${id}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${is_on ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-700/40 text-surface-500'
                        }`}
                >
                    <Power size={18} />
                </div>
                <div>
                    <p className="text-sm font-medium text-surface-200">{name}</p>
                    <p className="text-[10px] text-surface-500">
                        {type} · {power_watts}W
                    </p>
                </div>
            </div>

            {/* Toggle switch */}
            <button
                onClick={() => controllable && onToggle?.(id)}
                disabled={!controllable}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${controllable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${is_on ? 'bg-brand-500' : 'bg-surface-600'}`}
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
