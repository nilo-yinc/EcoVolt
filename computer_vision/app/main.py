# main.py
import cv2
import threading
import uvicorn
import time

from app.config import HARDWARE_DETECTION_INTERVAL
from app.cv.camera import get_camera
from app.cv.detector import detect_objects
from app.cv.privacy import draw_boundaries_and_anonymize
from app.cv.appliance import EnvironmentDetector
from app.logic.engine import WasteDetector
from app.api.state import latest_state 
from app.mqtt.client import IoTCommunicator
from app.logic.predictor import SavingsPredictor 

def draw_status_overlay(display_frame, status):
    overlay = display_frame.copy()
    cv2.rectangle(overlay, (0, 0), (display_frame.shape[1], 80), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, display_frame, 0.4, 0, display_frame)

    status_text = "STATUS: WASTE DETECTED" if status["waste_detected"] else "STATUS: SYSTEM SECURE"
    status_color = (0, 0, 255) if status["waste_detected"] else (0, 255, 0)
    cv2.putText(display_frame, status_text, (15, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2, cv2.LINE_AA)

    sensor_status = "ON" if status["lights_on"] else "OFF"
    info_text = f"Occupants: {status['people_count']} | AI Lights: {status['light_count']} | ROI Sensor: {sensor_status}"
    cv2.putText(display_frame, info_text, (15, 65),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(display_frame, "EcoVolt", (display_frame.shape[1] - 140, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1, cv2.LINE_AA)
    return display_frame


def run_inference_loop(cap, shared_state, state_lock, stop_event):
    env_detector = EnvironmentDetector()
    logic_engine = WasteDetector(delay_seconds=5)
    iot = IoTCommunicator()
    appliance_memory_frames = 0
    savings_model = SavingsPredictor()
    last_fan_count = 0
    last_light_count = 0
    cycle = 0

    while not stop_event.is_set():
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.005)
            continue

        frame = cv2.flip(frame, 1)
        run_hardware = cycle % HARDWARE_DETECTION_INTERVAL == 0
        person_count, fan_count, light_count, detections = detect_objects(frame, run_hardware=run_hardware)

        if run_hardware:
            last_fan_count = fan_count
            last_light_count = light_count
        else:
            fan_count = last_fan_count
            light_count = last_light_count

        appliance_active, env_details = env_detector.detect(frame)

        raw_appliance_seen = appliance_active or (light_count > 0) or (fan_count > 0)
        if raw_appliance_seen:
            appliance_memory_frames = 45

        if appliance_memory_frames > 0:
            combined_appliance_active = True
            appliance_memory_frames -= 1
        else:
            combined_appliance_active = False

        waste_detected = logic_engine.update(person_count, combined_appliance_active)
        iot.control_appliances(room_id="room_101", waste_detected=waste_detected)
        financial_projections = savings_model.update_savings(waste_detected, fan_count, light_count)

        status = {
            "people_count": person_count,
            "fan_count": fan_count,
            "light_count": light_count,
            "occupied": person_count > 0,
            "lights_on": env_details["lights_on"] or (light_count > 0),
            "screens_on": env_details["screens_on"],
            "waste_detected": waste_detected,
            "brightness": env_details["brightness_level"],
            "savings_metrics": financial_projections,
        }
        latest_state.update(status)
        with state_lock:
            shared_state["detections"] = detections
            shared_state["status"] = status
        cycle += 1


def run_vision_loop():
    print("🎥 Starting Vision Core...")
    cap = get_camera()
    state_lock = threading.Lock()
    stop_event = threading.Event()
    shared_state = {
        "detections": [],
        "status": {
            "people_count": 0,
            "light_count": 0,
            "lights_on": False,
            "waste_detected": False,
        },
    }
    inference_thread = threading.Thread(
        target=run_inference_loop,
        args=(cap, shared_state, state_lock, stop_event),
        daemon=True,
    )
    inference_thread.start()

    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.005)
            continue

        frame = cv2.flip(frame, 1)
        with state_lock:
            detections = list(shared_state["detections"])
            status = dict(shared_state["status"])
        display_frame = draw_boundaries_and_anonymize(frame, detections)
        display_frame = draw_status_overlay(display_frame, status)
        cv2.imshow("YOLO26 Core", display_frame)

        if cv2.waitKey(1) == 27: # ESC to exit
            stop_event.set()
            break

    cap.release()
    inference_thread.join(timeout=1.0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    cv_thread = threading.Thread(target=run_vision_loop, daemon=True)
    cv_thread.start()
    print("🌐 Starting API Server on http://0.0.0.0:8000...")
    uvicorn.run("app.api.server:app", host="0.0.0.0", port=8000, reload=False)
