/**
 * Local biomechanical engine — mirrors `backend/app/services/pose_engine.py`.
 * Kept in the browser so form feedback stays instant (no network round trip).
 */

import type { ExerciseDefinition, ExerciseId, FormFeedback, JointAngles, Landmark } from '../types';

export const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

const FULL_BODY_LANDMARKS = [11, 12, 23, 24, 25, 26, 27, 28];

export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  if (!a || !b || !c) return 180;

  const baX = a.x - b.x;
  const baY = a.y - b.y;
  const bcX = c.x - b.x;
  const bcY = c.y - b.y;

  const dot = baX * bcX + baY * bcY;
  const magBa = Math.hypot(baX, baY);
  const magBc = Math.hypot(bcX, bcY);

  if (magBa < 1e-5 || magBc < 1e-5) return 180;

  const cosine = Math.max(-1, Math.min(1, dot / (magBa * magBc)));
  return (Math.acos(cosine) * 180) / Math.PI;
}

export function isFullBodyVisible(landmarks: Landmark[], minVisibility = 0.5): boolean {
  if (!landmarks || landmarks.length < 33) return false;
  return FULL_BODY_LANDMARKS.every((i) => {
    const lm = landmarks[i];
    if (!lm) return false;
    const v = lm.visibility ?? 1;
    if (v < minVisibility) return false;
    return lm.x > 0.02 && lm.x < 0.98 && lm.y > 0.02 && lm.y < 0.98;
  });
}

export function extractJointAngles(landmarks: Landmark[]): JointAngles {
  if (!landmarks || landmarks.length < 33) return {};

  const p = (i: number) => landmarks[i];

  return {
    left_knee: calculateAngle(p(23), p(25), p(27)),
    right_knee: calculateAngle(p(24), p(26), p(28)),
    left_hip: calculateAngle(p(11), p(23), p(25)),
    right_hip: calculateAngle(p(12), p(24), p(26)),
    left_elbow: calculateAngle(p(11), p(13), p(15)),
    right_elbow: calculateAngle(p(12), p(14), p(16)),
    left_plank_line: calculateAngle(p(11), p(23), p(27)),
    right_plank_line: calculateAngle(p(12), p(24), p(28)),
  };
}

function pick(angles: JointAngles, key: string, fallback: number): number {
  const left = angles[`left_${key}`];
  const right = angles[`right_${key}`];
  if (left !== undefined && right !== undefined) return (left + right) / 2;
  if (left !== undefined) return left;
  if (right !== undefined) return right;
  return fallback;
}

export function primaryAngle(exercise: ExerciseId, angles: JointAngles): number {
  if (exercise === 'squat') return pick(angles, 'knee', 180);
  if (exercise === 'pushup') return pick(angles, 'elbow', 180);
  return pick(angles, 'plank_line', 175);
}

function fb(
  status: FormFeedback['status'],
  score: number,
  en: string,
  hi: string,
  angle: number,
  target: [number, number]
): FormFeedback {
  return {
    status,
    score,
    message_en: en,
    message_hi: hi,
    current_angle: Math.round(angle),
    target_range: target,
  };
}

