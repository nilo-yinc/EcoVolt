import { useState } from 'react';
import { rooms } from '../data/mockData';
import { Spotlight } from '../components/ui/spotlight';
import { useESP32 } from '../hooks/useESP32';

export default function ManualControl() {
    const [selectedRoom, setSelectedRoom] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState('');

    const selectedRoomData = rooms.find(r => r.id === selectedRoom);
    const canTakeAction = selectedRoomData && selectedRoomData.occupancy === 0;
    const isTestRoom = selectedRoom === 'test-room';
    const esp32 = useESP32(isTestRoom);

    const handleAction = (action) => { setActionType(action); setShowModal(true); };

    return (
        <Spotlight className="min-h-full">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            <span className="hud-label">MANUAL OVERRIDE</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-1">Power Control</h1>
                        <p className="text-xs font-mono text-[var(--text-3)]">Direct appliance control · Safety interlocks active</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 hud-card">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[9px] font-mono text-emerald-400 tracking-wider">SAFETY ACTIVE</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Room Select */}
                    <div className="hud-card p-5">
                        <div className="hud-label mb-3">TARGET ROOM</div>
                        <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}
                            className="w-full px-3 py-2.5 bg-transparent border border-[var(--border)] rounded-md text-[var(--text-2)] text-xs font-mono focus:border-cyan-500/30 focus:outline-none mb-4">
                            <option value="" className="bg-slate-900">Select target...</option>
                            {rooms.map(room => (<option key={room.id} value={room.id} className="bg-slate-900">{room.name} ({room.building})</option>))}
                        </select>
                        {selectedRoomData && (
                            <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                                {[
                                    { l: 'Type', v: selectedRoomData.type },
                                    { l: 'Building', v: selectedRoomData.building },
                                ].map((d, i) => (
                                    <div key={i} className="flex justify-between"><span className="text-[10px] font-mono text-[var(--text-4)]">{d.l}</span><span className="text-xs font-mono text-[var(--text-1)]">{d.v}</span></div>
                                ))}
                                <div className={`flex justify-between items-center py-2 px-3 rounded-md mt-2 ${selectedRoomData.occupancy > 0 ? 'bg-red-500/[0.06] border border-red-500/15' : 'bg-emerald-500/[0.06] border border-emerald-500/15'}`}>
                                    <span className="text-[10px] font-mono text-[var(--text-2)]">Occupancy</span>
                                    <span className={`text-sm font-mono font-bold ${selectedRoomData.occupancy > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedRoomData.occupancy}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="hud-card p-5">
                        <div className="hud-label mb-3">ACTIONS</div>
                        {!selectedRoom ? (
                            <div className="flex items-center justify-center py-16"><span className="text-xs font-mono text-[var(--text-4)]">SELECT A TARGET</span></div>
                        ) : !canTakeAction ? (
                            <div className="p-4 bg-red-500/[0.04] border border-red-500/15 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                    <span className="text-xs font-mono font-bold text-red-400 tracking-wider">SAFETY LOCK</span>
                                </div>
                                <p className="text-[10px] font-mono text-[var(--text-3)]">Controls locked — {selectedRoomData.occupancy} occupants detected</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {[
                                    { action: 'powerOff', label: 'POWER OFF', sub: 'Disable all appliances', border: 'border-red-500/20 hover:bg-red-500/[0.04]', text: 'text-red-400' },
                                    { action: 'powerOn', label: 'RESTORE POWER', sub: 'Enable all appliances', border: 'border-emerald-500/20 hover:bg-emerald-500/[0.04]', text: 'text-emerald-400' },
                                ].map((btn, i) => (
                                    <button key={i} onClick={() => handleAction(btn.action)}
                                        className={`w-full p-4 text-left rounded-md border ${btn.border} transition-colors`}>
                                        <div className={`text-sm font-mono font-bold ${btn.text} mb-0.5`}>{btn.label}</div>
                                        <div className="text-[10px] font-mono text-[var(--text-4)]">{btn.sub}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Appliance grid */}
                {selectedRoomData && (
                    <div className="hud-card p-5 mb-6">
                        <div className="hud-label mb-4">APPLIANCE MATRIX</div>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { code: 'LT', label: 'Lights', on: selectedRoomData.appliances.lights },
                                { code: 'FN', label: 'Fan', on: selectedRoomData.appliances.fan },
                                { code: 'PJ', label: 'Projector', on: selectedRoomData.appliances.projector },
                                { code: 'AC', label: 'Air Conditioning', on: selectedRoomData.appliances.ac },
                                ...(selectedRoomData.appliances.desktops > 0 ? [{ code: 'PC', label: `${selectedRoomData.appliances.desktops} Desktops`, on: true }] : []),
                            ].map((a, i) => (
                                <div key={i} className={`p-3 rounded-md border ${a.on ? 'border-amber-500/15 bg-amber-500/[0.03]' : 'border-[var(--border)]'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-mono font-bold text-[var(--text-1)]">{a.code}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${a.on ? 'bg-amber-400' : 'bg-slate-700'}`} />
                                    </div>
                                    <div className="text-[10px] font-mono text-[var(--text-3)]">{a.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ESP32 IoT Control — test-room only */}
                {isTestRoom && (
                    <div className="hud-card p-5 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="hud-label">IOT DEVICE CONTROL</div>
                            <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-1 rounded ${esp32.connectionStatus === 'connected'
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                    : esp32.connectionStatus === 'disconnected'
                                        ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                                        : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                                }`}>
                                {esp32.connectionStatus === 'connected' ? 'ESP32 ONLINE' : esp32.connectionStatus === 'disconnected' ? 'ESP32 OFFLINE' : 'CONNECTING'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Lights */}
                            <div className={`p-4 rounded-md border ${esp32.ledState ? 'border-amber-500/15 bg-amber-500/[0.03]' : 'border-[var(--border)]'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-mono font-bold text-[var(--text-1)]">LT</span>
                                    <div className={`w-2 h-2 rounded-full ${esp32.ledState ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]' : 'bg-slate-700'}`} />
                                </div>
                                <div className="text-[10px] font-mono text-[var(--text-3)] mb-1">Lights</div>
                                <div className={`text-[9px] font-mono font-bold mb-3 tracking-wider ${esp32.ledState ? 'text-amber-400' : 'text-[var(--text-4)]'}`}>
                                    {esp32.ledState ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => esp32.controlLED('on')} disabled={esp32.isLoading}
                                        className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/[0.12] disabled:opacity-40 transition-colors">ON</button>
                                    <button onClick={() => esp32.controlLED('off')} disabled={esp32.isLoading}
                                        className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border bg-red-500/[0.06] text-red-400 border-red-500/20 hover:bg-red-500/[0.12] disabled:opacity-40 transition-colors">OFF</button>
                                    <button onClick={() => esp32.controlLED('toggle')} disabled={esp32.isLoading}
                                        className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border bg-cyan-500/[0.06] text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/[0.12] disabled:opacity-40 transition-colors">TOGGLE</button>
                                </div>
                            </div>
                            {/* Fan */}
                            <div className={`p-4 rounded-md border ${esp32.fanState ? 'border-amber-500/15 bg-amber-500/[0.03]' : 'border-[var(--border)]'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-mono font-bold text-[var(--text-1)]">FN</span>
                                    <div className={`w-2 h-2 rounded-full ${esp32.fanState ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]' : 'bg-slate-700'}`} />
                                </div>
                                <div className="text-[10px] font-mono text-[var(--text-3)] mb-1">Fan</div>
                                <div className={`text-[9px] font-mono font-bold mb-3 tracking-wider ${esp32.fanState ? 'text-amber-400' : 'text-[var(--text-4)]'}`}>
                                    {esp32.fanState ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => esp32.controlFan('on')} disabled={esp32.isLoading}
                                        className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/[0.12] disabled:opacity-40 transition-colors">ON</button>
                                    <button onClick={() => esp32.controlFan('off')} disabled={esp32.isLoading}
                                        className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border bg-red-500/[0.06] text-red-400 border-red-500/20 hover:bg-red-500/[0.12] disabled:opacity-40 transition-colors">OFF</button>
                                    <button onClick={() => esp32.controlFan('toggle')} disabled={esp32.isLoading}
                                        className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border bg-cyan-500/[0.06] text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/[0.12] disabled:opacity-40 transition-colors">TOGGLE</button>
                                </div>
                            </div>
                        </div>
                        {esp32.lastMessage && (
                            <div className={`mt-3 text-[9px] font-mono px-2 py-1.5 rounded ${esp32.lastMessage.includes('Failed') ? 'text-red-400 bg-red-500/10' : 'text-cyan-400 bg-cyan-500/10'}`}>
                                {esp32.lastMessage}
                            </div>
                        )}
                        <div className="mt-3 text-[8px] font-mono text-[var(--text-4)]">
                            ESP32 IP: {esp32.espIp} · Auto-refresh: 5s
                        </div>
                    </div>
                )}

                {/* Safety protocols */}
                <div className="hud-card p-5">
                    <div className="hud-label mb-4">SAFETY PROTOCOLS</div>
                    <div className="grid grid-cols-2 gap-3">
                        {['Occupancy interlock prevents live-room shutoff', 'All actions timestamped and audit-logged', 'Confirmation required for all power changes', 'Emergency restore available via admin terminal'].map((t, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-white/[0.01] rounded-md border border-white/[0.03]">
                                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                <span className="text-[10px] font-mono text-[var(--text-2)] leading-relaxed">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="hud-card p-6 max-w-sm w-full mx-4">
                        <div className="hud-label mb-3">CONFIRM ACTION</div>
                        <p className="text-sm text-[var(--text-2)] mb-1">
                            {actionType === 'powerOff' ? 'Turn OFF' : 'Restore'} power in:
                        </p>
                        <p className="text-sm font-mono font-bold text-[var(--text-1)] mb-4">{selectedRoomData?.name}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs font-mono text-[var(--text-2)] border border-[var(--border)] rounded-md hover:bg-white/[0.02]">CANCEL</button>
                            <button onClick={() => setShowModal(false)}
                                className={`flex-1 py-2 text-xs font-mono font-bold rounded-md border ${actionType === 'powerOff' ? 'text-red-400 border-red-500/20 bg-red-500/[0.06]' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]'}`}>CONFIRM</button>
                        </div>
                    </div>
                </div>
            )}
        </Spotlight>
    );
}
