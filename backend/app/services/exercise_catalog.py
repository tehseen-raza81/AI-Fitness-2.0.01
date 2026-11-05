"""Canonical exercise catalog: metadata + biomechanical coaching rules.

The frontend mirrors this catalogue locally so real-time feedback works with
zero network latency, while this module remains the single source of truth
served over the API.
"""

from typing import Dict

EXERCISE_CATALOG: Dict[str, dict] = {
    "squat": {
        "id": "squat",
        "name": "Squat",
        "name_hi": "स्क्वैट (Squat)",
        "mode": "reps",
        "target_reps": 12,
        "target_seconds": None,
        "target_muscles": ["Quadriceps", "Glutes", "Hamstrings", "Core"],
        "camera_position": "Side profile or 45-degree angle showing hips, knees and feet.",
        "ideal_angle_range": "70° - 95° at the bottom",
        "calories_per_rep": 0.45,
        "calories_per_second": 0.0,
        "instructions_en": "Stand tall, chest up, push hips back, bend knees until thighs are parallel, then drive up through your heels.",
        "instructions_hi": "Seedhe khade ho, chest upar rakho, hips peeche kheench kar ghutne itne modho ki jaanghe floor ke barabar aa jayein, phir ediyon se upar utho.",
        "key_rule_en": "Keep your back straight and reach at least parallel depth.",
        "key_rule_hi": "Kamar seedhi rakho aur kam se kam parallel depth tak jao.",
    },
    "pushup": {
        "id": "pushup",
        "name": "Push-up",
        "name_hi": "पुश-अप (Push-up)",
        "mode": "reps",
        "target_reps": 10,
        "target_seconds": None,
        "target_muscles": ["Chest", "Triceps", "Front Shoulders", "Core"],
        "camera_position": "Side view at floor level showing head-to-heel alignment.",
        "ideal_angle_range": "75° - 100° at the bottom",
        "calories_per_rep": 0.38,
        "calories_per_second": 0.0,
        "instructions_en": "Hold a rigid plank line, lower your chest close to the floor, then press back up without letting hips sag.",
        "instructions_hi": "Body ko ek seedhi line me rakho, chest ko floor ke paas le jao, phir bina hips giraaye upar push karo.",
        "key_rule_en": "No hip sagging and full depth at the bottom.",
        "key_rule_hi": "Hips ko na girao aur neeche poori depth tak jao.",
    },
    "plank": {
        "id": "plank",
        "name": "Plank Hold",
        "name_hi": "प्लैंक होल्ड (Plank Hold)",
        "mode": "time",
        "target_reps": None,
        "target_seconds": 30,
        "target_muscles": ["Rectus Abdominis", "Transverse Abdominis", "Lower Back"],
        "camera_position": "Side profile showing your entire body from head to heels.",
        "ideal_angle_range": "165° - 180° shoulder-hip-ankle line",
        "calories_per_rep": 0.0,
        "calories_per_second": 0.12,
        "instructions_en": "Elbows under shoulders, brace your core and hold a straight line from head to heels. Breathe steadily.",
        "instructions_hi": "Elbows shoulders ke neeche rakho, core tight karo aur head se heels tak seedhi line hold karo. Saans normal rakho.",
        "key_rule_en": "Hold a neutral straight line without sagging or piking.",
        "key_rule_hi": "Bina girre ya pahaad banaye seedhi line hold karo.",
    },
}


def get_exercise(exercise_id: str) -> dict:
    """Return one exercise definition or raise a KeyError."""
    if exercise_id not in EXERCISE_CATALOG:
        raise KeyError(f"Unknown exercise '{exercise_id}'")
    return EXERCISE_CATALOG[exercise_id]


def list_exercises() -> list:
    return list(EXERCISE_CATALOG.values())
