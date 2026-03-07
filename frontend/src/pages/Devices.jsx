import { Plug, Zap, Power } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { useRooms } from '../hooks/useRooms';
import DeviceToggle from '../components/DeviceToggle';

export default function Devices() {
    const { devices, totalPower, activeCount, byRoom, toggleDevice } = useDevices();
    const { rooms } = useRooms();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-1)] flex items-center gap-2">
                    <Plug size={24} className="text-[var(--accent)]" /> Devices
                </h1>
                <p className="text-sm text-[var(--text-3)] mt-1">Manage and monitor all connected devices</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="metric-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center">
                            <Plug size={20} className="text-[var(--accent)]" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-3)]">Total Devices</p>
                            <p className="text-xl font-bold text-[var(--text-1)]">{devices.length}</p>
                        </div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secure/10 flex items-center justify-center">
                            <Power size={20} className="text-secure" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-3)]">Active Now</p>
                            <p className="text-xl font-bold text-[var(--text-1)]">{activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-caution/10 flex items-center justify-center">
                            <Zap size={20} className="text-caution" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-3)]">Total Power Draw</p>
                            <p className="text-xl font-bold text-[var(--text-1)]">{totalPower} W</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Devices grouped by room */}
            <div className="space-y-4">
                {Object.entries(byRoom).map(([roomId, roomDevices]) => {
                    const room = rooms.find(r => r.id === roomId);
                    const roomPower = roomDevices.filter(d => d.is_on).reduce((s, d) => s + d.power_watts, 0);
                    const isWaste = room?.waste_detected;

                    return (
                        <div
                            key={roomId}
                            className={`card p-5 transition-all ${isWaste ? 'border-waste/30' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-semibold text-[var(--text-1)]">{room?.name || roomId}</h3>
                                    <p className="text-xs text-[var(--text-3)]">{room?.location}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isWaste && (
                                        <span className="text-xs text-waste font-medium animate-pulse">⚠ Waste Active</span>
                                    )}
                                    <span className="text-xs text-[var(--text-3)]">{roomPower}W active</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {roomDevices.map(device => (
                                    <DeviceToggle
                                        key={device.id}
                                        device={device}
                                        onToggle={toggleDevice}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
