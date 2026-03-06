import cv2

def draw_boundaries_and_anonymize(frame, detections):

    ## Drawing boxes and applying gaussian blur for privacy
    height, width = frame.shape[:2]
    for det in detections:
        x1, y1, x2, y2 = det["box"]
        label = det["label"].upper()
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(width, x2), min(height, y2)

        box_color = (0, 255, 0) if label == "PERSON" else (0, 165, 255)  # Green (0, 255, 0) for People | Orange (0, 165, 255) for Fans/Lights

        # 1. Apply Privacy Blur IF it is a person
        if label == "PERSON":
            roi = frame[y1:y2, x1:x2]
            if roi.size > 0:
                k_width = (x2 - x1) // 3 | 1
                k_height = (y2 - y1) // 3 | 1
                blurred = cv2.GaussianBlur(roi, (k_width, k_height), 30)
                frame[y1:y2, x1:x2] = blurred
                
        # 2. Drawing the Boundary Box 
        cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
        text_y = max(20, y1 - 10) 
        text = f"{label} {det['confidence']:.2f}"
        cv2.putText(frame, text, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 1)

    return frame