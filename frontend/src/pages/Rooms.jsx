import { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import {
    DoorOpen, Users, Projector, MonitorSmartphone, Lightbulb,
    Clock, MapPin, Camera, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import RoomCard from '../components/RoomCard';
import StatusBadge from '../components/StatusBadge';

export default function Rooms() {
    const { rooms } = useRooms();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all'
        ? rooms
        : rooms.filter(r => r.status === filter);

    const detail = selectedRoom ? rooms.find(r => r.id === selectedRoom) : null;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-1)] flex items-center gap-2">
                        <DoorOpen size={24} className="text-[var(--accent)]" /> Rooms
                    </h1>
                    <p className="text-sm text-[var(--text-3)] mt-1">Monitor all campus rooms in real-time</p>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'All', count: rooms.length },
                        { key: 'secure', label: 'Secure', count: rooms.filter(r => r.status === 'secure').length },
                        { key: 'waste', label: 'Waste', count: rooms.filter(r => r.status === 'waste').length },
                        { key: 'recently_vacated', label: 'Monitoring', count: rooms.filter(r => r.status === 'recently_vacated').length },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f.key
                                    ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-2)]'
                                    : 'bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)] hover:bg-[var(--surface-2)]'
                                }`}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Room grid */}
                <div className="xl:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filtered.map(room => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(room.id)}
                                className="cursor-pointer"
                            >
                                <RoomCard room={room} />
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full text-center py-12 card">
                                <p className="text-[var(--text-3)]">No rooms match this filter</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="xl:col-span-1">
                    {detail ? (
                        <div className="card p-6 space-y-5 animate-slide-up sticky top-6">
                            {/* Room header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--text-1)]">{detail.name}</h2>
                                    <p className="text-xs text-[var(--text-3)] flex items-center gap-1 mt-1">
                                        <MapPin size={12} /> {detail.location}
                                    </p>
                                </div>
                                <StatusBadge status={detail.status} />
                            </div>

                            {/* Divider */}
                            <div className="border-t border-[var(--border)]" />

                            {/* Anonymized preview placeholder */}
                            <div className="relative rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]">
                                <div className="aspect-video flex flex-col items-center justify-center gap-2 text-[var(--text-3)]">
                                    <Camera size={32} />
                                    <p className="text-xs">Anonymized Preview</p>
                                    <p className="text-[10px] text-[var(--text-4)]">Raw footage is never displayed</p>
                                </div>
                                {/* Privacy shield overlay */}
                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-900/80 text-[10px] text-secure">
                                    <ShieldCheck size={12} /> Privacy Protected
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <DetailStat icon={Users} label="Occupancy" value={detail.person_count} sub="people" />
                                <DetailStat
                                    icon={Clock} label="Waste Duration"
                                    value={detail.waste_duration > 0 ? `${Math.floor(detail.waste_duration / 60)}m` : '—'}
                                    sub={detail.waste_detected ? 'active' : 'none'}
                                    alert={detail.waste_detected}
                                />
                            </div>

                            {/* Appliances */}
                            <div>
                                <p className="text-xs text-[var(--text-3)] mb-2 font-medium uppercase tracking-wide">Appliances</p>
                                <div className="space-y-2">
                                    <ApplianceRow icon={Projector} label="Projector" on={detail.appliances?.projector} />
                                    <ApplianceRow icon={MonitorSmartphone} label="Monitors" on={detail.appliances?.monitors} />
                                    <ApplianceRow icon={Lightbulb} label="Lights" on={detail.appliances?.lights} />
                                </div>
                            </div>

                            {/* Camera info */}
                            <div className="text-[10px] text-[var(--text-3)] flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                                <Camera size={12} />
                                Source: {detail.camera_source} · Last update: {new Date(detail.last_updated).toLocaleTimeString()}
                            </div>
                        </div>
                    ) : (
                        <div className="card p-8 text-center">
                            <DoorOpen size={40} className="mx-auto text-[var(--text-4)] mb-3" />
                            <p className="text-[var(--text-3)] text-sm">Select a room to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailStat({ icon: Icon, label, value, sub, alert }) {
    return (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--surface-2)]">
            <Icon size={16} className={alert ? 'text-waste' : 'text-[var(--accent)]'} />
            <div>
                <p className={`text-lg font-bold leading-none ${alert ? 'text-waste' : 'text-[var(--text-1)]'}`}>{value}</p>
                <p className="text-[10px] text-[var(--text-3)] mt-0.5">{label}</p>
            </div>
        </div>
    );
}

function ApplianceRow({ icon: Icon, label, on }) {
    return (
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${on ? 'bg-[var(--accent-dim)] border border-[var(--border-2)]' : 'bg-[var(--surface-2)] border border-[var(--border)]'
            }`}>
            <div className="flex items-center gap-2">
                <Icon size={14} className={on ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'} />
                <span className="text-sm text-[var(--text-2)]">{label}</span>
            </div>
            <span className={`text-xs font-medium ${on ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}`}>
                {on ? 'ON' : 'OFF'}
            </span>
        </div>
    );
}
