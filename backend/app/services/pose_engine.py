"""Biomechanical pose analysis and strict form evaluation.

Uses the 33-point MediaPipe landmark layout so the same landmark indexes work
for both the Python service and the browser runtime.
"""

import math
from typing import Dict, List, Optional, Sequence, Tuple

# MediaPipe landmark indexes (subset that we rely on).
LM = {
    "LEFT_SHOULDER": 11,
    "RIGHT_SHOULDER": 12,
    "LEFT_ELBOW": 13,
    "RIGHT_ELBOW": 14,
    "LEFT_WRIST": 15,
    "RIGHT_WRIST": 16,
    "LEFT_HIP": 23,
    "RIGHT_HIP": 24,
    "LEFT_KNEE": 25,
    "RIGHT_KNEE": 26,
    "LEFT_ANKLE": 27,
    "RIGHT_ANKLE": 28,
    "LEFT_HEEL": 29,
    "RIGHT_HEEL": 30,
}

# Landmarks required to guarantee a complete full-body read.
FULL_BODY_LANDMARKS = [
    LM["LEFT_SHOULDER"],
    LM["RIGHT_SHOULDER"],
    LM["LEFT_HIP"],
    LM["RIGHT_HIP"],
    LM["LEFT_KNEE"],
    LM["RIGHT_KNEE"],
    LM["LEFT_ANKLE"],
    LM["RIGHT_ANKLE"],
]


def _angle(a: Dict[str, float], b: Dict[str, float], c: Dict[str, float]) -> float:
    """Interior angle at vertex ``b`` formed by segments b->a and b->c."""
    if not a or not b or not c:
        return 180.0

    ba_x, ba_y = a["x"] - b["x"], a["y"] - b["y"]
    bc_x, bc_y = c["x"] - b["x"], c["y"] - b["y"]

    dot = ba_x * bc_x + ba_y * bc_y
    mag_ba = math.hypot(ba_x, ba_y)
    mag_bc = math.hypot(bc_x, bc_y)

    if mag_ba < 1e-5 or mag_bc < 1e-5:
        return 180.0

    cosine = max(-1.0, min(1.0, dot / (mag_ba * mag_bc)))
    return math.degrees(math.acos(cosine))


def extract_joint_angles(landmarks: Sequence[dict]) -> Dict[str, float]:
    """Derive the joint angles we coach on from raw landmark points."""
    if not landmarks or len(landmarks) < 33:
        return {}

    def point(index: int) -> Dict[str, float]:
        lm = landmarks[index]
        return {"x": lm["x"], "y": lm["y"]}

    return {
        "left_knee": _angle(point(LM["LEFT_HIP"]), point(LM["LEFT_KNEE"]), point(LM["LEFT_ANKLE"])),
        "right_knee": _angle(point(LM["RIGHT_HIP"]), point(LM["RIGHT_KNEE"]), point(LM["RIGHT_ANKLE"])),
        "left_hip": _angle(point(LM["LEFT_SHOULDER"]), point(LM["LEFT_HIP"]), point(LM["LEFT_KNEE"])),
        "right_hip": _angle(point(LM["RIGHT_SHOULDER"]), point(LM["RIGHT_HIP"]), point(LM["RIGHT_KNEE"])),
        "left_elbow": _angle(point(LM["LEFT_SHOULDER"]), point(LM["LEFT_ELBOW"]), point(LM["LEFT_WRIST"])),
        "right_elbow": _angle(point(LM["RIGHT_SHOULDER"]), point(LM["RIGHT_ELBOW"]), point(LM["RIGHT_WRIST"])),
        "left_plank_line": _angle(point(LM["LEFT_SHOULDER"]), point(LM["LEFT_HIP"]), point(LM["LEFT_ANKLE"])),
        "right_plank_line": _angle(point(LM["RIGHT_SHOULDER"]), point(LM["RIGHT_HIP"]), point(LM["RIGHT_ANKLE"])),
    }


def is_full_body_visible(landmarks: Sequence[dict], min_visibility: float = 0.55) -> bool:
    """Ensure every critical joint is confidently inside the frame."""
    if not landmarks or len(landmarks) < 33:
        return False

    for index in FULL_BODY_LANDMARKS:
        lm = landmarks[index]
        visibility = lm.get("visibility", 1.0)
        x, y = lm.get("x", -1), lm.get("y", -1)
        if visibility < min_visibility:
            return False
        if x < 0.02 or x > 0.98 or y < 0.02 or y > 0.98:
            return False
    return True


def _feedback(status: str, score: int, en: str, hi: str, angle: float, target: Tuple[float, float]) -> dict:
    return {
        "status": status,
        "score": score,
        "message_en": en,
        "message_hi": hi,
        "current_angle": round(angle, 1),
        "target_range": [target[0], target[1]],
        "counted": False,
    }


