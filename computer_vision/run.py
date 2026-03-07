import os
import threading

import uvicorn

from app.main import run_vision_loop


def start_cv():
    show_window = os.getenv("CV_SHOW_WINDOW", "0") == "1"
    run_vision_loop(show_window=show_window)


if __name__ == "__main__":
    threading.Thread(target=start_cv, daemon=True).start()
    uvicorn.run("app.api.server:app", host="0.0.0.0", port=8000, reload=False)
