import base64
import os
import threading
import time

import cv2
import numpy as np
import uvicorn

from app.api.state import latest_ghost_frame, latest_state
from app.cv.appliance import EnvironmentDetector
from app.cv.camera import get_camera
from app.cv.detector import detect_objects
from app.cv.privacy import draw_boundaries_and_anonymize
from app.logic.engine import WasteDetector
from app.logic.predictor import SavingsPredictor
from app.mqtt.client import IoTCommunicator


_ENV_DETECTOR = EnvironmentDetector()
_LOGIC_ENGINE = WasteDetector(delay_seconds=5)
_IOT = IoTCommunicator()
_SAVINGS_MODEL = SavingsPredictor()
_APPLIANCE_MEMORY_FRAMES = 0


def _encode_frame(frame):
    ok, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
    if not ok:
        return ""
    return base64.b64encode(buffer.tobytes()).decode("ascii")


def _decode_frame(image_b64):
    try:
        image_bytes = base64.b64decode(image_b64)
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)
    except Exception:
        return None


def process_frame(frame, room_id="test-room"):
    global _APPLIANCE_MEMORY_FRAMES

    loop_start = time.time()
    person_count, fan_count, light_count, detections = detect_objects(frame)
    appliance_active, env_details = _ENV_DETECTOR.detect(frame)

    raw_appliance_seen = appliance_active or (light_count > 0) or (fan_count > 0)
    if raw_appliance_seen:
        _APPLIANCE_MEMORY_FRAMES = 45

    if _APPLIANCE_MEMORY_FRAMES > 0:
        combined_appliance_active = True
        _APPLIANCE_MEMORY_FRAMES -= 1
    else:
        combined_appliance_active = False

    waste_detected = _LOGIC_ENGINE.update(person_count, combined_appliance_active)
    iot_action = _IOT.control_appliances(room_id="room_101", waste_detected=waste_detected) or {}
    financial_projections = _SAVINGS_MODEL.update_savings(waste_detected, fan_count, light_count)

    display_frame = draw_boundaries_and_anonymize(frame.copy(), detections)
    overlay = display_frame.copy()
    cv2.rectangle(overlay, (0, 0), (frame.shape[1], 80), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, display_frame, 0.4, 0, display_frame)

    status_text = "STATUS: WASTE DETECTED" if waste_detected else "STATUS: SYSTEM SECURE"
    status_color = (0, 0, 255) if waste_detected else (0, 255, 0)
    cv2.putText(display_frame, status_text, (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2, cv2.LINE_AA)

    sensor_status = "ON" if env_details["lights_on"] else "OFF"
    info_text = f"Occupants: {person_count} | AI Lights: {light_count} | ROI Sensor: {sensor_status}"
    cv2.putText(display_frame, info_text, (15, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(display_frame, "EcoVolt", (frame.shape[1] - 140, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1, cv2.LINE_AA)

    timestamp_ms = int(time.time() * 1000)
    latency_ms = int((time.time() - loop_start) * 1000)
    latest_state.update(
        {
            "people_count": person_count,
            "fan_count": fan_count,
            "light_count": light_count,
            "occupied": person_count > 0,
            "lights_on": env_details["lights_on"] or (light_count > 0),
            "screens_on": env_details["screens_on"],
            "waste_detected": waste_detected,
            "brightness": env_details["brightness_level"],
            "savings_metrics": financial_projections,
            "room_id": room_id,
            "timestamp": timestamp_ms,
            "iot_auto_command": iot_action.get("command", ""),
            "iot_auto_sent": bool(iot_action.get("sent", False)),
            "iot_auto_transport": iot_action.get("transport", ""),
            "iot_auto_reason": iot_action.get("reason", ""),
            "iot_auto_error": iot_action.get("error", ""),
        }
    )
    latest_ghost_frame.update(
        {
            "room_id": room_id,
            "image_b64": _encode_frame(display_frame),
            "person_count": person_count,
            "fan_count": fan_count,
            "light_count": light_count,
            "waste_detected": waste_detected,
            "brightness": env_details["brightness_level"],
            "latency_ms": latency_ms,
            "timestamp": timestamp_ms,
            "iot_auto_command": iot_action.get("command", ""),
            "iot_auto_sent": bool(iot_action.get("sent", False)),
            "iot_auto_transport": iot_action.get("transport", ""),
            "iot_auto_reason": iot_action.get("reason", ""),
            "iot_auto_error": iot_action.get("error", ""),
        }
    )
    return display_frame


def run_vision_loop(show_window=False):
    print("Starting Vision Core...")
    cap = get_camera()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.05)
                continue

            frame = cv2.flip(frame, 1)
            display_frame = process_frame(frame, room_id="test-room")

            if show_window:
                cv2.imshow("YOLO26 Core", display_frame)
                if cv2.waitKey(1) == 27:
                    break
    finally:
        cap.release()
        if show_window:
            cv2.destroyAllWindows()


def main():
    show_window = os.getenv("CV_SHOW_WINDOW", "1") == "1"
    run_vision_loop(show_window=show_window)


if __name__ == "__main__":
    cv_thread = threading.Thread(target=main, daemon=True)
    cv_thread.start()
    print("Starting API Server on http://0.0.0.0:8000 ...")
    uvicorn.run("app.api.server:app", host="0.0.0.0", port=8000, reload=False)
