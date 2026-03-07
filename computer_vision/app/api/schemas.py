from pydantic import BaseModel, Field

class StatusResponse(BaseModel):
    people: int
    faces: int
    occupied: bool
    appliance_on: bool
    waste_detected: bool
    brightness: int
    latency: float

class MetricsResponse(BaseModel):
    precision: float
    recall: float
    f1_score: float
    false_trigger_rate: float


class Esp32IpConfig(BaseModel):
    ip_address: str = Field(default="", description="ESP32 IPv4 address on local network")
