export type ExerciseId = 'squat' | 'pushup' | 'plank';
export type FormStatus = 'correct' | 'warning' | 'incorrect' | 'idle';
export type Language = 'en' | 'hi';
export type Goal = 'lose_fat' | 'maintain' | 'build_muscle';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export type JointAngles = Record<string, number>;

export interface FormFeedback {
  status: FormStatus;
  score: number;
  message_en: string;
  message_hi: string;
  current_angle: number;
  target_range: [number, number];
}

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  name_hi: string;
  mode: 'reps' | 'time';
  target_reps: number | null;
  target_seconds: number | null;
  target_muscles: string[];
  camera_position: string;
  ideal_angle_range: string;
  calories_per_rep: number;
  calories_per_second: number;
  instructions_en: string;
  instructions_hi: string;
  key_rule_en: string;
  key_rule_hi: string;
}

export interface Profile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
  goal: Goal;
  activity_level: ActivityLevel;
  language: Language;
  updated_at?: string;
}

export interface SessionPayload {
  exercise_id: ExerciseId;
  target_value: number;
  achieved_value: number;
  valid_reps: number;
  total_attempts: number;
  average_form: number;
  duration_sec: number;
  completed: boolean;
}

export interface SessionRecord extends SessionPayload {
  id: number;
  calories_burned: number;
  created_at: string;
}

export interface Stats {
  total_sessions: number;
  total_reps: number;
  total_calories: number;
  total_minutes: number;
  current_streak: number;
  average_form: number;
}

export interface MealSuggestion {
  slot: string;
  title_en: string;
  title_hi: string;
  items_en: string[];
  items_hi: string[];
  protein_g: number;
}

export interface NutritionPlan {
  bmr: number;
  tdee: number;
  target_calories: number;
  workout_calories_burned: number;
  macros: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    water_liters: number;
  };
  hydration_note_en: string;
  hydration_note_hi: string;
  insight_en: string[];
  insight_hi: string[];
  meals: MealSuggestion[];
}

export type SupplementPriority = 'essential' | 'recommended' | 'optional';

export interface DetectedExercise {
  id: ExerciseId;
  name: string;
  name_hi: string;
  count: number;
}

/** What the app automatically detects from the user's session history. */
export interface TrainingPattern {
  total_sessions: number;
  training_days: number;
  current_streak: number;
  total_minutes: number;
  average_form: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  level_en: string;
  level_hi: string;
  exercises: DetectedExercise[];
  focus_en: string;
  focus_hi: string;
  last_trained_en: string;
  last_trained_hi: string;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  category_en: string;
  category_hi: string;
  why_en: string;
  why_hi: string;
  dosage_en: string;
  dosage_hi: string;
  priority: SupplementPriority;
  icon: string;
}

/** Auto-detected training pattern + AI-style product and food guidance. */
export interface NutritionAdvice {
  pattern: TrainingPattern;
  protein_target_g: number;
  summary_en: string;
  summary_hi: string;
  supplements: ProductSuggestion[];
  not_needed: ProductSuggestion[];
  eat_en: string[];
  eat_hi: string[];
  avoid_en: string[];
  avoid_hi: string[];
  hydration_en: string;
  hydration_hi: string;
  recovery_en: string[];
  recovery_hi: string[];
}
