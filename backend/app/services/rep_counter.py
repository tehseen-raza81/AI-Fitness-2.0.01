"""Strict repetition / hold counter.

A repetition is only counted when the user stays in the required depth range
*and* completes the movement without triggering any ``incorrect`` frame. Any
fault during the repetition voids it, which enforces the product rule:
"wrong form means the rep does not count".
"""

import time
from typing import Dict, List


class RepCounter:
    def __init__(self, exercise_id: str, min_rep_seconds: float = 0.6):
        self.exercise_id = exercise_id
        self.min_rep_seconds = min_rep_seconds
        self.reset()

    def reset(self) -> None:
        self.stage: str = "up"
        self.valid_reps: int = 0
        self.total_attempts: int = 0
        self.hold_seconds: float = 0.0
        self._rep_scores: List[int] = []
        self._rep_faulted: bool = False
        self._rep_started_at: float = time.time()
        self._last_frame_at: float = time.time()
        self._reached_depth: bool = False

    def update(self, angles: Dict[str, float], score: int, fault: bool) -> dict:
        """Feed one frame of angles + the current form score/fault flag."""
        from app.services.pose_engine import primary_angle  # local import avoids cycle

        now = time.time()
        dt = max(0.0, now - self._last_frame_at)
        self._last_frame_at = now

        angle = primary_angle(self.exercise_id, angles)
        self._rep_scores.append(score)

        if self.exercise_id == "plank":
            return self._update_plank(angle, dt, fault)

        rep_completed = False
        counted = False

        if self.exercise_id == "squat":
            down_threshold, up_threshold, depth_ok = 100.0, 158.0, lambda a: 65.0 <= a <= 100.0
        else:  # pushup
            down_threshold, up_threshold, depth_ok = 100.0, 152.0, lambda a: 70.0 <= a <= 105.0

        if angle < down_threshold:
            self.stage = "down"
            self._reached_depth = self._reached_depth or depth_ok(angle)

        if fault:
            self._rep_faulted = True

        if angle > up_threshold and self.stage == "down":
            rep_completed = True
            self.total_attempts += 1
            duration = now - self._rep_started_at
            if not self._rep_faulted and self._reached_depth and duration >= self.min_rep_seconds:
                self.valid_reps += 1
                counted = True
            self._start_new_rep(now)
            self.stage = "up"

        avg = sum(self._rep_scores) / len(self._rep_scores) if self._rep_scores else 100
        return {
            "value": self.valid_reps,
            "stage": self.stage,
            "rep_completed": rep_completed,
            "counted": counted,
            "attempts": self.total_attempts,
            "average_form": round(avg),
        }

    def _update_plank(self, angle: float, dt: float, fault: bool) -> dict:
        in_line = 160.0 <= angle <= 190.0
        if in_line and not fault:
            self.hold_seconds += dt
            self.stage = "holding"
        else:
            self.stage = "break"

        avg = sum(self._rep_scores) / len(self._rep_scores) if self._rep_scores else 100
        return {
            "value": int(self.hold_seconds),
            "stage": self.stage,
            "rep_completed": False,
            "counted": in_line and not fault,
            "attempts": self.total_attempts,
            "average_form": round(avg),
        }

    def _start_new_rep(self, now: float) -> None:
        self._rep_started_at = now
        self._rep_scores = []
        self._rep_faulted = False
        self._reached_depth = False
