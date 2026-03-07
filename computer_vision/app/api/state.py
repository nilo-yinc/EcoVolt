# app/api/state.py
import time

def get_rooms():
    return [
        {
            "id": "test-room",
            "name": "Test Room T-001",
            "location": "Test Block",
            "status": "secure",
            "person_count": 0,
            "camera_source": "CCTV-Test",
            "appliances": {"projector": False, "monitors": False, "lights": False, "fan": False, "ac": False},
            "waste_detected": False,
            "waste_duration": 0,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 0, "predicted_weekly_inr": 0, "predicted_monthly_inr": 0, "co2_prevented_kg": 0}
        },
        {
            "id": "r1",
            "name": "Lecture Hall A-101",
            "location": "Block A",
            "status": "secure",
            "person_count": 42,
            "camera_source": "CCTV-A101",
            "appliances": {"projector": True, "monitors": False, "lights": True, "fan": True, "ac": True},
            "waste_detected": False,
            "waste_duration": 0,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 0, "predicted_weekly_inr": 0, "predicted_monthly_inr": 0, "co2_prevented_kg": 0}
        },
        {
            "id": "r2",
            "name": "Seminar Room A-202",
            "location": "Block A",
            "status": "waste",
            "person_count": 0,
            "camera_source": "CCTV-A202",
            "appliances": {"projector": True, "monitors": False, "lights": True, "fan": True, "ac": True},
            "waste_detected": True,
            "waste_duration": 2700,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 16.8, "predicted_weekly_inr": 117.6, "predicted_monthly_inr": 504.0, "co2_prevented_kg": 0.4}
        },
        {
            "id": "r3",
            "name": "Computer Lab B-204",
            "location": "Block B",
            "status": "waste",
            "person_count": 3,
            "camera_source": "CCTV-B204",
            "appliances": {"projector": False, "monitors": True, "lights": True, "fan": True, "ac": True},
            "waste_detected": True,
            "waste_duration": 4800,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 67.2, "predicted_weekly_inr": 470.4, "predicted_monthly_inr": 2016.0, "co2_prevented_kg": 1.8}
        },
        {
            "id": "r4",
            "name": "Physics Lab C-301",
            "location": "Block C",
            "status": "secure",
            "person_count": 25,
            "camera_source": "CCTV-C301",
            "appliances": {"projector": False, "monitors": False, "lights": True, "fan": True, "ac": True},
            "waste_detected": False,
            "waste_duration": 0,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 0, "predicted_weekly_inr": 0, "predicted_monthly_inr": 0, "co2_prevented_kg": 0}
        },
        {
            "id": "r5",
            "name": "Admin Office D-102",
            "location": "Block D",
            "status": "secure",
            "person_count": 5,
            "camera_source": "CCTV-D102",
            "appliances": {"projector": False, "monitors": True, "lights": True, "fan": True, "ac": True},
            "waste_detected": False,
            "waste_duration": 0,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 0, "predicted_weekly_inr": 0, "predicted_monthly_inr": 0, "co2_prevented_kg": 0}
        },
        {
            "id": "r6",
            "name": "Computer Lab B-106",
            "location": "Block B",
            "status": "recently_vacated",
            "person_count": 8,
            "camera_source": "CCTV-B106",
            "appliances": {"projector": False, "monitors": True, "lights": True, "fan": True, "ac": True},
            "waste_detected": False,
            "waste_duration": 0,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 0, "predicted_weekly_inr": 0, "predicted_monthly_inr": 0, "co2_prevented_kg": 0}
        },
        {
            "id": "r12",
            "name": "Computer Lab B-310",
            "location": "Block B",
            "status": "waste",
            "person_count": 0,
            "camera_source": "CCTV-B310",
            "appliances": {"projector": False, "monitors": True, "lights": True, "fan": True, "ac": True},
            "waste_detected": True,
            "waste_duration": 7800,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 89.6, "predicted_weekly_inr": 627.2, "predicted_monthly_inr": 2688.0, "co2_prevented_kg": 2.4}
        },
        {
            "id": "r10",
            "name": "Lecture Hall A-303",
            "location": "Block A",
            "status": "secure",
            "person_count": 55,
            "camera_source": "CCTV-A303",
            "appliances": {"projector": True, "monitors": False, "lights": True, "fan": True, "ac": True},
            "waste_detected": False,
            "waste_duration": 0,
            "last_updated": int(time.time() * 1000),
            "savings_metrics": {"actual_saved_inr": 0, "predicted_weekly_inr": 0, "predicted_monthly_inr": 0, "co2_prevented_kg": 0}
        }
    ]


def get_devices():
    return [
        {"id": "d1", "room_id": "room-101", "name": "Ceiling Lights", "type": "light", "is_on": False, "power_watts": 120, "controllable": True},
        {"id": "d2", "room_id": "room-101", "name": "Projector", "type": "projector", "is_on": False, "power_watts": 300, "controllable": True},
        {"id": "d3", "room_id": "room-102", "name": "Lab Monitors (x12)", "type": "monitor", "is_on": True, "power_watts": 600, "controllable": True},
        {"id": "d4", "room_id": "room-102", "name": "Projector", "type": "projector", "is_on": True, "power_watts": 300, "controllable": True},
        {"id": "d5", "room_id": "room-102", "name": "Ceiling Lights", "type": "light", "is_on": True, "power_watts": 120, "controllable": False},
        {"id": "d6", "room_id": "room-103", "name": "Tube Lights", "type": "light", "is_on": True, "power_watts": 80, "controllable": True},
        {"id": "d7", "room_id": "room-201", "name": "Ceiling Lights", "type": "light", "is_on": True, "power_watts": 150, "controllable": True},
    ]

latest_state = {
    "room_id": "room-101",
    "people_count": 0,
    "fan_count": 0,
    "light_count": 0,
    "occupied": False,
    "lights_on": False,
    "screens_on": False,
    "waste_detected": False,
    "brightness": 0,
    "latency_ms": 0,
    "savings_metrics": {
        "actual_saved_inr": 0,
        "predicted_weekly_inr": 0,
        "predicted_monthly_inr": 0,
        "co2_prevented_kg": 0
    }
}

energy_logs = []
latest_ghost_frames = {}
room_config = {
    "empty_timeout": 30,
    "waste_confirmation": 60,
    "confidence_threshold": 0.5,
    "process_fps": 1,
}
