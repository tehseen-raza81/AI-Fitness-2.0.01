/**
 * Fuel & Nutrition — the dedicated protein / supplement page.
 *
 * Reads the user's session history, auto-detects the training pattern
 * (how many days, which movements, current streak) and then shows what to
 * buy, what to skip, what to eat at home, what to avoid and how to recover.
 */

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Ban,
  BadgeCheck,
  Beef,
  CalendarDays,
  Check,
  Droplets,
  Fish,
  Flame,
  Info,
  Leaf,
  Loader2,
  Pill,
  ScanFace,
  ShoppingBag,
  Sparkles,
  Sun,
  Target,
  Timer,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { Img } from '../components/Img';
import { NUTRITION_IMAGE } from '../lib/media';
import { api } from '../lib/api';
import type { Language, NutritionAdvice, ProductSuggestion, Profile } from '../types';

interface Props {
  profile: Profile;
  language: Language;
  onBack: () => void;
  onStart: () => void;
}

const ICONS: Record<string, typeof Pill> = {
  protein: Beef,
  creatine: Zap,
  omega: Fish,
  vitamin: Sun,
  hydration: Droplets,
  multivitamin: Pill,
  avoid: Ban,
};

const PRIORITY_STYLE: Record<string, string> = {
  essential: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
  recommended: 'border-sky-400/40 bg-sky-400/15 text-sky-200',
  optional: 'border-white/15 bg-white/5 text-slate-300',
};

const COPY = {
  en: {
    back: 'Back to dashboard',
    eyebrow: 'Auto-detected from your history',
    title: 'Fuel & Nutrition',
    sub: 'No form filling. FIITEENESS reads how often you train, which movements you do and how long you have stayed consistent — then tells you exactly what your body needs next.',
    scanning: 'Reading your training history…',
    failed: 'Could not reach the coach service. Start the backend and refresh.',
    detected: 'What we detected',
    level: 'Level',
    focus: 'Main focus',
    lastTrained: 'Last session',
    statDays: 'Training days',
    statStreak: 'Day streak',
    statSessions: 'Sessions',
    statForm: 'Avg form',
    statMinutes: 'Minutes',
    movements: 'Movements detected',
    noMovements: 'Finish your first session and this fills up automatically.',
    aiTitle: 'Your coach says',
    buyTitle: 'Products worth buying',
    buySub: 'Ranked by what your goal and volume actually need.',
    skipTitle: 'Save your money',
    skipSub: 'Popular products you do not need right now.',
    eatTitle: 'Eat at home',
    eatSub: 'Cheap, local, high-protein foods.',
    avoidTitle: 'Avoid',
    avoidSub: 'The things quietly slowing your progress.',
    why: 'Why',
    how: 'How to use',
    recoveryTitle: 'Recovery checklist',
    proteinTarget: 'Daily protein target',
    start: 'Start a session',
    disclaimer:
      'General guidance, not a medical prescription. Check with a doctor or dietitian before starting any supplement.',
    perDay: 'g / day',
  },
  hi: {
    back: 'Dashboard par wapas',
    eyebrow: 'Aapki history se auto-detect',
    title: 'Fuel aur Nutrition',
    sub: 'Koi form bharne ki zaroorat nahi. FIITEENESS dekhta hai aap kitne din train karte ho, kaunsi exercises karte ho aur kitne din se regular ho — phir batata hai body ko aage kya chahiye.',
    scanning: 'Aapki training history padhi ja rahi hai…',
    failed: 'Coach service nahi mili. Backend start karke refresh karo.',
    detected: 'Humne kya detect kiya',
    level: 'Level',
    focus: 'Main focus',
    lastTrained: 'Aakhri session',
    statDays: 'Training days',
    statStreak: 'Din ki streak',
    statSessions: 'Sessions',
    statForm: 'Average form',
    statMinutes: 'Minutes',
    movements: 'Detect hui exercises',
    noMovements: 'Pehla session complete karo, ye apne aap bhar jayega.',
    aiTitle: 'Aapke coach kehta hai',
    buyTitle: 'Ye products lena banta hai',
    buySub: 'Aapke goal aur volume ke hisaab se rank kiya gaya.',
    skipTitle: 'Paise bachao',
    skipSub: 'Popular products jo abhi aapko zaroori nahi.',
    eatTitle: 'Ghar par kya khao',
    eatSub: 'Sasta, local, high-protein khaana.',
    avoidTitle: 'Kya avoid karo',
    avoidSub: 'Ye cheezein chupke se progress rok rahi hain.',
    why: 'Kyun',
    how: 'Kaise lein',
    recoveryTitle: 'Recovery checklist',
    proteinTarget: 'Roz ka protein target',
    start: 'Session shuru karo',
    disclaimer:
      'Ye general guidance hai, medical prescription nahi. Koi bhi supplement shuru karne se pehle doctor ya dietitian se pucho.',
    perDay: 'g / din',
  },
};

