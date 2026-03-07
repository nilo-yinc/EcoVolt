# app/cv/camera.py
import threading

import cv2

from app.config import CAMERA_BUFFER_SIZE, CAMERA_SOURCE, FRAME_HEIGHT, FRAME_WIDTH


class LatestFrameCamera:
    """Reads frames continuously so consumers can always fetch the newest image."""

    def __init__(self, source):
        self.cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
        if not self.cap.isOpened():
            self.cap = cv2.VideoCapture(source)

        if not self.cap.isOpened():
            raise RuntimeError(f"Could not open camera source {source}. Check connection.")

        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, CAMERA_BUFFER_SIZE)
        self.cap.set(cv2.CAP_PROP_FPS, 30)

        self._running = True
        self._frame = None
        self._lock = threading.Lock()
        self._thread = threading.Thread(target=self._reader, daemon=True)
        self._thread.start()

    def _reader(self):
        while self._running:
            ok, frame = self.cap.read()
            if not ok:
                continue
            with self._lock:
                self._frame = frame

    def read(self):
        with self._lock:
            if self._frame is None:
                return False, None
            return True, self._frame.copy()

    def release(self):
        self._running = False
        self._thread.join(timeout=1.0)
        self.cap.release()

def get_camera():
    """Initializes and returns the camera stream."""
    return LatestFrameCamera(CAMERA_SOURCE)
