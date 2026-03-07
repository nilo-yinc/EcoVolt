# main.py
import cv2
import threading
import uvicorn
import time

from app.cv.camera import get_camera
from app.cv.detector import detect_objects
from app.cv.privacy import draw_boundaries_and_anonymize
from app.cv.appliance import EnvironmentDetector
from app.logic.engine import WasteDetector
from app.api.state import latest_state
from app.mqtt.client import IoTCommunicator
from app.logic.predictor import SavingsPredictor 

def run_vision_loop():
    print("🎥 Starting Vision Core...")
    cap = get_camera()
    env_detector = EnvironmentDetector()
    logic_engine = WasteDetector(delay_seconds=5)
    iot = IoTCommunicator()
    appliance_memory_frames = 0 

    savings_model = SavingsPredictor() 

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Mirror view for natural interaction
        frame = cv2.flip(frame, 1)
        person_count, fan_count, light_count, detections = detect_objects(frame)
        appliance_active, env_details = env_detector.detect(frame)

        # --- ANTI-FLICKER LOGIC ---
        raw_appliance_seen = appliance_active or (light_count > 0) or (fan_count > 0)
        if raw_appliance_seen:
            appliance_memory_frames = 45 

        if appliance_memory_frames > 0:
            combined_appliance_active = True
            appliance_memory_frames -= 1
        else:
            combined_appliance_active = False

        # Logic Engine: Evaluate if this is actual waste (empty room + appliances on)
        waste_detected = logic_engine.update(person_count, combined_appliance_active)

        # Hardware trigger: Alert the ESP32 if the state changed
        iot.control_appliances(room_id="room_101", waste_detected=waste_detected)

        financial_projections = savings_model.update_savings(waste_detected, fan_count, light_count)

        latest_state.update({
            "people_count": person_count,
            "fan_count": fan_count,
            "light_count": light_count, 
            "occupied": person_count > 0,
            "lights_on": env_details["lights_on"] or (light_count > 0),
            "screens_on": env_details["screens_on"],
            "waste_detected": waste_detected,
            "brightness": env_details["brightness_level"],
            "savings_metrics": financial_projections
        })

        # --- DYNAMIC VISUALIZATION ---
        display_frame = draw_boundaries_and_anonymize(frame.copy(), detections)
       
        overlay = display_frame.copy()
        cv2.rectangle(overlay, (0, 0), (frame.shape[1], 80), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.6, display_frame, 0.4, 0, display_frame)

        # 2. Status Text (Red if waste, Green if secure)
        status_text = "STATUS: WASTE DETECTED" if waste_detected else "STATUS: SYSTEM SECURE"
        status_color = (0, 0, 255) if waste_detected else (0, 255, 0)
        
        cv2.putText(display_frame, status_text, (15, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2, cv2.LINE_AA)
        
        # 3. Info Line (Occupancy and Hardware status)
        sensor_status = "ON" if env_details['lights_on'] else "OFF"
        info_text = f"Occupants: {person_count} | AI Lights: {light_count} | ROI Sensor: {sensor_status}"
        
        cv2.putText(display_frame, info_text, (15, 65), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

        # 4. Branding Corner (Optional)
        cv2.putText(display_frame, "EcoVolt", (frame.shape[1]-140, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1, cv2.LINE_AA)

        cv2.imshow("Watt-Watch | YOLO26 Core", display_frame)

        if cv2.waitKey(1) == 27: # ESC to exit
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    cv_thread = threading.Thread(target=run_vision_loop, daemon=True)
    cv_thread.start()
    print("🌐 Starting API Server on http://0.0.0.0:8000...")
    uvicorn.run("app.api.server:app", host="0.0.0.0", port=8000, reload=False)