export function NutritionPage({ profile, language, onBack, onStart }: Props) {
  const t = COPY[language];
  const [advice, setAdvice] = useState<NutritionAdvice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    api
      .recommendations({ profile })
      .then((result) => active && setAdvice(result))
      .catch(() => active && setError(t.failed));
    return () => {
      active = false;
    };
  }, [profile, t.failed]);

  const pattern = advice?.pattern;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      {/* Hero band */}
      <Reveal>
        <div className="grain relative overflow-hidden rounded-[2rem] border border-white/10">
          <Img
            src={NUTRITION_IMAGE}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink/95 via-ink/80 to-emerald-900/50" />
          <div className="absolute -left-10 top-0 h-56 w-56 animate-glow-pulse rounded-full bg-emerald-500/20 blur-[90px]" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
              <ScanFace className="h-4 w-4" />
              {t.eyebrow}
            </p>
            <h1 className="mt-4 text-display text-4xl text-white sm:text-6xl">{t.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">{t.sub}</p>
          </div>
        </div>
      </Reveal>

      {!advice && !error && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          {t.scanning}
        </div>
      )}

      {error && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {advice && pattern && (
        <>
          {/* Auto-detection */}
          <Reveal>
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
                <ScanFace className="h-4 w-4 text-emerald-400" />
                {t.detected}
              </h2>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <StatCard icon={CalendarDays} label={t.statDays} value={`${pattern.training_days}`} />
                  <StatCard icon={Flame} label={t.statStreak} value={`${pattern.current_streak}`} />
                  <StatCard icon={TrendingUp} label={t.statSessions} value={`${pattern.total_sessions}`} />
                  <StatCard icon={Target} label={t.statForm} value={`${pattern.average_form}%`} />
                  <StatCard icon={Timer} label={t.statMinutes} value={`${pattern.total_minutes}`} />
                  <StatCard icon={Beef} label={t.proteinTarget} value={`${advice.protein_target_g}`} unit={t.perDay} />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {language === 'hi' ? pattern.level_hi : pattern.level_en}
                  </span>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase tracking-widest text-slate-500">{t.focus}</dt>
                      <dd className="mt-0.5 font-semibold text-white">
                        {language === 'hi' ? pattern.focus_hi : pattern.focus_en}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-widest text-slate-500">{t.lastTrained}</dt>
                      <dd className="mt-0.5 font-semibold text-white">
                        {language === 'hi' ? pattern.last_trained_hi : pattern.last_trained_en}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-5 text-[11px] uppercase tracking-widest text-slate-500">{t.movements}</p>
                  {pattern.exercises.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pattern.exercises.map((exercise) => (
                        <span
                          key={exercise.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[12px] text-slate-200"
                        >
                          {language === 'hi' ? exercise.name_hi : exercise.name}
                          <span className="rounded-full bg-emerald-400/15 px-1.5 text-[11px] font-bold text-emerald-300">
                            ×{exercise.count}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-[12px] text-slate-500">{t.noMovements}</p>
                  )}
                </div>
              </div>
            </section>
          </Reveal>

          {/* AI summary */}
          <Reveal>
            <section className="mt-8 overflow-hidden rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.07] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                  <Sparkles className="h-5 w-5 animate-glow-pulse" />
                </span>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">
                    {t.aiTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {language === 'hi' ? advice.summary_hi : advice.summary_en}
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          {/* Buy + skip */}
          <section className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <Reveal>
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-white">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  {t.buyTitle}
                </h2>
                <p className="mt-1.5 text-[13px] text-slate-400">{t.buySub}</p>

                <div className="mt-4 space-y-3">
                  {advice.supplements.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      language={language}
                      index={index}
                      t={{ why: t.why, how: t.how }}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-white">
                  <Wallet className="h-4 w-4 text-rose-300" />
                  {t.skipTitle}
                </h2>
                <p className="mt-1.5 text-[13px] text-slate-400">{t.skipSub}</p>

                <div className="mt-4 space-y-3">
                  {advice.not_needed.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Ban className="h-4 w-4 shrink-0 text-rose-300" />
                        <p className="text-sm font-bold text-white">{product.name}</p>
                      </div>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">
                        {language === 'hi' ? product.why_hi : product.why_en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>

          {/* Eat vs avoid */}
          <section className="mt-10 grid gap-4 md:grid-cols-2">
            <Reveal>
              <ListPanel
                icon={<Leaf className="h-4 w-4 text-emerald-400" />}
                title={t.eatTitle}
                sub={t.eatSub}
                tone="emerald"
                items={language === 'hi' ? advice.eat_hi : advice.eat_en}
              />
            </Reveal>
            <Reveal delay={100}>
              <ListPanel
                icon={<Ban className="h-4 w-4 text-rose-300" />}
                title={t.avoidTitle}
                sub={t.avoidSub}
                tone="rose"
                items={language === 'hi' ? advice.avoid_hi : advice.avoid_en}
              />
            </Reveal>
          </section>

          {/* Hydration + recovery */}
          <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
            <Reveal>
              <div className="h-full rounded-3xl border border-sky-400/25 bg-sky-400/[0.07] p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/20 text-sky-200">
                  <Droplets className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm leading-relaxed text-sky-100">
                  {language === 'hi' ? advice.hydration_hi : advice.hydration_en}
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white">
                  {t.recoveryTitle}
                </h2>
                <ul className="mt-4 space-y-3">
                  {(language === 'hi' ? advice.recovery_hi : advice.recovery_en).map((line, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </section>

          <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t.disclaimer}
          </p>
        </>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-sm font-bold text-ink transition hover:brightness-110"
        >
          <Zap className="h-4 w-4" />
          {t.start}
        </button>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.06]">
      <Icon className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
      <p className="mt-3 text-xl font-bold text-white">
        {value}
        {unit && <span className="ml-1 text-[11px] font-semibold text-slate-500">{unit}</span>}
      </p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function ProductCard({
  product,
  language,
  index,
  t,
}: {
  product: ProductSuggestion;
  language: Language;
  index: number;
  t: { why: string; how: string };
}) {
  const Icon = ICONS[product.icon] ?? Pill;
  return (
    <div
      className="group animate-fade-up rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/[0.05]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300 transition-transform duration-300 group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">{product.name}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              {language === 'hi' ? product.category_hi : product.category_en}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            PRIORITY_STYLE[product.priority] ?? PRIORITY_STYLE.optional
          }`}
        >
          {product.priority}
        </span>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
        <span className="font-semibold text-slate-300">{t.why}: </span>
        {language === 'hi' ? product.why_hi : product.why_en}
      </p>
      <p className="mt-2 flex items-start gap-2 text-[12.5px] leading-relaxed text-slate-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
        <span>
          <span className="font-semibold text-slate-300">{t.how}: </span>
          {language === 'hi' ? product.dosage_hi : product.dosage_en}
        </span>
      </p>
    </div>
  );
}

function ListPanel({
  icon,
  title,
  sub,
  tone,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: 'emerald' | 'rose';
  items: string[];
}) {
  const bullet = tone === 'emerald' ? 'bg-emerald-400' : 'bg-rose-400';
  return (
    <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-white">
        {icon}
        {title}
      </h2>
      <p className="mt-1.5 text-[13px] text-slate-400">{sub}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-[13px] leading-relaxed text-slate-300">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${bullet}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
