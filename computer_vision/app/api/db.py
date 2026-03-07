import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import DESCENDING, MongoClient
from pymongo.errors import PyMongoError


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class MongoRepository:
    def __init__(self):
        self.uri = os.getenv("MONGO_URI", "").strip()
        self.db_name = os.getenv("MONGO_DB_NAME", "watt_watch").strip() or "watt_watch"
        self.client = None
        self.db = None
        self.available = False

        if not self.uri:
            return

        try:
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=5000)
            self.client.admin.command("ping")
            self.db = self.client[self.db_name]
            self.available = True
        except PyMongoError:
            self.client = None
            self.db = None
            self.available = False

    def upsert_room_state(self, room):
        if not self.available:
            return
        self.db.room_states.update_one({"id": room["id"]}, {"$set": room}, upsert=True)

    def upsert_devices(self, devices):
        if not self.available:
            return
        for device in devices:
            self.db.devices.update_one({"id": device["id"]}, {"$set": device}, upsert=True)

    def save_event(self, event):
        if not self.available:
            return
        self.db.energy_logs.insert_one(event)

    def save_ghost_frame(self, frame):
        if not self.available:
            return
        self.db.ghost_frames.insert_one(frame)

    def list_logs(self, limit=50):
        if not self.available:
            return []
        return list(self.db.energy_logs.find({}, {"_id": 0}).sort("timestamp", DESCENDING).limit(limit))

    def get_room_states(self):
        if not self.available:
            return []
        return list(self.db.room_states.find({}, {"_id": 0}).sort("id", 1))

    def get_devices(self):
        if not self.available:
            return []
        return list(self.db.devices.find({}, {"_id": 0}).sort("id", 1))


repo = MongoRepository()
