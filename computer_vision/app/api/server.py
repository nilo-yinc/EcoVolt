# app/api/server.py
import base64
import os
import re
import secrets
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

from app.api.schemas import DummyLoginRequest, DummyLoginResponse, DummyUserProfile, Esp32IpConfig
from app.api.state import latest_ghost_frame, latest_state

app = FastAPI(title="Watt-Watch Brain API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_dummy_auth_user():
    try:
        users_col, _ = _get_auth_collections()
        if users_col is not None:
            _ensure_demo_user(users_col)
    except Exception:
        # Startup must not fail if Mongo is temporarily unavailable.
        pass

_mongo_client: Optional[MongoClient] = None
_esp_collection = None
_auth_users_collection = None
_auth_sessions_collection = None
_IPV4_RE = re.compile(r"^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$")


def _demo_auth_config():
    return {
        "email": os.getenv("DUMMY_AUTH_EMAIL", "admin@ecovolt.demo").strip().lower(),
        "password": os.getenv("DUMMY_AUTH_PASSWORD", "EcoVolt@123").strip(),
        "role": os.getenv("DUMMY_AUTH_ROLE", "admin").strip() or "admin",
        "display_name": os.getenv("DUMMY_AUTH_NAME", "EcoVolt Admin").strip() or "EcoVolt Admin",
    }


def _get_esp_collection():
    global _mongo_client, _esp_collection
    if _esp_collection is not None:
        return _esp_collection

    mongo_url = os.getenv("MONGODB_URL", "").strip()
    if not mongo_url:
        return None

    try:
        if _mongo_client is None:
            _mongo_client = MongoClient(mongo_url, serverSelectionTimeoutMS=3000)
        db_name = os.getenv("MONGODB_DB", "ecovolt")
        _esp_collection = _mongo_client[db_name]["settings"]
        return _esp_collection
    except Exception:
        return None


def _get_auth_collections():
    global _mongo_client, _auth_users_collection, _auth_sessions_collection
    if _auth_users_collection is not None and _auth_sessions_collection is not None:
        return _auth_users_collection, _auth_sessions_collection

    mongo_url = os.getenv("MONGODB_URL", "").strip()
    if not mongo_url:
        return None, None

    try:
        if _mongo_client is None:
            _mongo_client = MongoClient(mongo_url, serverSelectionTimeoutMS=3000)
        db_name = os.getenv("MONGODB_DB", "ecovolt")
        db = _mongo_client[db_name]
        _auth_users_collection = db["auth_users"]
        _auth_sessions_collection = db["auth_sessions"]
        return _auth_users_collection, _auth_sessions_collection
    except Exception:
        return None, None


def _ensure_demo_user(users_col):
    if users_col is None:
        return None
    demo = _demo_auth_config()
    now = datetime.now(timezone.utc)
    users_col.update_one(
        {"email": demo["email"]},
        {
            "$set": {
                "email": demo["email"],
                "password": demo["password"],
                "role": demo["role"],
                "display_name": demo["display_name"],
                "is_demo": True,
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )
    return users_col.find_one({"email": demo["email"]})


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


def _resolve_esp_ip(ip_override: str = "") -> str:
    ip = (ip_override or "").strip()
    if ip:
        return ip
    return _read_esp_ip()


def _esp_http_get_json(path: str, ip_override: str = "", timeout: float = 2.5):
    ip = _resolve_esp_ip(ip_override)
    if not ip:
        return None, "ESP32 IP not configured"
    url = f"http://{ip}{path}"
    try:
        with urllib.request.urlopen(url, timeout=timeout) as res:
            body = res.read().decode("utf-8", errors="ignore")
        try:
            import json
            return json.loads(body or "{}"), ""
        except Exception:
            return {"raw": body}, ""
    except urllib.error.URLError as ex:
        return None, str(ex)
    except Exception as ex:
        return None, str(ex)


def _esp_http_get_text(path: str, ip_override: str = "", timeout: float = 2.5):
    ip = _resolve_esp_ip(ip_override)
    if not ip:
        return None, "ESP32 IP not configured"
    url = f"http://{ip}{path}"
    try:
        with urllib.request.urlopen(url, timeout=timeout) as res:
            body = res.read().decode("utf-8", errors="ignore")
        return body, ""
    except urllib.error.URLError as ex:
        return None, str(ex)
    except Exception as ex:
        return None, str(ex)

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


@app.post("/auth/login", response_model=DummyLoginResponse)
@app.post("/api/auth/login", response_model=DummyLoginResponse)
def auth_login(payload: DummyLoginRequest):
    email = payload.email.strip().lower()
    token = secrets.token_urlsafe(32)
    users_col, sessions_col = _get_auth_collections()
    now = datetime.now(timezone.utc)
    demo = _demo_auth_config()

    if users_col is not None:
        _ensure_demo_user(users_col)
        user_doc = users_col.find_one({"email": email})
        if not user_doc or str(user_doc.get("password", "")) != payload.password:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        role = str(user_doc.get("role", demo["role"]))
        display_name = str(user_doc.get("display_name", demo["display_name"]))
    else:
        if email != demo["email"] or payload.password != demo["password"]:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        role = demo["role"]
        display_name = demo["display_name"]

    if users_col is not None and sessions_col is not None:
        sessions_col.insert_one(
            {
                "email": email,
                "token": token,
                "created_at": now,
                "source": "frontend_dummy_auth",
            }
        )

    return DummyLoginResponse(
        ok=True,
        token=token,
        user=DummyUserProfile(email=email, role=role, display_name=display_name),
    )


@app.get("/esp/status")
def esp_status(ip: str = ""):
    data, err = _esp_http_get_json("/status", ip_override=ip)
    if data is None:
        return Response(status_code=502, content=f"ESP unreachable: {err}")
    return data


@app.get("/esp/status1")
def esp_status_compat(ip: str = ""):
    # Compatibility with firmware variants that expose /status1.
    data, err = _esp_http_get_json("/status1", ip_override=ip)
    if data is None:
        return Response(status_code=502, content=f"ESP unreachable: {err}")
    return data


@app.get("/esp/led/{action}")
def esp_led_action(action: str, ip: str = ""):
    if action not in {"on", "off", "toggle"}:
        return Response(status_code=400, content="Invalid LED action")
    text, err = _esp_http_get_text(f"/led/{action}", ip_override=ip)
    if text is None:
        return Response(status_code=502, content=f"ESP unreachable: {err}")
    return {"ok": True, "message": text}


@app.get("/esp/fan/{action}")
def esp_fan_action(action: str, ip: str = ""):
    if action not in {"on", "off", "toggle"}:
        return Response(status_code=400, content="Invalid fan action")
    text, err = _esp_http_get_text(f"/fan/{action}", ip_override=ip)
    if text is None:
        return Response(status_code=502, content=f"ESP unreachable: {err}")
    return {"ok": True, "message": text}
