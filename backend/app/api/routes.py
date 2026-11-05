"""REST API surface."""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from app.core.database import get_connection
from app.models.schemas import (
    AngleFrame,
    ExerciseDefinition,
    FormFeedback,
    NutritionAdvice,
    NutritionPlan,
    ProfileIn,
    ProfileOut,
    SessionIn,
    SessionOut,
    StatsOut,
)
from app.services.exercise_catalog import EXERCISE_CATALOG, get_exercise, list_exercises
from app.services.nutrition_engine import build_advice, build_nutrition_plan, calories_for_exercise
from app.services.pose_engine import evaluate_form

router = APIRouter()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# --------------------------------------------------------------------------- #
# Meta
# --------------------------------------------------------------------------- #
@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "fiiteeness", "time": _now()}


@router.get("/exercises", response_model=List[ExerciseDefinition])
def get_exercises() -> list:
    return list_exercises()


@router.get("/exercises/{exercise_id}", response_model=ExerciseDefinition)
def get_single_exercise(exercise_id: str) -> dict:
    try:
        return get_exercise(exercise_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


# --------------------------------------------------------------------------- #
# Server-side form analysis (optional path; the browser mirrors this logic)
# --------------------------------------------------------------------------- #
@router.post("/analyze", response_model=FormFeedback)
def analyze_frame(frame: AngleFrame) -> dict:
    return evaluate_form(frame.exercise, frame.angles, frame.stage)


# --------------------------------------------------------------------------- #
# Profile
# --------------------------------------------------------------------------- #
@router.get("/profile", response_model=Optional[ProfileOut])
def get_profile() -> Optional[dict]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM profiles WHERE id = 1").fetchone()
    return dict(row) if row else None


@router.put("/profile", response_model=ProfileOut)
def upsert_profile(profile: ProfileIn) -> dict:
    updated_at = _now()
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO profiles (id, name, age, gender, height_cm, weight_kg, goal, activity_level, language, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                age = excluded.age,
                gender = excluded.gender,
                height_cm = excluded.height_cm,
                weight_kg = excluded.weight_kg,
                goal = excluded.goal,
                activity_level = excluded.activity_level,
                language = excluded.language,
                updated_at = excluded.updated_at
            """,
            (
                profile.name, profile.age, profile.gender, profile.height_cm,
                profile.weight_kg, profile.goal, profile.activity_level,
                profile.language, updated_at,
            ),
        )
        conn.commit()
    return {**profile.model_dump(), "updated_at": updated_at}


# --------------------------------------------------------------------------- #
# Sessions
# --------------------------------------------------------------------------- #
@router.post("/sessions", response_model=SessionOut)
def create_session(session: SessionIn) -> dict:
    try:
        exercise = get_exercise(session.exercise_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    calories = calories_for_exercise(exercise, session.achieved_value, session.average_form)
    created_at = _now()

    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO sessions (
                exercise_id, target_value, achieved_value, valid_reps, total_attempts,
                average_form, calories_burned, duration_sec, completed, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session.exercise_id, session.target_value, session.achieved_value,
                session.valid_reps, session.total_attempts, session.average_form,
                calories, session.duration_sec, int(session.completed), created_at,
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid

    return {**session.model_dump(), "id": new_id, "calories_burned": calories, "created_at": created_at}


@router.get("/sessions", response_model=List[SessionOut])
def list_sessions(limit: int = 25) -> list:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM sessions ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    return [
        {
            "id": r["id"],
            "exercise_id": r["exercise_id"],
            "target_value": r["target_value"],
            "achieved_value": r["achieved_value"],
            "valid_reps": r["valid_reps"],
            "total_attempts": r["total_attempts"],
            "average_form": r["average_form"],
            "calories_burned": r["calories_burned"],
            "duration_sec": r["duration_sec"],
            "completed": bool(r["completed"]),
            "created_at": r["created_at"],
        }
        for r in rows
    ]


@router.get("/stats", response_model=StatsOut)
def stats() -> dict:
    with get_connection() as conn:
        agg = conn.execute(
            """
            SELECT COUNT(*) AS total_sessions,
                   COALESCE(SUM(valid_reps), 0)   AS total_reps,
                   COALESCE(SUM(calories_burned), 0) AS total_calories,
                   COALESCE(SUM(duration_sec), 0) AS total_seconds,
                   COALESCE(AVG(average_form), 0) AS average_form
            FROM sessions
            """
        ).fetchone()
        days = [r["day"] for r in conn.execute(
            "SELECT DISTINCT substr(created_at, 1, 10) AS day FROM sessions ORDER BY day DESC"
        ).fetchall()]

    streak = 0
    if days:
        from datetime import date, timedelta
        cursor = date.fromisoformat(days[0])
        today = datetime.now(timezone.utc).date()
        # Allow a streak to start today or yesterday.
        if (today - cursor).days <= 1:
            streak = 1
            for nxt in days[1:]:
                expected = cursor - timedelta(days=1)
                if date.fromisoformat(nxt) == expected:
                    streak += 1
                    cursor = expected
                else:
                    break

    return {
        "total_sessions": agg["total_sessions"],
        "total_reps": int(agg["total_reps"]),
        "total_calories": round(agg["total_calories"], 1),
        "total_minutes": round(agg["total_seconds"] / 60.0, 1),
        "current_streak": streak,
        "average_form": round(agg["average_form"]),
    }


# --------------------------------------------------------------------------- #
# Nutrition
# --------------------------------------------------------------------------- #
@router.post("/nutrition/plan", response_model=NutritionPlan)
def nutrition_plan(payload: dict) -> dict:
    profile = payload.get("profile")
    exercises_done: List[str] = payload.get("exercises_done", [])

    if not profile:
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM profiles WHERE id = 1").fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="No profile found. Create a profile first.")
        profile = dict(row)

    unknown = [e for e in exercises_done if e not in EXERCISE_CATALOG]
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unknown exercise(s): {', '.join(unknown)}")

    return build_nutrition_plan(profile, payload.get("workout_calories", 0.0), exercises_done)


@router.post("/nutrition/recommendations", response_model=NutritionAdvice)
def nutrition_recommendations(payload: dict) -> dict:
    """Auto-detect the training pattern from history and prescribe products + food."""
    profile = payload.get("profile")
    if not profile:
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM profiles WHERE id = 1").fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="No profile found. Create a profile first.")
        profile = dict(row)

    with get_connection() as conn:
        rows = conn.execute(
            "SELECT exercise_id, average_form, duration_sec, created_at FROM sessions ORDER BY id DESC LIMIT 60"
        ).fetchall()
    sessions = [dict(r) for r in rows]

    return build_advice(profile, sessions)
