# app/api/state.py
latest_state = {
    "people_count": 0,
    "fan_count": 0,
    "light_count": 0,
    "occupied": False,
    "lights_on": False,
    "screens_on": False,
    "waste_detected": False,
    "brightness": 0,
    "room_id": "test-room",
    "timestamp": 0,
}

latest_ghost_frame = {
    "room_id": "test-room",
    "image_b64": "",
    "person_count": 0,
    "fan_count": 0,
    "light_count": 0,
    "waste_detected": False,
    "brightness": 0,
    "latency_ms": 0,
    "timestamp": 0,
}
