import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spotlight } from '../components/ui/spotlight';
import { useRooms } from '../hooks/useRooms';
import { useApp } from '../context/AppContext';
import { useESP32 } from '../hooks/useESP32';
import { rooms as mockRooms } from '../data/mockData';

export default function GhostView() {
    const { rooms: liveRooms } = useRooms();
    const { devices, ghostFrames, backendOnline } = useApp();
    const [selectedRoom, setSelectedRoom] = useState('');
    const [ghostMode, setGhostMode] = useState(true);
    const [dataOnlyMode, setDataOnlyMode] = useState(false);
    const [feedError, setFeedError] = useState('');
    const [localCameraReady, setLocalCameraReady] = useState(false);
    const [timeNow, setTimeNow] = useState(Date.now());
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const cameraRequestRef = useRef(false);

    // ESP32 IoT — only enabled when test-room is selected
    const isTestRoom = selectedRoom === 'test-room';
    const esp32 = useESP32(isTestRoom);

    // Merge live rooms + mockData rooms, deduplicate by id, all rooms included
    const allRooms = useMemo(() => {
        const map = new Map();
        liveRooms.forEach(r => map.set(r.id, r));
        mockRooms.forEach(r => {
            if (!map.has(r.id)) {
                // Map mockData format to match live format
                map.set(r.id, {
                    ...r,
                    person_count: r.occupancy || 0,
                    camera_source: r.monitoring?.includes('CCTV') ? `CCTV-${r.id}` : null,
                    waste_detected: r.status === 'waste',
                    waste_duration: 0,
                    location: r.building,
                    last_updated: Date.now(),
                });
            }
        });
        return Array.from(map.values());
    }, [liveRooms]);

    const ghostFrameRoomIds = useMemo(() => Object.keys(ghostFrames || {}), [ghostFrames]);

    useEffect(() => {
        if (!selectedRoom && allRooms.length) {
            setSelectedRoom(allRooms[0].id);
        }
    }, [allRooms, selectedRoom]);

    useEffect(() => {
        const timer = setInterval(() => setTimeNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const requestCamera = useCallback(async () => {
        if (cameraRequestRef.current) return;
        cameraRequestRef.current = true;
        try {
            if (dataOnlyMode) {
                setFeedError('');
                setLocalCameraReady(false);
                return;
            }
            if (!window.isSecureContext || !navigator?.mediaDevices?.getUserMedia) {
                setFeedError('Camera API unavailable in this browser/context.');
                setLocalCameraReady(false);
                return;
            }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        const attempts = [
            { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false },
            { video: { width: { ideal: 960 }, height: { ideal: 540 } }, audio: false },
            { video: true, audio: false },
        ];

        let stream = null;
        let lastErr = null;
        for (const constraints of attempts) {
            try {
                stream = await Promise.race([
                    navigator.mediaDevices.getUserMedia(constraints),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Camera request timeout')), 8000)),
                ]);
                break;
            } catch (err) {
                lastErr = err;
            }
        }

            if (!stream) {
                const reason = lastErr?.name ? ` (${lastErr.name})` : '';
                setFeedError(`Camera permission denied or no camera found${reason}.`);
                setLocalCameraReady(false);
                return;
            }

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try {
                    await videoRef.current.play();
                } catch {
                    // Playback may still need user interaction in some browsers.
                }
            }
            setFeedError('');
            setLocalCameraReady(true);
        } finally {
            cameraRequestRef.current = false;
        }
    }, [dataOnlyMode]);

    useEffect(() => {
        requestCamera();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            setLocalCameraReady(false);
        };
    }, [requestCamera]);

    const activeRoom = allRooms.find((room) => room.id === selectedRoom) || allRooms[0];
    const latestGhostFrame = useMemo(() => {
        const frames = Object.values(ghostFrames || {});
        if (!frames.length) return null;
        return frames.reduce((latest, frame) => (
            !latest || (frame?.timestamp || 0) > (latest?.timestamp || 0) ? frame : latest
        ), null);
    }, [ghostFrames]);
    const activeGhostFrame = (activeRoom ? ghostFrames[activeRoom.id] : null) || latestGhostFrame;
    const ghostMeta = activeGhostFrame || {};
    const activeGhostSrc = activeGhostFrame?.image_b64
        ? `data:image/jpeg;base64,${activeGhostFrame.image_b64}`
        : '';
    const frameSeenAt = activeGhostFrame?.received_at || activeGhostFrame?.timestamp || 0;
    const ghostFresh = !!frameSeenAt && (Date.now() - frameSeenAt < 3500);
    // Prefer CV/YOLO ghost stream (with boxes/labels). Use local camera only as fallback.
    const usingYoloStream = ghostMode && !!activeGhostSrc && ghostFresh;
    const usingLocalGhostStream = ghostMode && !usingYoloStream && localCameraReady;
    const isWaste = (ghostMeta.waste_detected ?? activeRoom?.waste_detected) || activeRoom?.status === 'waste';
    const statusText = isWaste ? 'WASTE' : 'CLEAR';
    const statusClass = isWaste ? 'text-red-400' : 'text-emerald-400';

    // Get devices for current room
    const roomDevices = useMemo(() => {
        return devices.filter(d => d.room_id === activeRoom?.id);
    }, [devices, activeRoom]);

    // Build detection summary
    const detectionData = useMemo(() => {
        if (!activeRoom) return [];

        const app = activeRoom.appliances || {};
        const items = [];

        // People detected
        const people = ghostMeta.person_count ?? activeRoom.person_count ?? activeRoom.occupancy ?? 0;
        items.push({ label: 'People Detected', value: people, on: people > 0 });

        // Bulbs/Lights
        if (roomDevices.length > 0) {
            const bulbs = roomDevices.filter(d => d.type === 'light');
            const bulbsOn = bulbs.filter(d => d.is_on).length;
            items.push({ label: `Bulb ON`, value: `${bulbsOn} / ${bulbs.length}`, on: bulbsOn > 0 });
        } else if (app.bulbs) {
            // mockData rooms with explicit bulb count
            const lightsOn = ghostMeta.appliance_on ?? app.lights;
            const bulbsOn = lightsOn ? app.bulbs : 0;
            items.push({ label: 'Bulb ON', value: `${bulbsOn} / ${app.bulbs}`, on: bulbsOn > 0 });
        } else {
            const lightsOn = ghostMeta.appliance_on ?? app.lights;
            items.push({ label: 'Lights', value: lightsOn ? 'ON' : 'OFF', on: !!lightsOn });
        }

        // Fan
        if (roomDevices.length > 0) {
            const fans = roomDevices.filter(d => d.type === 'fan');
            const fansOn = fans.filter(d => d.is_on).length;
            if (fans.length > 0) {
                items.push({ label: `Fan ON`, value: `${fansOn} / ${fans.length}`, on: fansOn > 0 });
            }
        } else if (app.fan !== undefined) {
            items.push({ label: 'Fan', value: app.fan ? 'ON' : 'OFF', on: !!app.fan });
        }

        // Projector
        if (roomDevices.length > 0) {
            const proj = roomDevices.filter(d => d.type === 'projector');
            const projOn = proj.filter(d => d.is_on).length;
            if (proj.length > 0) {
                items.push({ label: `Projector ON`, value: `${projOn} / ${proj.length}`, on: projOn > 0 });
            }
        } else {
            items.push({ label: 'Projector', value: app.projector ? 'ON' : 'OFF', on: !!app.projector });
        }

        // Desktop / Monitors
        if (roomDevices.length > 0) {
            const monitors = roomDevices.filter(d => d.type === 'monitor');
            const monitorsOn = monitors.filter(d => d.is_on).length;
            if (monitors.length > 0) {
                items.push({ label: 'Desktop', value: monitorsOn > 0 ? `ON ${monitorsOn} / ${monitors.length}` : `OFF 0 / ${monitors.length}`, on: monitorsOn > 0 });
                // Phantom load: CPU running but monitor off
                const details = activeRoom.desktopDetails;
                const phantom = details ? Math.min(details.cpuActive, details.monitorsOff) : 0;
                items.push({ label: 'CPU ON / Monitor OFF', value: `${phantom} / ${monitors.length}`, on: phantom > 0 });
            }
        } else if (app.desktops > 0) {
            const details = activeRoom.desktopDetails;
            const phantom = details ? Math.min(details.cpuActive, details.monitorsOff) : 0;
            items.push({ label: 'Desktop', value: phantom > 0 ? `ON 0 / ${app.desktops}` : `OFF 0 / ${app.desktops}`, on: phantom > 0 });
            items.push({ label: 'CPU ON / Monitor OFF', value: `${phantom} / ${app.desktops}`, on: phantom > 0 });
        } else if (app.monitors !== undefined) {
            items.push({ label: 'Monitors', value: app.monitors ? 'ON' : 'OFF', on: !!app.monitors });
        }

        // AC
        items.push({ label: 'AC', value: app.ac ? 'ON' : 'OFF', on: !!app.ac });
        if (ghostMeta.brightness !== undefined) {
            items.push({ label: 'Brightness', value: `${ghostMeta.brightness}`, on: true });
        }
        if (ghostMeta.latency_ms !== undefined) {
            items.push({ label: 'Latency', value: `${(ghostMeta.latency_ms / 1000).toFixed(2)}s`, on: true });
        }

        return items;
    }, [activeRoom, roomDevices, ghostMeta]);

    // Total power being drawn
    const totalPower = useMemo(() => {
        if (roomDevices.length > 0) {
            return roomDevices.filter(d => d.is_on).reduce((sum, d) => sum + d.power_watts, 0);
        }
        return activeRoom?.energyUsage ? Math.round(activeRoom.energyUsage * 1000) : 0;
    }, [roomDevices, activeRoom]);

    return (
        <Spotlight className="min-h-full">
            <div className="max-w-[1650px] mx-auto">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="hud-label">PRIVACY MODE</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--ww-text-1)] tracking-tight mb-1">Ghost View</h1>
                    <p className="text-xs font-mono text-[var(--ww-text-3)]">Anonymized surveillance feed - No PII stored</p>
                </div>

                <div className="hud-card p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="hud-label mb-2">SELECT FEED</div>
                            <select
                                value={selectedRoom}
                                onChange={(e) => setSelectedRoom(e.target.value)}
                                className="w-full px-3 py-2 bg-transparent border border-[var(--ww-border)] rounded-md text-[var(--ww-text-2)] text-xs font-mono focus:border-cyan-500/30 focus:outline-none"
                            >
                                {allRooms.map((room) => (
                                    <option key={room.id} value={room.id} className="bg-slate-900">
                                        {room.name} ({room.location || room.building})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 px-3 py-2 border border-[var(--ww-border)] rounded-md cursor-pointer hover:border-purple-500/20 transition-colors w-full">
                                <input
                                    type="checkbox"
                                    checked={ghostMode}
                                    onChange={(e) => setGhostMode(e.target.checked)}
                                    className="w-3.5 h-3.5 accent-purple-400"
                                />
                                <span className="text-xs font-mono text-[var(--ww-text-2)]">GHOST MODE</span>
                            </label>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 px-3 py-2 border border-[var(--ww-border)] rounded-md cursor-pointer hover:border-cyan-500/20 transition-colors w-full">
                                <input
                                    type="checkbox"
                                    checked={dataOnlyMode}
                                    onChange={(e) => setDataOnlyMode(e.target.checked)}
                                    className="w-3.5 h-3.5 accent-cyan-400"
                                />
                                <span className="text-xs font-mono text-[var(--ww-text-2)]">DATA ONLY</span>
                            </label>
                        </div>
                    </div>
                </div>

                {activeRoom && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* ── Video Feed ─────────────────────────── */}
                        <div className="col-span-2">
                            <div className="hud-card overflow-hidden" style={{ minHeight: '560px' }}>
                                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.03]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                        <span className="text-[9px] font-mono text-red-400 tracking-wider">REC</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-[var(--ww-text-muted)]">
                                        {new Date(timeNow).toLocaleTimeString('en-US', { hour12: false })}
                                    </span>
                                    <span className="text-[9px] font-mono text-[var(--ww-text-muted)]">
                                        {activeRoom.name.toUpperCase()}
                                    </span>
                                </div>

                                {dataOnlyMode ? (
                                    <div className="flex items-center justify-center p-12" style={{ minHeight: '500px' }}>
                                        <div className="text-center">
                                            <div className="text-[var(--ww-text-muted)] text-5xl font-mono mb-4">[X]</div>
                                            <p className="text-xs font-mono text-[var(--ww-text-3)] mb-6">VISUAL FEED DISABLED</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { label: 'PEOPLE', val: activeRoom.person_count, accent: 'text-cyan-400' },
                                                    { label: 'STATUS', val: statusText, accent: statusClass },
                                                    {
                                                        label: 'WASTE',
                                                        val: activeRoom.waste_duration ? `${Math.floor(activeRoom.waste_duration / 60)}m` : '0m',
                                                        accent: 'text-amber-400',
                                                    },
                                                ].map((stat, index) => (
                                                    <div key={index} className="bg-white/[0.02] rounded-md p-3">
                                                        <div className="text-[8px] font-mono text-[var(--ww-text-muted)] mb-1">{stat.label}</div>
                                                        <div className={`text-lg font-mono font-bold ${stat.accent}`}>{stat.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative" style={{ minHeight: '500px' }}>
                                        {usingYoloStream ? (
                                            <img src={activeGhostSrc} alt="Ghost feed" className="w-full h-[500px] object-contain bg-black" />
                                        ) : usingLocalGhostStream ? (
                                            <div className="relative w-full h-[500px] bg-black overflow-hidden">
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                    className="w-full h-[500px] object-contain bg-black [filter:blur(10px)_saturate(0.9)]"
                                                />
                                            </div>
                                        ) : ghostMode ? (
                                            <div className="w-full h-[500px] flex items-center justify-center text-center bg-black/80 px-6">
                                                <div>
                                                    <div className="text-sm font-mono text-red-400 mb-2">PRIVACY LOCK</div>
                                                    <div className="text-xs font-mono text-[var(--ww-text-3)]">Ghost Mode needs YOLO stream.</div>
                                                    <div className="text-xs font-mono text-[var(--ww-text-3)] mt-1">
                                                        Start computer_vision service for person-only blur.
                                                    </div>
                                                    {!!feedError && (
                                                        <button
                                                            type="button"
                                                            onClick={requestCamera}
                                                            className="mt-4 px-3 py-1.5 text-[10px] font-mono border border-cyan-500/30 rounded text-cyan-300 hover:bg-cyan-500/10"
                                                        >
                                                            RETRY CAMERA
                                                        </button>
                                                    )}
                                                    {!!feedError && (
                                                        <div className="mt-2 text-[10px] font-mono text-amber-300">{feedError}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                muted
                                                playsInline
                                                className="w-full h-[500px] object-contain bg-black"
                                            />
                                        )}
                                        {ghostMode && (
                                            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_50%,rgba(88,28,135,0.20),transparent_50%)]" />
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <div className="text-[9px] font-mono text-purple-400 tracking-wider">
                                                {ghostMode ? (usingYoloStream ? 'GHOST MODE' : 'LOCAL GHOST MODE') : 'LIVE MODE'}
                                            </div>
                                            <div className="text-xs font-mono text-[var(--ww-text-1)] mt-1">
                                                {usingYoloStream
                                                    ? `${ghostMeta.person_count ?? activeRoom.person_count ?? activeRoom.occupancy ?? 0} detected`
                                                    : usingLocalGhostStream
                                                        ? 'Live local camera (privacy blur)'
                                                        : 'N/A (camera/CV required)'}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="h-px bg-gradient-to-r from-purple-500/20 via-transparent to-transparent mb-2" />
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-purple-400" />
                                                <span className="text-[8px] font-mono text-[var(--ww-text-3)]">
                                                    {(!ghostMode && feedError)
                                                        || (!backendOnline
                                                            ? 'Backend offline: using local ghost camera'
                                                            : usingYoloStream
                                                                ? 'YOLO blur stream active'
                                                                : usingLocalGhostStream
                                                                    ? 'Local ghost camera active (fallback)'
                                                                    : 'Camera/CV unavailable: privacy lock active')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Side Panel ─────────────────────────── */}
                        <div className="space-y-4">
                            {/* Detection Data */}
                            <div className="hud-card p-4">
                                <div className="hud-label mb-3">DETECTION DATA</div>
                                {detectionData.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                                        <span className="text-[10px] font-mono text-[var(--ww-text-3)]">{item.label}</span>
                                        <span className={`text-xs font-mono font-bold tracking-wider ${item.on ? 'text-amber-400' : 'text-[var(--ww-text-muted)]'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Feed Status */}
                            <div className="hud-card p-4">
                                <div className="hud-label mb-3">FEED STATUS</div>
                                {[
                                    { label: 'Room', val: activeRoom.name },
                                    { label: 'Monitoring', val: activeRoom.monitoring || 'CCTV' },
                                    { label: 'Brightness', val: ghostMeta.brightness !== undefined ? `${ghostMeta.brightness}` : 'N/A' },
                                    { label: 'Latency', val: ghostMeta.latency_ms !== undefined ? `${(ghostMeta.latency_ms / 1000).toFixed(2)}s` : 'N/A' },
                                    { label: 'Power Draw', val: `${totalPower}W`, accent: totalPower > 0 ? 'text-amber-400' : '' },
                                    { label: 'Status', val: statusText, accent: statusClass },
                                    { label: 'Backend', val: backendOnline ? 'ONLINE' : 'OFFLINE', accent: backendOnline ? 'text-emerald-400' : 'text-red-400' },
                                ].map((stat, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                                        <span className="text-[10px] font-mono text-[var(--ww-text-muted)]">{stat.label}</span>
                                        <span className={`text-xs font-mono font-bold ${stat.accent || 'text-[var(--ww-text-1)]'}`}>{stat.val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Privacy Layer */}
                            <div className="hud-card p-4">
                                <div className="hud-label mb-3">PRIVACY LAYER</div>
                                {['No raw video stored', 'Local processing only', 'Face/body blur in Ghost Mode', 'Audit-logged access'].map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 py-1.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                        <span className="text-[10px] font-mono text-[var(--ww-text-2)]">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="hud-card p-4">
                                <div className="hud-label mb-3">APPLIANCES</div>
                                {[
                                    { label: 'Lights', on: isTestRoom ? esp32.ledState : activeRoom.appliances?.lights },
                                    { label: 'Fan', on: isTestRoom ? esp32.fanState : activeRoom.appliances?.fan },
                                    { label: 'Projector', on: activeRoom.appliances?.projector },
                                    { label: 'AC', on: activeRoom.appliances?.ac },
                                    { label: 'Monitors', on: activeRoom.appliances?.monitors },
                                ].map((appliance, index) => (
                                    <div key={index} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                                        <span className="text-[10px] font-mono text-[var(--ww-text-3)]">{appliance.label}</span>
                                        <span className={`text-[9px] font-mono font-bold tracking-wider ${appliance.on ? 'text-amber-400' : 'text-[var(--ww-text-muted)]'}`}>
                                            {appliance.on ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* IoT Device Control — test-room only */}
                            {isTestRoom && (
                                <div className="hud-card p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="hud-label">IOT CONTROL</div>
                                        <span className={`text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ${esp32.connectionStatus === 'connected'
                                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                                : esp32.connectionStatus === 'disconnected'
                                                    ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                                                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                                            }`}>
                                            {esp32.connectionStatus === 'connected' ? 'ESP32 ONLINE' : esp32.connectionStatus === 'disconnected' ? 'ESP32 OFFLINE' : 'CONNECTING'}
                                        </span>
                                    </div>

                                    {/* Lights */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono text-[var(--ww-text-2)]">Lights</span>
                                            <span className={`text-[9px] font-mono font-bold ${esp32.ledState ? 'text-amber-400' : 'text-[var(--ww-text-muted)]'}`}>
                                                {esp32.ledState ? 'ON' : 'OFF'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => esp32.controlLED('on')}
                                                disabled={esp32.isLoading}
                                                className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border transition-colors bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/[0.12] disabled:opacity-40"
                                            >ON</button>
                                            <button
                                                onClick={() => esp32.controlLED('off')}
                                                disabled={esp32.isLoading}
                                                className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border transition-colors bg-red-500/[0.06] text-red-400 border-red-500/20 hover:bg-red-500/[0.12] disabled:opacity-40"
                                            >OFF</button>
                                            <button
                                                onClick={() => esp32.controlLED('toggle')}
                                                disabled={esp32.isLoading}
                                                className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border transition-colors bg-cyan-500/[0.06] text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/[0.12] disabled:opacity-40"
                                            >TOGGLE</button>
                                        </div>
                                    </div>

                                    {/* Fan */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono text-[var(--ww-text-2)]">Fan</span>
                                            <span className={`text-[9px] font-mono font-bold ${esp32.fanState ? 'text-amber-400' : 'text-[var(--ww-text-muted)]'}`}>
                                                {esp32.fanState ? 'ON' : 'OFF'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => esp32.controlFan('on')}
                                                disabled={esp32.isLoading}
                                                className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border transition-colors bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/[0.12] disabled:opacity-40"
                                            >ON</button>
                                            <button
                                                onClick={() => esp32.controlFan('off')}
                                                disabled={esp32.isLoading}
                                                className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border transition-colors bg-red-500/[0.06] text-red-400 border-red-500/20 hover:bg-red-500/[0.12] disabled:opacity-40"
                                            >OFF</button>
                                            <button
                                                onClick={() => esp32.controlFan('toggle')}
                                                disabled={esp32.isLoading}
                                                className="flex-1 py-1.5 text-[9px] font-mono font-bold rounded border transition-colors bg-cyan-500/[0.06] text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/[0.12] disabled:opacity-40"
                                            >TOGGLE</button>
                                        </div>
                                    </div>

                                    {esp32.lastMessage && (
                                        <div className={`mt-2 text-[8px] font-mono px-2 py-1 rounded ${esp32.lastMessage.includes('Failed') ? 'text-red-400 bg-red-500/10' : 'text-cyan-400 bg-cyan-500/10'}`}>
                                            {esp32.lastMessage}
                                        </div>
                                    )}

                                    <div className="mt-2 text-[8px] font-mono text-[var(--ww-text-muted)]">
                                        ESP32 IP: {esp32.espIp}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Spotlight>
    );
}
