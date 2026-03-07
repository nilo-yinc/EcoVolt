# Deployment Guide (Vercel + Render)

This project is best deployed as:
- Frontend (`frontend/`) on Vercel
- Python CV API (`computer_vision(fastapi)/`) on Render

## 1) Deploy Frontend on Vercel

1. Push code to GitHub.
2. In Vercel, `Add New Project` and import this repo.
3. Set project root directory to `frontend`.
4. Build settings:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables in Vercel:
   - `VITE_CV_API_URL=https://<your-render-service>.onrender.com`
   - `VITE_API_URL=https://ecovolt-node.onrender.com`
   - `VITE_WS_URL=wss://ecovolt-node.onrender.com/ws`
6. Deploy.

Notes:
- `frontend/vercel.json` is included to support React Router refresh on nested routes like `/ghost-view`.

## 2) Deploy Python Backend on Render

1. In Render, create `Web Service` from same repo.
2. Set Root Directory to `computer_vision`.
   - If your local folder shows `computer_vision(fastapi)`, it is an alias to `computer_vision`.
   - In Git/Render path settings, use `computer_vision`.
3. Use these settings:
   - Runtime: `Python`
   - Build Command: `pip install -r requirements-render.txt`
   - Start Command: `python run.py`
4. Add environment variables:
   - `RUN_VISION=0`
   - `PYTHON_VERSION=3.12.6` (optional but recommended)
5. Deploy.

Important:
- Cloud instances do not have camera devices. `RUN_VISION=0` keeps service stable in API-only mode.
- Endpoints like `/ghost/status` and `/ghost/latest.jpg` will still be available.

## 3) Local Development (full CV + camera)

Run backend with camera:

```powershell
cd computer_vision
$env:RUN_VISION="1"
python run.py
```

Run frontend:

```powershell
cd frontend
npm run dev
```

## 4) Quick Health Checks

- Frontend: `https://<vercel-domain>/ghost-view`
- Backend status: `https://<render-domain>/ghost/status`
- Latest image endpoint: `https://<render-domain>/ghost/latest.jpg`
