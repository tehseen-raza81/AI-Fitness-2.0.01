/** Post-workout screen: session recap + personalised nutrition prescription. */

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Ban,
  Beef,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flame,
  Home,
  Info,
  Leaf,
  Loader2,
  Pill,
  Repeat,
  ScanFace,
  Sparkles,
  Target,
  Timer,
  Wheat,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  ExerciseDefinition,
  Language,
  NutritionAdvice,
  NutritionPlan,
  Profile,
  SessionRecord,
} from '../types';

interface Props {
  record: SessionRecord;
  exercise: ExerciseDefinition;
  profile: Profile;
  language: Language;
  onHome: () => void;
  onTrainAgain: () => void;
  onNutrition: () => void;
}

const COPY = {
  en: {
    complete: 'Task complete',
    sub: 'You finished the set with clean form. Here is exactly what your body needs today.',
    reps: 'Valid reps',
    form: 'Form score',
    burned: 'Calories burnt',
    time: 'Duration',
    nutrition: 'Your nutrition for today',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    meals: 'What to eat',
    insights: 'Coach notes',
    home: 'Back to home',
    again: 'Train another',
    loading: 'Building your nutrition plan…',
    failed: 'Could not reach the nutrition service. Start the backend and refresh.',
    detectedEyebrow: 'Auto-detected',
    aiTitle: 'Your coach says',
    buyTitle: 'Supplements you actually need',
    eatTitle: 'Eat at home',
    avoidTitle: 'Avoid tonight',
    recoveryTitle: 'Recovery checklist',
    fuel: 'Open Fuel & Nutrition',
  },
  hi: {
    complete: 'Task complete',
    sub: 'Aapne sahi form ke saath set poora kiya. Ab dekho aaj aapke body ko kya chahiye.',
    reps: 'Sahi reps',
    form: 'Form score',
    burned: 'Calories burnt',
    time: 'Duration',
    nutrition: 'Aaj ka nutrition plan',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    meals: 'Kya khana hai',
    insights: 'Coach ke notes',
    home: 'Home par jao',
    again: 'Doosri exercise',
    loading: 'Aapka nutrition plan ban raha hai…',
    failed: 'Nutrition service nahi mili. Backend start karke refresh karo.',
    detectedEyebrow: 'Auto-detect',
    aiTitle: 'Aapke coach kehta hai',
    buyTitle: 'Ye supplements asal me chahiye',
    eatTitle: 'Ghar par kya khao',
    avoidTitle: 'Aaj raat kya avoid karo',
    recoveryTitle: 'Recovery checklist',
    fuel: 'Fuel aur Nutrition kholo',
  },
};

