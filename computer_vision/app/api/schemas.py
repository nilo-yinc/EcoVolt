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


class DummyLoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=128)


class DummyUserProfile(BaseModel):
    email: str
    role: str = "admin"
    display_name: str = "EcoVolt Admin"


class DummyLoginResponse(BaseModel):
    ok: bool = True
    token: str
    user: DummyUserProfile
