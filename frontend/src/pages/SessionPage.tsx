/** Live training screen: camera coaching + strict rep gating + bilingual voice. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CameraTrainer } from '../components/CameraTrainer';
import type { PoseFrame } from '../hooks/usePoseCamera';
import { RepCounter } from '../lib/pose';
import { VoiceCoach } from '../lib/voice';
import { api } from '../lib/api';
import type { ExerciseDefinition, FormFeedback, Language, SessionRecord } from '../types';

interface Props {
  exercise: ExerciseDefinition;
  language: Language;
  onExit: () => void;
  onCompleted: (record: SessionRecord, exercise: ExerciseDefinition) => void;
}

const IDLE_FEEDBACK: Record<Language, FormFeedback> = {
  en: {
    status: 'idle',
    score: 0,
    message_en: 'Fit your full body inside the frame to begin.',
    message_hi: 'Shuru karne ke liye poora shareer frame me lao.',
    current_angle: 0,
    target_range: [0, 180],
  },
  hi: {
    status: 'idle',
    score: 0,
    message_en: 'Fit your full body inside the frame to begin.',
    message_hi: 'Shuru karne ke liye poora shareer frame me lao.',
    current_angle: 0,
    target_range: [0, 180],
  },
};

const COPY = {
  en: {
    back: 'End session',
    live: 'Live coaching',
    progress: 'Progress',
    reps: 'Valid reps',
    attempts: 'Total attempts',
    formScore: 'Form score',
    rejected: 'Reps rejected',
    coach: 'Coach is watching',
    voiceOn: 'Voice on',
    voiceOff: 'Voice off',
    saving: 'Saving your session…',
    rejectedNote: 'Any rep performed with wrong form is not counted.',
    timeLeft: 'Hold time',
  },
  hi: {
    back: 'Session band karo',
    live: 'Live coaching',
    progress: 'Progress',
    reps: 'Sahi reps',
    attempts: 'Total attempts',
    formScore: 'Form score',
    rejected: 'Reject hui reps',
    coach: 'Coach dekh raha hai',
    voiceOn: 'Awaaz on',
    voiceOff: 'Awaaz off',
    saving: 'Session save ho raha hai…',
    rejectedNote: 'Galat form wali koi bhi rep count nahi hoti.',
    timeLeft: 'Hold time',
  },
};

export function SessionPage({ exercise, language, onExit, onCompleted }: Props) {
  const targetValue = useMemo(
    () => (exercise.mode === 'time' ? exercise.target_seconds ?? 30 : exercise.target_reps ?? 10),
    [exercise]
  );

  const counterRef = useRef(new RepCounter(exercise.id));
  const voiceRef = useRef<VoiceCoach | null>(null);
  if (!voiceRef.current) voiceRef.current = new VoiceCoach(language);

  const stageRef = useRef('up');
  const startedAtRef = useRef(Date.now());
  const completedRef = useRef(false);
  const uiSyncRef = useRef(0);

  const [feedback, setFeedback] = useState<FormFeedback>(IDLE_FEEDBACK[language]);
  const [validValue, setValidValue] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const t = COPY[language];

  /* Reset everything when the exercise changes. */
  useEffect(() => {
    counterRef.current = new RepCounter(exercise.id);
    stageRef.current = 'up';
    startedAtRef.current = Date.now();
    completedRef.current = false;
    uiSyncRef.current = 0;
    setFeedback(IDLE_FEEDBACK[language]);
    setValidValue(0);
    setAttempts(0);
    setElapsed(0);
    setCompleted(false);
    setSaving(false);
  }, [exercise.id, language]);

  useEffect(() => {
    voiceRef.current?.setLanguage(language);
  }, [language]);

  useEffect(() => {
    voiceRef.current?.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  /* Elapsed timer */
  useEffect(() => {
    if (completed) return;
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [completed]);

  const getStage = useCallback(() => stageRef.current, []);

  const finish = useCallback(
    (value: number, attemptCount: number, averageForm: number) => {
      const duration = Math.round(((Date.now() - startedAtRef.current) / 1000) * 10) / 10;
      voiceRef.current?.complete(exercise.name);
      setCompleted(true);
      setSaving(true);

      api
        .saveSession({
          exercise_id: exercise.id,
          target_value: targetValue,
          achieved_value: value,
          valid_reps: exercise.mode === 'reps' ? value : 0,
          total_attempts: attemptCount,
          average_form: averageForm,
          duration_sec: duration,
          completed: true,
        })
        .then((record) => {
          setSaving(false);
          onCompleted(record, exercise);
        })
        .catch(() => {
          setSaving(false);
          onCompleted(
            {
              id: 0,
              exercise_id: exercise.id,
              target_value: targetValue,
              achieved_value: value,
              valid_reps: exercise.mode === 'reps' ? value : 0,
              total_attempts: attemptCount,
              average_form: averageForm,
              duration_sec: duration,
              completed: true,
              calories_burned: 0,
              created_at: new Date().toISOString(),
            },
            exercise
          );
        });
    },
    [exercise, onCompleted, targetValue]
  );

  const handleFrame = useCallback(
    (frame: PoseFrame) => {
      if (completedRef.current) return;

      // No complete body read => do not count anything, just coach.
      if (!frame.fullBody) {
        voiceRef.current?.fullBodyReminder();
        const now = performance.now();
        if (now - uiSyncRef.current > 200) {
          uiSyncRef.current = now;
          setFeedback(IDLE_FEEDBACK[language]);
        }
        return;
      }

      const fault = frame.feedback.status === 'incorrect';
      const result = counterRef.current.update(frame.angles, frame.feedback.score, fault);
      stageRef.current = result.stage;

      if (frame.feedback.status === 'incorrect') {
        voiceRef.current?.warn(frame.feedback.message_en, frame.feedback.message_hi);
      } else if (frame.feedback.status === 'warning') {
        voiceRef.current?.caution(frame.feedback.message_en, frame.feedback.message_hi);
      } else {
        voiceRef.current?.praise();
      }

      if (result.repCompleted) {
        if (result.counted) voiceRef.current?.countRep(result.value);
        else voiceRef.current?.rejectedRep();
      }

      const now = performance.now();
      if (now - uiSyncRef.current > 110) {
        uiSyncRef.current = now;
        setFeedback(frame.feedback);
        setValidValue(result.value);
        setAttempts(result.attempts);
      }

      if (result.value >= targetValue) {
        completedRef.current = true;
        setFeedback(frame.feedback);
        setValidValue(result.value);
        setAttempts(result.attempts);
        finish(result.value, result.attempts, result.averageForm);
      }
    },
    [finish, language, targetValue]
  );

  const progress = Math.min(100, Math.round((validValue / targetValue) * 100));
  const rejected = Math.max(0, attempts - validValue);

  const statusStyle =
    feedback.status === 'correct'
      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
      : feedback.status === 'warning'
        ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
        : feedback.status === 'incorrect'
          ? 'border-rose-500/40 bg-rose-500/10 text-rose-100'
          : 'border-white/10 bg-white/5 text-slate-200';

  const StatusIcon =
    feedback.status === 'correct'
      ? CheckCircle2
      : feedback.status === 'incorrect'
        ? AlertTriangle
        : feedback.status === 'warning'
          ? AlertTriangle
          : Info;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {t.live}
          </span>
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {voiceEnabled ? t.voiceOn : t.voiceOff}
          </button>
        </div>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <CameraTrainer exercise={exercise} getStage={getStage} onFrame={handleFrame} language={language} />

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{t.progress}</p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {language === 'hi' ? exercise.name_hi : exercise.name}
            </h2>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-extrabold text-white">
                {exercise.mode === 'time' ? `${validValue}s` : validValue}
                <span className="text-lg font-semibold text-slate-500">/{targetValue}</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {elapsed}s · {exercise.mode === 'time' ? t.timeLeft : t.reps}
              </span>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">{t.attempts}</p>
                <p className="mt-1 text-xl font-bold text-white">{attempts}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">{t.rejected}</p>
                <p className="mt-1 text-xl font-bold text-rose-300">{rejected}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border p-5 transition-colors ${statusStyle}`}>
            <div className="flex items-center gap-2 text-sm font-bold">
              <StatusIcon className="h-4 w-4" />
              {t.coach}
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              {language === 'hi' ? feedback.message_hi : feedback.message_en}
            </p>
            <p className="mt-3 font-mono text-xs opacity-70">
              {feedback.current_angle}° → target {feedback.target_range[0]}°–{feedback.target_range[1]}°
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
              <Lock className="h-3.5 w-3.5" />
              {t.rejectedNote}
            </div>
          </div>

          {completed && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Task complete
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