def evaluate_form(exercise_id: str, angles: Dict[str, float], stage: str = "up") -> dict:
    """Strict, fault-tolerant form evaluation for one analysed frame."""
    if not angles:
        return _feedback(
            "idle", 0,
            "Step back so your full body is visible in the frame.",
            "Peechhe hato taaki poora shareer camera me dikhe.",
            0.0, (0.0, 180.0),
        )

    if exercise_id == "squat":
        return _evaluate_squat(angles, stage)
    if exercise_id == "pushup":
        return _evaluate_pushup(angles, stage)
    if exercise_id == "plank":
        return _evaluate_plank(angles)
    raise KeyError(f"Unknown exercise '{exercise_id}'")


def _pick(angles: Dict[str, float], primary: str, secondary: str, default: float) -> float:
    """Average both sides when available for a more stable reading."""
    left = angles.get(f"left_{primary}")
    right = angles.get(f"right_{primary}")
    if left is not None and right is not None:
        return (left + right) / 2.0
    if left is not None:
        return left
    if right is not None:
        return right
    value = angles.get(secondary)
    return value if value is not None else default


def _evaluate_squat(angles: Dict[str, float], stage: str) -> dict:
    knee = _pick(angles, "knee", "knee", 180.0)
    hip = _pick(angles, "hip", "hip", 180.0)

    if hip < 65:
        return _feedback(
            "incorrect", 50,
            "Your back is rounding. Keep your chest up and back straight.",
            "Kamar jhuk rahi hai. Chest upar rakho aur kamar seedhi rakho.",
            hip, (160.0, 180.0),
        )

    if stage == "down":
        if knee > 105:
            return _feedback(
                "warning", 70,
                "Go lower until your thighs are parallel to the floor.",
                "Thoda aur neeche jao, jaanghe floor ke barabar lao.",
                knee, (70.0, 95.0),
            )
        if knee < 65:
            return _feedback(
                "warning", 75,
                "Too deep, protect your knees and stop at parallel.",
                "Zyada gehra mat jao, ghutno ko bachao aur parallel par ruko.",
                knee, (70.0, 95.0),
            )
        return _feedback(
            "correct", 98,
            "Perfect squat depth. Now drive up through your heels.",
            "Shandaar depth. Ab ediyon se upar utho.",
            knee, (70.0, 95.0),
        )

    return _feedback(
        "correct", 100,
        "Good standing position. Push hips back and descend with control.",
        "Sahi khada hai. Hips peeche karo aur control se neeche jao.",
        knee, (160.0, 180.0),
    )


def _evaluate_pushup(angles: Dict[str, float], stage: str) -> dict:
    elbow = _pick(angles, "elbow", "elbow", 180.0)
    plank = _pick(angles, "plank_line", "plank_line", 175.0)

    if plank < 155:
        return _feedback(
            "incorrect", 45,
            "This is wrong, your hips are sagging. Tighten your core.",
            "Ye galat hai, hips gir rahe hain. Core ko tight karo.",
            plank, (165.0, 185.0),
        )
    if plank > 195:
        return _feedback(
            "incorrect", 55,
            "This is wrong, your hips are too high. Lower them.",
            "Ye galat hai, hips bahut upar hain. Neeche lao.",
            plank, (165.0, 185.0),
        )

    if stage == "down":
        if elbow > 105:
            return _feedback(
                "warning", 72,
                "Lower your chest closer to the floor.",
                "Chest ko floor ke aur paas lao.",
                elbow, (75.0, 100.0),
            )
        return _feedback(
            "correct", 97,
            "Great depth. Now push back up strongly.",
            "Badiya depth. Ab strongly upar push karo.",
            elbow, (75.0, 100.0),
        )

    return _feedback(
        "correct", 100,
        "Strong plank posture. Keep your core braced and lower slowly.",
        "Mazboot plank form. Core tight rakho aur dhire-dhire neeche jao.",
        elbow, (160.0, 180.0),
    )


def _evaluate_plank(angles: Dict[str, float]) -> dict:
    plank = _pick(angles, "plank_line", "plank_line", 175.0)

    if plank < 160:
        return _feedback(
            "incorrect", 45,
            "This is wrong, your hips are sagging. Lift and tighten your core.",
            "Ye galat hai, hips gir rahe hain. Upar uthao aur core tight karo.",
            plank, (165.0, 180.0),
        )
    if plank > 190:
        return _feedback(
            "incorrect", 60,
            "This is wrong, your hips are too high. Flatten into a straight line.",
            "Ye galat hai, hips bahut upar hain. Body ko seedhi line me lao.",
            plank, (165.0, 180.0),
        )

    return _feedback(
        "correct", 98,
        "Solid straight line. Hold steady and keep breathing.",
        "Seedhi line sahi hai. Isi tarah hold karo aur saans lete raho.",
        plank, (165.0, 180.0),
    )


def primary_angle(exercise_id: str, angles: Dict[str, float]) -> float:
    """The angle that drives rep/phase detection for the exercise."""
    if exercise_id in ("squat",):
        return _pick(angles, "knee", "knee", 180.0)
    if exercise_id == "pushup":
        return _pick(angles, "elbow", "elbow", 180.0)
    if exercise_id == "plank":
        return _pick(angles, "plank_line", "plank_line", 175.0)
    return 180.0
