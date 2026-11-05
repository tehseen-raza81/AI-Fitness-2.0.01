import { Activity, ArrowRight, Dumbbell, Flame, Sparkles, Target, Timer } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { Img } from '../components/Img';
import { EXERCISE_IMAGES } from '../lib/media';
import type { ExerciseDefinition, Language, Stats } from '../types';

interface Props {
  exercises: ExerciseDefinition[];
  stats: Stats | null;
  language: Language;
  userName: string;
  onStart: (exercise: ExerciseDefinition) => void;
  onEditProfile: () => void;
  onNutrition: () => void;
}

const COPY = {
  en: {
    welcome: 'Welcome back',
    tagline: 'Your camera is the trainer. Pick a movement — we watch every rep and only count the clean ones.',
    start: 'Start training',
    streak: 'Day streak',
    sessions: 'Sessions',
    calories: 'Calories burnt',
    form: 'Avg form',
    choose: 'Choose your exercise',
    chooseSub: 'Each movement is coached rep by rep with a live camera.',
    how: 'How FIITEENESS coaches you',
    steps: [
      'The camera locks onto 33 points of your body and reads every joint angle.',
      'If your form slips, you hear a warning instantly and that rep is thrown away.',
      'The set only finishes when you complete every rep with clean form.',
      'Right after training we tell you exactly how much protein and food you need today.',
    ],
    edit: 'Edit profile',
    reps: 'reps',
    seconds: 'sec hold',
    ready: 'Ready',
    fuelEyebrow: 'Auto-detected for you',
    fuelTitle: 'Fuel & Nutrition',
    fuelBody:
      'We read how often you train and which movements you do, then tell you what to buy, what to skip and what to eat at home.',
    fuelCta: 'See your plan',
  },
  hi: {
    welcome: 'Wapas swagat',
    tagline: 'Aapka camera hi trainer hai. Exercise chuno — hum har rep dekhte hain aur sirf sahi rep ginte hain.',
    start: 'Training shuru karo',
    streak: 'Din ka streak',
    sessions: 'Sessions',
    calories: 'Calories burnt',
    form: 'Average form',
    choose: 'Apni exercise chuno',
    chooseSub: 'Har exercise live camera ke saath rep-by-rep coach hoti hai.',
    how: 'FIITEENESS kaise coach karta hai',
    steps: [
      'Camera aapke shareer ke 33 points pakadta hai aur har joint ka angle naapta hai.',
      'Form thoda bhi galat hua to turant awaaz me warning milegi aur wo rep count nahi hogi.',
      'Set sirf tab poora hoga jab har rep sahi form ke saath hogi.',
      'Training ke turant baad hum batayenge aaj kitna protein aur kya khana hai.',
    ],
    edit: 'Profile badlo',
    reps: 'reps',
    seconds: 'sec hold',
    ready: 'Ready',
    fuelEyebrow: 'Aapke liye auto-detect',
    fuelTitle: 'Fuel aur Nutrition',
    fuelBody:
      'Hum dekhte hain aap kitne din train karte ho aur kaunsi exercises karte ho, phir batate hain kya lena hai, kya chhodna hai aur ghar par kya khaana hai.',
    fuelCta: 'Apna plan dekho',
  },
};

export function HomePage({
  exercises,
  stats,
  language,
  userName,
  onStart,
  onEditProfile,
  onNutrition,
}: Props) {
  const t = COPY[language];

  const statCards = [
    { icon: Flame, label: t.streak, value: stats ? `${stats.current_streak}` : '0' },
    { icon: Dumbbell, label: t.sessions, value: stats ? `${stats.total_sessions}` : '0' },
    { icon: Activity, label: t.calories, value: stats ? `${Math.round(stats.total_calories)}` : '0' },
    { icon: Target, label: t.form, value: stats ? `${stats.average_form}%` : '—' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Dashboard hero */}
      <header className="grain relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-cyan-500/10 p-6 sm:p-9">
        <div className="absolute -left-16 -top-16 h-56 w-56 animate-glow-pulse rounded-full bg-emerald-500/20 blur-[90px]" />
        <div className="absolute -bottom-20 right-0 h-56 w-56 animate-glow-pulse rounded-full bg-cyan-500/15 blur-[90px]" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              {t.welcome}
            </p>
            <h1 className="mt-3 text-display text-4xl leading-none text-white sm:text-6xl">
              {userName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">{t.tagline}</p>
          </div>
          <button
            onClick={onEditProfile}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur transition hover:bg-white/10"
          >
            {t.edit}
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((card, i) => (
          <Reveal key={card.label} delay={i * 70}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-300 transition group-hover:from-emerald-400 group-hover:to-teal-500 group-hover:text-ink">
                <card.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-display text-3xl text-white">{card.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {card.label}
              </p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Exercises */}
      <Reveal>
        <div className="mt-12">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
            {t.choose}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{t.chooseSub}</p>
        </div>
      </Reveal>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {exercises.map((exercise, i) => (
          <Reveal key={exercise.id} delay={i * 110}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/40 hover:shadow-[0_0_50px_-15px_rgba(16,185,129,0.6)]">
              <div className="relative h-44 overflow-hidden">
                <Img
                  src={EXERCISE_IMAGES[exercise.id]}
                  alt={exercise.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/70 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                  {exercise.mode === 'time' ? (
                    <Timer className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Dumbbell className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  {exercise.mode === 'time'
                    ? `${exercise.target_seconds} ${t.seconds}`
                    : `${exercise.target_reps} ${t.reps}`}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-extrabold text-white">
                  {language === 'hi' ? exercise.name_hi : exercise.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                  {language === 'hi' ? exercise.instructions_hi : exercise.instructions_en}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {exercise.target_muscles.slice(0, 3).map((muscle) => (
                    <span
                      key={muscle}
                      className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onStart(exercise)}
                  className="group/btn mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-ink transition hover:brightness-110"
                >
                  {t.start}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      {/* Fuel & Nutrition CTA */}
      <Reveal>
        <section className="mt-12 overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-cyan-500/10 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                {t.fuelEyebrow}
              </p>
              <h2 className="mt-3 text-display text-3xl text-white sm:text-4xl">{t.fuelTitle}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">{t.fuelBody}</p>
            </div>
            <button
              onClick={onNutrition}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-sm font-bold text-ink transition hover:brightness-110"
            >
              {t.fuelCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </Reveal>

      {/* How we coach */}
      <Reveal>
        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
            {t.how}
          </h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-2">
            {t.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="text-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-sm text-emerald-300">
                  0{index + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-300">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>
    </div>
  );
}
