# app/api/server.py
import asyncio
import base64
import time
from collections import defaultdict
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.db import repo
from app.api.schemas import ConfigUpdateRequest, GhostFrameRequest, GhostFrameResponse
from app.api.state import (
    energy_logs,
    get_devices,
    get_rooms,
    latest_ghost_frames,
    latest_state,
    room_config,
)
from app.cv.appliance import EnvironmentDetector
from app.cv.detector import detect_objects
from app.cv.privacy import draw_boundaries_and_anonymize
from app.logic.engine import WasteDetector
from app.logic.predictor import SavingsPredictor


app = FastAPI(title="EcoVolt Brain API", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

room_states = {room["id"]: room for room in get_rooms()}
device_states = {device["id"]: device for device in get_devices()}
room_detectors = defaultdict(lambda: WasteDetector(delay_seconds=5))
room_predictors = defaultdict(SavingsPredictor)
env_detector = EnvironmentDetector()


class ConnectionManager:
    def __init__(self):
        self.connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, payload: dict[str, Any]):
        stale: list[WebSocket] = []
        for connection in self.connections:
            try:
                await connection.send_json(payload)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


manager = ConnectionManager()


def decode_frame(image_b64: str):
    try:
        raw = base64.b64decode(image_b64)
        buffer = np.frombuffer(raw, dtype=np.uint8)
        frame = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image payload") from exc
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image")
    return frame


def encode_frame(frame):
    ok, encoded = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
    if not ok:
        raise HTTPException(status_code=500, detail="Could not encode processed image")
    return base64.b64encode(encoded.tobytes()).decode("utf-8")


def status_for_room(person_count: int, waste_detected: bool):
    if person_count > 0:
        return "secure"
    if waste_detected:
        return "waste"
    return "recently_vacated"


def waste_duration_for(room_id: str, waste_detected: bool):
    detector = room_detectors[room_id]
    if not waste_detected or detector.empty_since is None:
        return 0
    return int(max(time.time() - detector.empty_since, 0))


def apply_state_to_devices(room_id: str, state: dict[str, Any]):
    for device in device_states.values():
        if device["room_id"] != room_id:
            continue
        if device["type"] == "light":
            device["is_on"] = state["lights_on"] or state["light_count"] > 0
        elif device["type"] == "fan":
            device["is_on"] = state["fan_count"] > 0
        elif device["type"] in {"projector", "monitor"}:
            device["is_on"] = state["screens_on"]


def build_room_payload(room_id: str, state: dict[str, Any]):
    room = room_states[room_id]
    room.update(
        {
            "person_count": state["people_count"],
            "status": status_for_room(state["people_count"], state["waste_detected"]),
            "waste_detected": state["waste_detected"],
            "waste_duration": waste_duration_for(room_id, state["waste_detected"]),
            "last_updated": int(time.time() * 1000),
            "savings_metrics": state["savings_metrics"],
        }
    )
    room["appliances"].update(
        {
            "lights": state["lights_on"] or state["light_count"] > 0,
            "fan": state["fan_count"] > 0,
            "projector": state["screens_on"],
            "monitors": state["screens_on"],
        }
    )
    apply_state_to_devices(room_id, state)
    return room


def persist_event(room_payload: dict[str, Any], ghost_payload: dict[str, Any]):
    event = {
        "event": "cv_update",
        "room_id": room_payload["id"],
        "waste_detected": room_payload["waste_detected"],
        "person_count": room_payload["person_count"],
        "brightness": ghost_payload["brightness"],
        "latency_ms": ghost_payload["latency_ms"],
        "savings_metrics": ghost_payload["savings_metrics"],
        "timestamp": int(time.time()),
    }
    energy_logs.insert(0, event)
    del energy_logs[100:]
    if repo.available:
        repo.save_event(event)
        repo.upsert_room_state(room_payload)
        repo.upsert_devices(list(device_states.values()))
    
    latest_ghost_frames[ghost_payload["room_id"]] = ghost_payload


async def publish_updates(room_payload: dict[str, Any], ghost_payload: dict[str, Any]):
    await manager.broadcast({"type": "room_update", "payload": room_payload})
    await manager.broadcast({"type": "ghost_frame", "payload": ghost_payload})


