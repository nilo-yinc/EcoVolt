# app/cv/appliance.py
import cv2
import numpy as np

class EnvironmentDetector:  
    def __init__(self, light_threshold=220, screen_area_min=1000):
        # Pixel threshold - (0-255)
        self.light_threshold = light_threshold
        self.screen_area_min = screen_area_min

    def detect(self, frame):
        height, width = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 1. CEILING LIGHT DETECTION
        roi_ceiling = gray[0:int(height * 0.3), :]        
        _, light_thresh = cv2.threshold(roi_ceiling, self.light_threshold, 255, cv2.THRESH_BINARY)
        bright_pixels_count = cv2.countNonZero(light_thresh)
        lights_on = bright_pixels_count > 500

        # 2. ACTIVE SCREEN / PROJECTOR DETECTION
        roi_room = gray[int(height * 0.3):, :] 
        _, screen_thresh = cv2.threshold(roi_room, 200, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(screen_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        screens_on = False
        screen_boxes = [] 
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > self.screen_area_min:
                peri = cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)

                if len(approx) >= 4:
                    screens_on = True
                    x, y, w, h = cv2.boundingRect(approx)
                    screen_boxes.append((x, y + int(height * 0.3), w, h))

        appliance_active = lights_on or screens_on

        details = {
            "lights_on": lights_on,
            "screens_on": screens_on,
            "brightness_level": int(gray.mean()),
            "screen_boxes": screen_boxes 
        }

        return appliance_active, details