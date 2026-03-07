import os
import json
import urllib.error
import urllib.request
from time import time

import paho.mqtt.client as mqtt
from pymongo import MongoClient


class IoTCommunicator:
    """
    Sends automation commands from CV waste detection to IoT devices.

    Default behavior is safe mode: send OFF when waste is detected,
    do not auto-send ON when waste clears.
    """

    def __init__(self, broker="localhost", port=1883):
        self.broker = broker
        self.port = port
        self.last_state = None
        self.auto_on_recovery = os.getenv("AUTO_TURN_ON_WHEN_SAFE", "1").strip().lower() in {"1", "true", "yes", "on"}
        self.esp_timeout = float(os.getenv("ESP_HTTP_TIMEOUT_SEC", "1.5"))
        self._mongo = None
        self._esp_ip_cache = ""
        self._esp_ip_checked_at = 0.0
        self._esp_ip_ttl_sec = 5.0
        self._status_cache = {}
        self._status_checked_at = 0.0
        self._status_ttl_sec = 1.0
        self._mqtt_enabled = os.getenv("ENABLE_MQTT_AUTOMATION", "0").strip().lower() in {"1", "true", "yes", "on"}
        self.last_transport = "none"
        self.last_error = ""

        self.client = mqtt.Client()
        if self._mqtt_enabled:
            try:
                self.client.connect(self.broker, self.port)
                self.client.loop_start()
                print(f"✅ MQTT Connected at {self.broker}:{self.port}")
            except Exception as ex:
                print(f"🚨 MQTT connect failed: {ex}")
                self._mqtt_enabled = False
                self.last_error = f"mqtt_connect_failed:{ex}"

    def _get_esp_ip(self):
        now = time()
        if self._esp_ip_cache and (now - self._esp_ip_checked_at) < self._esp_ip_ttl_sec:
            return self._esp_ip_cache

        env_ip = os.getenv("ESP32_IP", "").strip()
        if env_ip:
            self._esp_ip_cache = env_ip
            self._esp_ip_checked_at = now
            return env_ip

        mongo_url = os.getenv("MONGODB_URL", "").strip()
        if not mongo_url:
            self._esp_ip_checked_at = now
            return ""

        try:
            if self._mongo is None:
                self._mongo = MongoClient(mongo_url, serverSelectionTimeoutMS=1500)
            db_name = os.getenv("MONGODB_DB", "ecovolt")
            doc = self._mongo[db_name]["settings"].find_one({"key": "esp32_ip"})
            ip = str((doc or {}).get("value", "")).strip()
            self._esp_ip_cache = ip
            self._esp_ip_checked_at = now
            return ip
        except Exception:
            self._esp_ip_checked_at = now
            return ""

    def _send_http(self, path):
        ip = self._get_esp_ip()
        if not ip:
            return False

        url = f"http://{ip}{path}"
        try:
            with urllib.request.urlopen(url, timeout=self.esp_timeout):
                self.last_transport = "http"
                self.last_error = ""
                return True
        except (urllib.error.URLError, TimeoutError, ValueError):
            self.last_error = f"http_failed:{url}"
            return False

    def _fetch_esp_status(self):
        ip = self._get_esp_ip()
        if not ip:
            return None
        now = time()
        if self._status_cache and (now - self._status_checked_at) < self._status_ttl_sec:
            return self._status_cache
        url = f"http://{ip}/status"
        try:
            with urllib.request.urlopen(url, timeout=self.esp_timeout) as res:
                payload = res.read().decode("utf-8", errors="ignore")
            data = json.loads(payload or "{}")
            self._status_cache = data
            self._status_checked_at = now
            return data
        except Exception:
            return None

    def _status_has_on_load(self):
        data = self._fetch_esp_status()
        if data is None:
            return None
        led = data.get("ledState", data.get("led", data.get("lightState", data.get("lights", False))))
        fan = data.get("fanState", data.get("fan", data.get("fan_status", False)))
        return bool(led) or bool(fan)

    def get_appliance_active_hint(self):
        load_on = self._status_has_on_load()
        return bool(load_on) if load_on is not None else False

    def _send_off_to_esp(self):
        if self._send_http("/led/off"):
            return True
        if self._send_http("/fan/off"):
            return True
        # Common fallback endpoint used by some firmware variants.
        if self._send_http("/all/off"):
            return True
        return False

    def _send_on_to_esp(self):
        if self._send_http("/led/on"):
            return True
        if self._send_http("/fan/on"):
            return True
        if self._send_http("/all/on"):
            return True
        return False

    def _send_mqtt(self, room_id, command):
        if not self._mqtt_enabled:
            return False
        try:
            topic = f"wattwatch/{room_id}/power/cmd"
            self.client.publish(topic, command)
            self.last_transport = "mqtt"
            self.last_error = ""
            return True
        except Exception:
            self.last_error = f"mqtt_publish_failed:{room_id}:{command}"
            return False

    def control_appliances(self, room_id, waste_detected):
        # Safe default: only auto-off on waste; do not auto-on unless explicitly enabled.
        target_state = "OFF" if waste_detected else ("ON" if self.auto_on_recovery else "SAFE")
        force_send = False

        if target_state == "SAFE":
            if self.last_state == "OFF":
                self.last_state = "SAFE"
            return {
                "command": "SAFE",
                "sent": False,
                "transport": self.last_transport,
                "reason": "waste_cleared_auto_on_disabled",
                "error": self.last_error,
            }

        if target_state == self.last_state:
            load_on = self._status_has_on_load()
            if target_state == "OFF":
                force_send = bool(load_on)
            elif target_state == "ON":
                force_send = (load_on is False)
            if not force_send:
                return {
                    "command": target_state,
                    "sent": False,
                    "transport": self.last_transport,
                    "reason": "duplicate_state",
                    "error": self.last_error,
                }

        if target_state == self.last_state and not force_send:
            return {
                "command": target_state,
                "sent": False,
                "transport": self.last_transport,
                "reason": "duplicate_state",
                "error": self.last_error,
            }

        if target_state == "OFF":
            sent = self._send_off_to_esp()
        else:
            sent = self._send_on_to_esp()

        # MQTT fallback path, if enabled.
        if not sent:
            sent = self._send_mqtt(room_id, target_state)

        if sent:
            print(f"⚡ IoT automation -> {target_state} (room={room_id})")
            self.last_state = target_state
            return {
                "command": target_state,
                "sent": True,
                "transport": self.last_transport,
                "reason": "waste_rule",
                "error": "",
            }

        return {
            "command": target_state,
            "sent": False,
            "transport": "none",
            "reason": "no_route",
            "error": self.last_error,
        }
