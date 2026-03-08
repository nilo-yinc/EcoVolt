import platform

import cv2

from app.config import CAMERA_SOURCE, FRAME_HEIGHT, FRAME_WIDTH


def _camera_backends():
    if platform.system() == "Windows":
        return [cv2.CAP_DSHOW, cv2.CAP_ANY]
    return [cv2.CAP_ANY]


def get_camera():
    """Initialize camera with a backend that is stable on the current OS."""
    last_error = None

    for backend in _camera_backends():
        try:
            cap = cv2.VideoCapture(CAMERA_SOURCE, backend)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if platform.system() == "Windows":
                cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
                cap.set(cv2.CAP_PROP_CONVERT_RGB, 1)

            if not cap.isOpened():
                cap.release()
                last_error = f"backend {backend} could not open source {CAMERA_SOURCE}"
                continue

            ok, _ = cap.read()
            if ok:
                print(f"Camera opened using backend {backend} and source {CAMERA_SOURCE}")
                return cap

            cap.release()
            last_error = f"backend {backend} opened source {CAMERA_SOURCE} but no frames arrived"
        except Exception as ex:
            last_error = str(ex)

    raise RuntimeError(f"Could not open camera source {CAMERA_SOURCE}. {last_error or ''}".strip())
