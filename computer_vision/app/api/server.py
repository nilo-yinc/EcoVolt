# app/api/server.py
import base64

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.state import latest_ghost_frame, latest_state

app = FastAPI(title="Watt-Watch Brain API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Watt-Watch AI Module is Online"}


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/status")
def get_status():
    ## For frontend dashboard
    return latest_state


@app.get("/ghost/status")
def get_ghost_status():
    return {
        "ready": bool(latest_ghost_frame.get("image_b64")),
        "state": latest_state,
        "timestamp": latest_state.get("timestamp", 0),
    }


@app.get("/ghost/frame")
def get_ghost_frame():
    return latest_ghost_frame


@app.get("/ghost/latest.jpg")
def get_ghost_latest_jpg():
    image_b64 = latest_ghost_frame.get("image_b64", "")
    if not image_b64:
        return Response(status_code=204)

    try:
        image_bytes = base64.b64decode(image_b64)
        return Response(
            content=image_bytes,
            media_type="image/jpeg",
            headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"},
        )
    except Exception:
        return Response(status_code=500)
