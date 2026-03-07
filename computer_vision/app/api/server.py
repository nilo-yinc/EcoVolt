# app/api/server.py
import base64
import os
import re
from typing import Optional

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

from app.api.schemas import Esp32IpConfig
from app.api.state import latest_ghost_frame, latest_state

app = FastAPI(title="Watt-Watch Brain API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_mongo_client: Optional[MongoClient] = None
_esp_collection = None
_IPV4_RE = re.compile(r"^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$")


def _get_esp_collection():
    global _mongo_client, _esp_collection
    if _esp_collection is not None:
        return _esp_collection

    mongo_url = os.getenv("MONGODB_URL", "").strip()
    if not mongo_url:
        return None

    try:
        _mongo_client = MongoClient(mongo_url, serverSelectionTimeoutMS=3000)
        db_name = os.getenv("MONGODB_DB", "ecovolt")
        _esp_collection = _mongo_client[db_name]["settings"]
        return _esp_collection
    except Exception:
        return None


def _read_esp_ip() -> str:
    col = _get_esp_collection()
    if col is None:
        return ""
    doc = col.find_one({"key": "esp32_ip"})
    if not doc:
        return ""
    return str(doc.get("value", "")).strip()


def _write_esp_ip(ip_address: str) -> bool:
    col = _get_esp_collection()
    if col is None:
        return False
    col.update_one(
        {"key": "esp32_ip"},
        {"$set": {"value": ip_address.strip()}},
        upsert=True,
    )
    return True


def _clear_esp_ip() -> bool:
    col = _get_esp_collection()
    if col is None:
        return False
    col.delete_one({"key": "esp32_ip"})
    return True

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


@app.get("/config/esp32-ip")
def get_esp32_ip():
    return {"ip_address": _read_esp_ip()}


@app.put("/config/esp32-ip")
def set_esp32_ip(payload: Esp32IpConfig):
    ip = payload.ip_address.strip()
    if ip and not _IPV4_RE.match(ip):
        return Response(status_code=400, content="Invalid IPv4 address")

    ok = _write_esp_ip(ip)
    if not ok:
        return Response(status_code=503, content="MongoDB unavailable")
    return {"ip_address": ip, "saved": True}


@app.delete("/config/esp32-ip")
def reset_esp32_ip():
    ok = _clear_esp_ip()
    if not ok:
        return Response(status_code=503, content="MongoDB unavailable")
    return {"ip_address": "", "saved": True}
