"""Lightweight SQLite persistence layer (standard library only)."""

import sqlite3
from contextlib import contextmanager
from typing import Iterator

from app.core.config import DATABASE_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS profiles (
    id            INTEGER PRIMARY KEY CHECK (id = 1),
    name          TEXT    NOT NULL,
    age           INTEGER NOT NULL,
    gender        TEXT    NOT NULL,
    height_cm     REAL    NOT NULL,
    weight_kg     REAL    NOT NULL,
    goal          TEXT    NOT NULL,
    activity_level TEXT   NOT NULL,
    language      TEXT    NOT NULL DEFAULT 'en',
    updated_at    TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id       TEXT    NOT NULL,
    target_value      REAL    NOT NULL,
    achieved_value    REAL    NOT NULL,
    valid_reps        INTEGER NOT NULL,
    total_attempts    INTEGER NOT NULL,
    average_form      REAL    NOT NULL,
    calories_burned   REAL    NOT NULL,
    duration_sec      REAL    NOT NULL,
    completed         INTEGER NOT NULL,
    created_at        TEXT    NOT NULL
);
"""


def init_db() -> None:
    """Create tables if they do not exist yet."""
    with get_connection() as conn:
        conn.executescript(SCHEMA)
        conn.commit()


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    """Yield a row-mapped SQLite connection and always close it."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
