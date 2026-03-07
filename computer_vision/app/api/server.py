# app/api/server.py
from fastapi import FastAPI
from app.api.state import latest_state

app = FastAPI(title="Watt-Watch Brain API", version="1.0")

@app.get("/")
def root():
    return {"message": "Watt-Watch AI Module is Online"}

@app.get("/status")
def get_status():
    ## For frontend dashboard
    return latest_state