export function evaluateForm(exercise: ExerciseId, angles: JointAngles, stage: string): FormFeedback {
  if (!angles || Object.keys(angles).length === 0) {
    return fb(
      'idle',
      0,
      'Step back so your full body is visible in the frame.',
      'Peechhe hato taaki poora shareer camera me dikhe.',
      0,
      [0, 180]
    );
  }

  if (exercise === 'squat') {
    const knee = pick(angles, 'knee', 180);
    const hip = pick(angles, 'hip', 180);

    if (hip < 65) {
      return fb('incorrect', 50, 'Your back is rounding. Keep your chest up and back straight.', 'Kamar jhuk rahi hai. Chest upar rakho aur kamar seedhi rakho.', hip, [160, 180]);
    }
    if (stage === 'down') {
      if (knee > 105) return fb('warning', 70, 'Go lower until your thighs are parallel to the floor.', 'Thoda aur neeche jao, jaanghe floor ke barabar lao.', knee, [70, 95]);
      if (knee < 65) return fb('warning', 75, 'Too deep, protect your knees and stop at parallel.', 'Zyada gehra mat jao, ghutno ko bachao aur parallel par ruko.', knee, [70, 95]);
      return fb('correct', 98, 'Perfect squat depth. Now drive up through your heels.', 'Shandaar depth. Ab ediyon se upar utho.', knee, [70, 95]);
    }
    return fb('correct', 100, 'Good standing position. Push hips back and descend with control.', 'Sahi khada hai. Hips peeche karo aur control se neeche jao.', knee, [160, 180]);
  }

  if (exercise === 'pushup') {
    const elbow = pick(angles, 'elbow', 180);
    const plank = pick(angles, 'plank_line', 175);

    if (plank < 155) return fb('incorrect', 45, 'This is wrong, your hips are sagging. Tighten your core.', 'Ye galat hai, hips gir rahe hain. Core ko tight karo.', plank, [165, 185]);
    if (plank > 195) return fb('incorrect', 55, 'This is wrong, your hips are too high. Lower them.', 'Ye galat hai, hips bahut upar hain. Neeche lao.', plank, [165, 185]);

    if (stage === 'down') {
      if (elbow > 105) return fb('warning', 72, 'Lower your chest closer to the floor.', 'Chest ko floor ke aur paas lao.', elbow, [75, 100]);
      return fb('correct', 97, 'Great depth. Now push back up strongly.', 'Badiya depth. Ab strongly upar push karo.', elbow, [75, 100]);
    }
    return fb('correct', 100, 'Strong plank posture. Keep your core braced and lower slowly.', 'Mazboot plank form. Core tight rakho aur dhire-dhire neeche jao.', elbow, [160, 180]);
  }

  const plank = pick(angles, 'plank_line', 175);
  if (plank < 160) return fb('incorrect', 45, 'This is wrong, your hips are sagging. Lift and tighten your core.', 'Ye galat hai, hips gir rahe hain. Upar uthao aur core tight karo.', plank, [165, 180]);
  if (plank > 190) return fb('incorrect', 60, 'This is wrong, your hips are too high. Flatten into a straight line.', 'Ye galat hai, hips bahut upar hain. Body ko seedhi line me lao.', plank, [165, 180]);
  return fb('correct', 98, 'Solid straight line. Hold steady and keep breathing.', 'Seedhi line sahi hai. Isi tarah hold karo aur saans lete raho.', plank, [165, 180]);
}

export interface CounterUpdate {
  value: number;
  stage: string;
  repCompleted: boolean;
  counted: boolean;
  attempts: number;
  averageForm: number;
  /** true when a rep was thrown away because of bad form */
  rejected: boolean;
}

/**
 * Strict rep/hold counter. A rep only counts when depth is reached and no
 * fault occurred during it — bad form means the rep does not count.
 */
export class RepCounter {
  private exercise: ExerciseId;
  private stage = 'up';
  private validReps = 0;
  private attempts = 0;
  private holdSeconds = 0;
  private scores: number[] = [];
  private faulted = false;
  private reachedDepth = false;
  private lastFrameAt = performance.now();

  constructor(exercise: ExerciseId) {
    this.exercise = exercise;
  }

  reset(): void {
    this.stage = 'up';
    this.validReps = 0;
    this.attempts = 0;
    this.holdSeconds = 0;
    this.scores = [];
    this.faulted = false;
    this.reachedDepth = false;
    this.lastFrameAt = performance.now();
  }

