<p align="center">
  <h1 align="center">EcoVolt</h1>
  <p align="center"><strong>AI-Powered Campus Energy Surveillance Platform</strong></p>
  <p align="center">
    Privacy-first energy waste detection using Computer Vision, IoT, and Real-time Dashboards
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/YOLO26-Ultralytics-FF6F00" alt="YOLOv8" />
  <img src="https://img.shields.io/badge/ESP32-IoT-E7352C?logo=espressif&logoColor=white" alt="ESP32" />
  <img src="https://img.shields.io/badge/MQTT-Protocol-660066?logo=eclipse-mosquitto&logoColor=white" alt="MQTT" />
</p>

Google drive link (for live update with video preview) -- https://drive.google.com/drive/folders/1fnQv-KcLB0_vIOnMqLL7_UBjO5rMEBYF?usp=sharing

---

## Overview

**EcoVolt** is an intelligent energy surveillance system designed for educational campuses. It detects energy waste in real time by combining:

- **Computer Vision** (YOLOv8) to detect room occupancy and appliance status
- **IoT Hardware** (ESP32 + Relay modules) to control lights, fans, and other appliances
- **Real-time Dashboard** for campus-wide energy monitoring with privacy-preserving ghost feeds
- **Automated Rules Engine** that turns off appliances in unoccupied rooms

The system ensures **zero PII storage** by processing all video locally and applying face/body blur before any data leaves the device.

---

## Architecture

```
+-------------------+       MQTT / HTTP        +-------------------+
|  Computer Vision  | -----------------------> |     Backend       |
|  (Python + YOLO)  |   occupancy, appliance   |  (Node.js/Express)|
|                   |   waste alerts, ghost     |  + Embedded MQTT  |
|  - People detect  |   frames (base64)        |  + WebSocket Hub  |
|  - Face detect    |                          |  + MongoDB        |
|  - Appliance ROI  |                          +--------+----------+
|  - Privacy blur   |                                   |
+-------------------+                            WebSocket (live)
                                                        |
+-------------------+                          +--------v----------+
|   ESP32 / IoT     | <--- MQTT commands ---   |    Frontend       |
|                   |                          |  (React + Vite)   |
|  - Relay control  |                          |                   |
|  - Light ON/OFF   |   HTTP (direct/proxy)    |  - Dashboard      |
|  - Fan ON/OFF     | <----------------------- |  - Ghost View     |
|  - Status polling |                          |  - Room Monitor   |
+-------------------+                          |  - Manual Control |
                                               |  - Analytics      |
                                               +-------------------+
```

---

## Features

### Computer Vision Module
- **YOLO26** person detection with configurable confidence threshold
- **Face detection** for improved occupancy accuracy
- **Appliance status inference** via brightness ROI analysis
- **Privacy-preserving ghost frames** with face/body blur
- **Waste detection engine** that flags appliances ON in empty rooms
- **Real-time metrics** - Precision, Recall, F1 Score, False Trigger Rate
- **FastAPI endpoints** (`/status`, `/metrics`) for remote consumption
