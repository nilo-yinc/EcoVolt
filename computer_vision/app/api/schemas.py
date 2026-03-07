from typing import Optional
from pydantic import BaseModel

class ConfigUpdateRequest(BaseModel):
    empty_timeout: Optional[int] = None
    waste_confirmation: Optional[int] = None
    confidence_threshold: Optional[float] = None
    process_fps: Optional[int] = None

class GhostFrameRequest(BaseModel):
    image_b64: str
    room_id: Optional[str] = "room-101"
    timestamp: Optional[int] = None

class GhostFrameResponse(BaseModel):
    room_id: str
    people_count: int
    fan_count: int
    light_count: int
    occupied: bool
    lights_on: bool
    screens_on: bool
    waste_detected: bool
    brightness: int
    latency_ms: int
    image_b64: str
    timestamp: int
    savings_metrics: dict
