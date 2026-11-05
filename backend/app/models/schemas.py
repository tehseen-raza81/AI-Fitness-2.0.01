"""Pydantic request/response contracts."""

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

Gender = Literal["male", "female"]
Goal = Literal["lose_fat", "maintain", "build_muscle"]
ActivityLevel = Literal["sedentary", "light", "moderate", "active", "very_active"]
ExerciseId = Literal["squat", "pushup", "plank"]
Language = Literal["en", "hi"]


class ProfileIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    age: int = Field(ge=10, le=90)
    gender: Gender
    height_cm: float = Field(ge=100, le=250)
    weight_kg: float = Field(ge=25, le=300)
    goal: Goal = "maintain"
    activity_level: ActivityLevel = "moderate"
    language: Language = "en"


class ProfileOut(ProfileIn):
    updated_at: str


class ExerciseDefinition(BaseModel):
    id: ExerciseId
    name: str
    name_hi: str
    mode: Literal["reps", "time"]
    target_reps: Optional[int] = None
    target_seconds: Optional[int] = None
    target_muscles: List[str]
    camera_position: str
    ideal_angle_range: str
    calories_per_rep: float
    calories_per_second: float
    instructions_en: str
    instructions_hi: str
    key_rule_en: str
    key_rule_hi: str


class FormFeedback(BaseModel):
    status: Literal["correct", "warning", "incorrect", "idle"]
    score: int = Field(ge=0, le=100)
    message_en: str
    message_hi: str
    current_angle: float
    target_range: List[float]
    counted: bool = False


class AngleFrame(BaseModel):
    """A single analysed frame (used by the optional server-side analysis endpoint)."""

    exercise: ExerciseId
    stage: str = "up"
    angles: Dict[str, float]


class SessionIn(BaseModel):
    exercise_id: ExerciseId
    target_value: float
    achieved_value: float
    valid_reps: int = 0
    total_attempts: int = 0
    average_form: float = 0
    duration_sec: float = 0
    completed: bool


class SessionOut(SessionIn):
    id: int
    calories_burned: float
    created_at: str


class MacroBreakdown(BaseModel):
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    water_liters: float


class MealSuggestion(BaseModel):
    slot: str
    title_en: str
    title_hi: str
    items_en: List[str]
    items_hi: List[str]
    protein_g: int


class NutritionPlan(BaseModel):
    bmr: int
    tdee: int
    target_calories: int
    workout_calories_burned: float
    macros: MacroBreakdown
    hydration_note_en: str
    hydration_note_hi: str
    insight_en: List[str]
    insight_hi: List[str]
    meals: List[MealSuggestion]


class StatsOut(BaseModel):
    total_sessions: int
    total_reps: int
    total_calories: float
    total_minutes: float
    current_streak: int
    average_form: float


# --------------------------------------------------------------------------- #
# Smart coaching / nutrition recommendations
# --------------------------------------------------------------------------- #
class DetectedExercise(BaseModel):
    id: ExerciseId
    name: str
    name_hi: str
    count: int


class TrainingPattern(BaseModel):
    """What the app has automatically detected from the user's history."""

    total_sessions: int
    training_days: int
    current_streak: int
    total_minutes: float
    average_form: float
    level: Literal["beginner", "intermediate", "advanced"]
    level_en: str
    level_hi: str
    exercises: List[DetectedExercise]
    focus_en: str
    focus_hi: str
    last_trained_en: str
    last_trained_hi: str


class ProductSuggestion(BaseModel):
    id: str
    name: str
    category_en: str
    category_hi: str
    why_en: str
    why_hi: str
    dosage_en: str
    dosage_hi: str
    priority: Literal["essential", "recommended", "optional"]
    icon: str


class NutritionAdvice(BaseModel):
    """AI-style post-workout guidance, tailored to detected training pattern."""

    pattern: TrainingPattern
    protein_target_g: int
    summary_en: str
    summary_hi: str
    supplements: List[ProductSuggestion]
    not_needed: List[ProductSuggestion]
    eat_en: List[str]
    eat_hi: List[str]
    avoid_en: List[str]
    avoid_hi: List[str]
    hydration_en: str
    hydration_hi: str
    recovery_en: List[str]
    recovery_hi: List[str]