export function SummaryPage({
  record,
  exercise,
  profile,
  language,
  onHome,
  onTrainAgain,
  onNutrition,
}: Props) {
  const t = COPY[language];
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [advice, setAdvice] = useState<NutritionAdvice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .nutritionPlan({
        profile,
        workout_calories: record.calories_burned,
        exercises_done: [record.exercise_id],
      })
      .then((result) => active && setPlan(result))
      .catch(() => active && setError(t.failed));
    return () => {
      active = false;
    };
  }, [profile, record, t.failed]);

  useEffect(() => {
    let active = true;
    api
      .recommendations({ profile })
      .then((result) => active && setAdvice(result))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [profile]);

  const summaryCards = [
    {
      icon: Repeat,
      label: t.reps,
      value: exercise.mode === 'time' ? `${record.achieved_value}s` : `${record.valid_reps}`,
    },
    { icon: Target, label: t.form, value: `${Math.round(record.average_form)}%` },
    { icon: Flame, label: t.burned, value: `${Math.round(record.calories_burned)} kcal` },
    { icon: Timer, label: t.time, value: `${Math.round(record.duration_sec)}s` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-white">
          {t.complete} — {language === 'hi' ? exercise.name_hi : exercise.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">{t.sub}</p>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <card.icon className="h-4 w-4 text-emerald-400" />
            <p className="mt-3 text-xl font-bold text-white">{card.value}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          {t.nutrition}
        </h2>

        {!plan && !error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.loading}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200">
            {error}
          </div>
        )}

        {plan && (
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MacroCard icon={Flame} label={t.calories} value={`${plan.macros.calories}`} unit="kcal" />
              <MacroCard icon={Beef} label={t.protein} value={`${plan.macros.protein_g}`} unit="g" />
              <MacroCard icon={Wheat} label={t.carbs} value={`${plan.macros.carbs_g}`} unit="g" />
              <MacroCard icon={Dumbbell} label={t.fat} value={`${plan.macros.fat_g}`} unit="g" />
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-sky-400/25 bg-sky-400/10 p-4 text-sm text-sky-100">
              <Droplets className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{language === 'hi' ? plan.hydration_note_hi : plan.hydration_note_en}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                {t.insights}
              </h3>
              <ul className="mt-4 space-y-3">
                {(language === 'hi' ? plan.insight_hi : plan.insight_en).map((line, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                {t.meals}
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {plan.meals.map((meal) => (
                  <div key={meal.slot} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">
                        {language === 'hi' ? meal.title_hi : meal.title_en}
                      </p>
                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        {meal.protein_g} g protein
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {(language === 'hi' ? meal.items_hi : meal.items_en).map((item, index) => (
                        <li key={index} className="text-xs leading-relaxed text-slate-300">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {advice && (
        <>
          {/* AI coach summary */}
          <section className="mt-8 overflow-hidden rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.07] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                <Sparkles className="h-5 w-5 animate-glow-pulse" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">
                  {t.aiTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  {language === 'hi' ? advice.summary_hi : advice.summary_en}
                </p>

                <p className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                  <ScanFace className="h-3.5 w-3.5 text-emerald-400" />
                  {t.detectedEyebrow}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip label={`${advice.pattern.current_streak}🔥 streak`} />
                  <Chip label={`${advice.pattern.training_days} days`} />
                  <Chip label={`${advice.pattern.total_sessions} sessions`} />
                  <Chip label={`${advice.pattern.average_form}% form`} />
                  {advice.pattern.exercises.map((ex) => (
                    <Chip key={ex.id} label={`${language === 'hi' ? ex.name_hi : ex.name} ×${ex.count}`} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Eat / avoid */}
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white">
                <Leaf className="h-4 w-4 text-emerald-400" />
                {t.eatTitle}
              </h3>
              <ul className="mt-4 space-y-2">
                {(language === 'hi' ? advice.eat_hi : advice.eat_en).slice(0, 6).map((item, index) => (
                  <li key={index} className="flex gap-3 text-[13px] leading-relaxed text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.06] p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white">
                <Ban className="h-4 w-4 text-rose-300" />
                {t.avoidTitle}
              </h3>
              <ul className="mt-4 space-y-2">
                {(language === 'hi' ? advice.avoid_hi : advice.avoid_en).slice(0, 6).map((item, index) => (
                  <li key={index} className="flex gap-3 text-[13px] leading-relaxed text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Supplements + recovery */}
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white">
                <Pill className="h-4 w-4 text-emerald-400" />
                {t.buyTitle}
              </h3>
              <div className="mt-4 space-y-2.5">
                {advice.supplements.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-white">{product.name}</p>
                      <p className="truncate text-[12px] text-slate-400">
                        {language === 'hi' ? product.dosage_hi : product.dosage_en}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                      {product.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white">
                {t.recoveryTitle}
              </h3>
              <ul className="mt-4 space-y-2">
                {(language === 'hi' ? advice.recovery_hi : advice.recovery_en).slice(0, 5).map((item, index) => (
                  <li key={index} className="flex gap-3 text-[13px] leading-relaxed text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {language === 'hi'
              ? 'Ye general guidance hai, medical prescription nahi. Supplement shuru karne se pehle doctor ya dietitian se pucho.'
              : 'General guidance, not a medical prescription. Check with a doctor or dietitian before starting any supplement.'}
          </p>
        </>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={onTrainAgain}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110"
        >
          <Repeat className="h-4 w-4" />
          {t.again}
        </button>
        <button
          onClick={onHome}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <Home className="h-4 w-4" />
          {t.home}
        </button>
        <button
          onClick={onNutrition}
          className="group inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
        >
          <Sparkles className="h-4 w-4" />
          {t.fuel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-slate-200">
      {label}
    </span>
  );
}

function MacroCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <Icon className="h-4 w-4 text-emerald-400" />
      <p className="mt-3 text-xl font-bold text-white">
        {value}
        <span className="ml-1 text-xs font-semibold text-slate-500">{unit}</span>
      </p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}
