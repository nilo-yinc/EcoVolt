# app/cv/camera.py
import cv2
from app.config import CAMERA_SOURCE

def get_camera():
    """Initializes and returns the camera stream."""
    cap = cv2.VideoCapture(CAMERA_SOURCE)

    if not cap.isOpened():
        raise RuntimeError(f"Could not open camera source {CAMERA_SOURCE}. Check connection.")

    return cap