@app.on_event("startup")
async def startup_event():
    if repo.available:
        stored_rooms = repo.get_room_states()
        stored_devices = repo.get_devices()
        stored_logs = repo.list_logs()
        if stored_rooms:
            # Merge stored rooms into our baseline
            for room in stored_rooms:
                room_states[room["id"]] = room
        if stored_devices:
            # Merge stored devices
            for device in stored_devices:
                device_states[device["id"]] = device
        if stored_logs:
            energy_logs.clear()
            energy_logs.extend(stored_logs)



@app.get("/")
def root():
    return {"message": "EcoVolt Brain API is Online", "backend": "fastapi"}


@app.get("/status")
def get_status():
    return latest_state


@app.get("/api/rooms")
def list_rooms():
    return list(room_states.values())


@app.get("/api/rooms/{room_id}")
def get_room(room_id: str):
    room = room_states.get(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@app.put("/api/rooms/{room_id}/config")
def update_room_config(room_id: str, config: ConfigUpdateRequest):
    if room_id not in room_states:
        raise HTTPException(status_code=404, detail="Room not found")
    room_config.update(config.model_dump(exclude_none=True))
    return room_config


@app.get("/api/devices")
def list_devices():
    return list(device_states.values())


@app.post("/api/devices/{device_id}/toggle")
def toggle_device(device_id: str):
    device = device_states.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device["is_on"] = not device["is_on"]
    if repo.available:
        repo.upsert_devices(list(device_states.values()))
    return device


@app.get("/api/energy/logs")
def get_logs():
    return energy_logs


@app.get("/api/energy/stats")
def get_stats():
    rooms = list(room_states.values())
    waste_rooms = [room for room in rooms if room.get("waste_detected")]
    return {
        "total_rooms": len(rooms),
        "waste_rooms": len(waste_rooms),
        "total_people": sum(room.get("person_count", 0) for room in rooms),
        "monthly_projection_inr": latest_state["savings_metrics"]["predicted_monthly_inr"],
        "weekly_projection_inr": latest_state["savings_metrics"]["predicted_weekly_inr"],
    }


@app.get("/api/energy/savings")
def get_savings():
    return latest_state["savings_metrics"]


@app.post("/api/cv/ghost-frame", response_model=GhostFrameResponse)
async def process_ghost_frame(payload: GhostFrameRequest):
    started_at = time.time()
    room_id = payload.room_id or "room-101"
    frame = decode_frame(payload.image_b64)

    person_count, fan_count, light_count, detections = detect_objects(frame)
    appliance_active, env_details = env_detector.detect(frame)
    detector = room_detectors[room_id]
    waste_detected = detector.update(person_count, appliance_active or light_count > 0 or fan_count > 0)
    predictor = room_predictors[room_id]
    savings_metrics = predictor.update_savings(waste_detected, fan_count, light_count)

    blurred = draw_boundaries_and_anonymize(frame.copy(), detections)
    latency_ms = int((time.time() - started_at) * 1000)
    image_b64 = encode_frame(blurred)

    state = {
        "room_id": room_id,
        "people_count": person_count,
        "fan_count": fan_count,
        "light_count": light_count,
        "occupied": person_count > 0,
        "lights_on": env_details["lights_on"] or (light_count > 0),
        "screens_on": env_details["screens_on"],
        "waste_detected": waste_detected,
        "brightness": env_details["brightness_level"],
        "latency_ms": latency_ms,
        "savings_metrics": savings_metrics,
    }
    latest_state.update(state)

    ghost_payload = {
        **state,
        "image_b64": image_b64,
        "timestamp": payload.timestamp or int(time.time() * 1000),
    }
    
    room_payload = build_room_payload(room_id, state)
    persist_event(room_payload, ghost_payload)
    await publish_updates(room_payload, ghost_payload)
    return ghost_payload


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json(
            {
                "type": "snapshot",
                "payload": {
                    "rooms": list(room_states.values()),
                    "devices": list(device_states.values()),
                },
            }
        )
        while True:
            await asyncio.sleep(1)
            await websocket.send_json(latest_state)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