  update(angles: JointAngles, score: number, fault: boolean): CounterUpdate {
    const now = performance.now();
    const dt = Math.max(0, (now - this.lastFrameAt) / 1000);
    this.lastFrameAt = now;

    const angle = primaryAngle(this.exercise, angles);
    this.scores.push(score);

    if (this.exercise === 'plank') {
      const inLine = angle >= 160 && angle <= 190;
      const held = inLine && !fault;
      if (held) {
        this.holdSeconds += dt;
        this.stage = 'holding';
      } else {
        this.stage = 'break';
        this.faulted = true;
      }
      return {
        value: Math.floor(this.holdSeconds),
        stage: this.stage,
        repCompleted: false,
        counted: held,
        attempts: this.attempts,
        averageForm: this.avg(),
        rejected: false,
      };
    }

    const isSquat = this.exercise === 'squat';
    const downThreshold = 100;
    const upThreshold = isSquat ? 158 : 152;
    const depthOk = isSquat ? (a: number) => a >= 65 && a <= 100 : (a: number) => a >= 70 && a <= 105;

    if (fault) this.faulted = true;

    let repCompleted = false;
    let counted = false;
    let rejected = false;

    if (angle < downThreshold) {
      this.stage = 'down';
      if (depthOk(angle)) this.reachedDepth = true;
    } else if (angle > upThreshold && this.stage === 'down') {
      repCompleted = true;
      this.attempts += 1;
      if (!this.faulted && this.reachedDepth) {
        this.validReps += 1;
        counted = true;
      } else {
        rejected = true;
      }
      this.scores = [];
      this.faulted = false;
      this.reachedDepth = false;
      this.stage = 'up';
    }

    return {
      value: this.validReps,
      stage: this.stage,
      repCompleted,
      counted,
      attempts: this.attempts,
      averageForm: this.avg(),
      rejected,
    };
  }

  private avg(): number {
    if (!this.scores.length) return 100;
    return Math.round(this.scores.reduce((a, b) => a + b, 0) / this.scores.length);
  }
}

export const LOCAL_EXERCISES: ExerciseDefinition[] = [
  {
    id: 'squat',
    name: 'Squat',
    name_hi: 'स्क्वैट (Squat)',
    mode: 'reps',
    target_reps: 12,
    target_seconds: null,
    target_muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    camera_position: 'Side profile or 45-degree angle showing hips, knees and feet.',
    ideal_angle_range: '70° - 95° at the bottom',
    calories_per_rep: 0.45,
    calories_per_second: 0,
    instructions_en: 'Stand tall, chest up, push hips back, bend knees until thighs are parallel, then drive up through your heels.',
    instructions_hi: 'Seedhe khade ho, chest upar rakho, hips peeche kheench kar ghutne itne modho ki jaanghe floor ke barabar aa jayein, phir ediyon se upar utho.',
    key_rule_en: 'Keep your back straight and reach at least parallel depth.',
    key_rule_hi: 'Kamar seedhi rakho aur kam se kam parallel depth tak jao.',
  },
  {
    id: 'pushup',
    name: 'Push-up',
    name_hi: 'पुश-अप (Push-up)',
    mode: 'reps',
    target_reps: 10,
    target_seconds: null,
    target_muscles: ['Chest', 'Triceps', 'Front Shoulders', 'Core'],
    camera_position: 'Side view at floor level showing head-to-heel alignment.',
    ideal_angle_range: '75° - 100° at the bottom',
    calories_per_rep: 0.38,
    calories_per_second: 0,
    instructions_en: 'Hold a rigid plank line, lower your chest close to the floor, then press back up without letting hips sag.',
    instructions_hi: 'Body ko ek seedhi line me rakho, chest ko floor ke paas le jao, phir bina hips giraaye upar push karo.',
    key_rule_en: 'No hip sagging and full depth at the bottom.',
    key_rule_hi: 'Hips ko na girao aur neeche poori depth tak jao.',
  },
  {
    id: 'plank',
    name: 'Plank Hold',
    name_hi: 'प्लैंक होल्ड (Plank Hold)',
    mode: 'time',
    target_reps: null,
    target_seconds: 30,
    target_muscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Lower Back'],
    camera_position: 'Side profile showing your entire body from head to heels.',
    ideal_angle_range: '165° - 180° shoulder-hip-ankle line',
    calories_per_rep: 0,
    calories_per_second: 0.12,
    instructions_en: 'Elbows under shoulders, brace your core and hold a straight line from head to heels. Breathe steadily.',
    instructions_hi: 'Elbows shoulders ke neeche rakho, core tight karo aur head se heels tak seedhi line hold karo. Saans normal rakho.',
    key_rule_en: 'Hold a neutral straight line without sagging or piking.',
    key_rule_hi: 'Bina girre ya pahaad banaye seedhi line hold karo.',
  },
];
