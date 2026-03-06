# app/cv/detector.py
from ultralytics import YOLO
from app.config import CONFIDENCE_THRESHOLD

person_model = YOLO("yoloe-26l-seg.pt")  ## Using YoloE for better person detection
person_model.set_classes(["person"])
hardware_model = YOLO("fan_light_model.pt") ## Custom trained model for fans and lights detection

def detect_objects(frame):
    person_count = 0
    fan_count = 0
    light_count = 0
    detections = [] 

    ## Detecting People
    person_results = person_model(frame, imgsz=640, verbose=False)
    for r in person_results:
        if r.boxes is not None:
            for box in r.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                if cls == 0 and conf > CONFIDENCE_THRESHOLD:
                    person_count += 1
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    detections.append({
                        "label": "PERSON",
                        "confidence": conf,
                        "box": [int(x1), int(y1), int(x2), int(y2)]
                    })

    ## Detecting Fans and Lights
    hardware_results = hardware_model(frame, imgsz=640, verbose=False)
    for r in hardware_results:
        if r.boxes is not None:
            for box in r.boxes:
                conf = float(box.conf[0])
                
                if conf > 0.25: 
                    cls_name = hardware_model.names[int(box.cls[0])].lower()
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    if "fan" in cls_name:
                        fan_count += 1
                        detections.append({
                            "label": "FAN",
                            "confidence": conf,
                            "box": [int(x1), int(y1), int(x2), int(y2)]
                        })
                    
                    elif "light" in cls_name:
                        light_count += 1

    return person_count, fan_count, light_count, detections