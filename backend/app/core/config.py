"""Application configuration."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = DATA_DIR / "fiiteeness.db"

APP_TITLE = "FIITEENESS API"
APP_DESCRIPTION = (
    "AI camera-based personal fitness trainer: real-time biomechanical form "
    "analysis, strict rep validation and personalised post-workout nutrition."
)
APP_VERSION = "1.0.0"

# Origins allowed to call this API (Vite dev servers).
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
