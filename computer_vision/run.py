import os
import threading
from pathlib import Path

import uvicorn

try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None


def _env_flag(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _load_local_env() -> None:
    if load_dotenv is None:
        return
    root = Path(__file__).resolve().parent
    candidates = [root / ".env", root / "app" / "api" / ".env"]
    for env_path in candidates:
        if env_path.exists():
            load_dotenv(env_path, override=False)


if __name__ == "__main__":
    _load_local_env()

    # Cloud-safe default: on Render run API-only mode unless explicitly enabled.
    run_vision_default = not _env_flag("RENDER", default=False)
    run_vision = _env_flag("RUN_VISION", default=run_vision_default)
    show_window = _env_flag("CV_SHOW_WINDOW", default=False)

    if run_vision:
        from app.main import run_vision_loop

        threading.Thread(
            target=run_vision_loop,
            kwargs={"show_window": show_window},
            daemon=True,
        ).start()
        print("Vision loop enabled.")
    else:
        print("API-only mode enabled (RUN_VISION=0).")

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.api.server:app", host=host, port=port, reload=False)
