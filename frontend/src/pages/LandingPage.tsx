/**
 * Landing page — the first thing anyone sees.
 * Opens with a cinematic curtain reveal, then scrolls through a
 * Klipsan-style marketing story: bold display type, full-bleed hero,
 * a running marquee, alternating dark/light sections and scroll reveals.
 */

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Dumbbell,
  Flame,
  Menu,
  Play,
  Salad,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { Img } from '../components/Img';
import { SiteFooter } from '../components/SiteFooter';
import {
  CTA_IMAGE,
  EXERCISE_IMAGES,
  HERO_IMAGE,
  NUTRITION_IMAGE,
  POSE_IMAGE,
  SESSION_IMAGE,
} from '../lib/media';
import type { ExerciseDefinition, Language } from '../types';

interface Props {
  exercises: ExerciseDefinition[];
  onEnter: () => void;
}

const COPY = {
  en: {
    nav: [
      { id: 'features', label: 'Features' },
      { id: 'how', label: 'How it works' },
      { id: 'exercises', label: 'Exercises' },
      { id: 'nutrition', label: 'Nutrition' },
    ],
    enter: 'Start training',
    heroEyebrow: 'AI camera personal trainer',
    heroTitle: ['Your camera', 'is your', 'trainer'],
    heroSub:
      'No gym membership. No human trainer. FIITEENESS watches all 33 points of your body in real time, coaches you out loud, and refuses to count a single rep done with sloppy form.',
    heroPrimary: 'Start training free',
    heroSecondary: 'See how it works',
    chips: ['33-point pose tracking', 'Bilingual voice coach', 'Reps gated on form'],
    scroll: 'Scroll to explore',
    marquee: [
      'POSE TRACKING',
      'STRICT REP GATING',
      'BILINGUAL VOICE',
      'INSTANT CORRECTIONS',
      'DAILY NUTRITION',
    ],
    stats: [
      { value: '33', label: 'body points tracked' },
      { value: '3', label: 'movements live' },
      { value: '100%', label: 'runs on-device' },
      { value: '2', label: 'coaching languages' },
    ],
    featEyebrow: 'Why it feels like a real trainer',
    featTitle: 'Built like a coach who never blinks',
    featSub:
      'Every frame is analysed, every mistake is called out, and nothing is counted unless it is earned.',
    features: [
      {
        title: 'Real-time pose AI',
        body: 'MediaPipe reads 33 landmarks per frame. We compute your knee, hip, elbow and back angles to know exactly where your form stands.',
      },
      {
        title: 'Reps that must be clean',
        body: 'Drop out of form for even a moment and the rep is discarded on the spot. Sloppy reps never make it into your numbers.',
      },
      {
        title: 'Voice that corrects you',
        body: 'English or Hindi — the coach speaks the exact fix mid-set, so you never have to break focus to look at the screen.',
      },
      {
        title: 'Food plan after training',
        body: 'Calories, protein, carbs and a full day of meals, calculated from your body and the work you just did.',
      },
    ],
    techEyebrow: 'Under the hood',
    techTitle: 'Thirty-three points. Every frame.',
    techBody:
      'A MediaPipe pose model maps your skeleton live, and our biomechanics engine turns those points into joint angles — so the coach can judge depth, alignment and control the way a human trainer would.',
    techPoints: [
      '33 landmarks tracked on every frame',
      'Knee, hip, elbow and back angles',
      'Runs on any normal webcam',
    ],
    howEyebrow: 'How it works',
    howTitle: 'Three steps to a session',
    howSub: 'No setup, no equipment — just space to move.',
    liveBadge: 'Live rep tracking',
    steps: [
      {
        title: 'Pick your movement',
        body: 'Squat, push-up or plank. A live guide frames your full body before you begin.',
      },
      {
        title: 'Train with live feedback',
        body: 'We read every rep, warn you the moment form breaks, and count only the reps that are perfect.',
      },
      {
        title: 'Eat for the work you did',
        body: 'The set closes with a protein target and a full meal plan for the rest of your day.',
      },
    ],
    exEyebrow: 'The starting line',
    exTitle: 'Start with three fundamentals',
    exSub: 'Each one is coached rep by rep, with its own injury-safe range of motion.',
    muscleLabel: 'Works',
    nutriEyebrow: 'After the last rep',
    nutriTitle: 'A trainer does not stop at the workout',
    nutriBody:
      'The moment your set completes, FIITEENESS turns your body data and calories burnt into a clear plan: how much protein, how much water, and what to actually eat next.',
    nutriPoints: [
      'Personal calorie and protein targets',
      'Meal-by-meal suggestions for the day',
      'Hydration guidance after every session',
      'Goal aware — cut, maintain or build muscle',
    ],
    ctaTitle: 'Your trainer is already in your pocket',
    ctaBody: 'Open the camera and finish your first coached set today. No equipment, no sign-up walls.',
    ctaButton: 'Enter FIITEENESS',
    footerNote: 'AI fitness coach — camera-based form tracking and nutrition planning.',
  },
  hi: {
    nav: [
      { id: 'features', label: 'Features' },
      { id: 'how', label: 'Kaise chalta hai' },
      { id: 'exercises', label: 'Exercises' },
      { id: 'nutrition', label: 'Nutrition' },
    ],
    enter: 'Training shuru karo',
    heroEyebrow: 'AI camera personal trainer',
    heroTitle: ['Aapka camera', 'hai aapka', 'trainer'],
    heroSub:
      'Na gym ki zaroorat, na trainer ki. FIITEENESS aapke shareer ke 33 points real-time me dekhta hai, awaaz me coaching karta hai, aur galat form wali ek bhi rep count nahi karta.',
    heroPrimary: 'Free training shuru karo',
    heroSecondary: 'Kaise chalta hai dekho',
    chips: ['33-point pose tracking', 'Bilingual voice coach', 'Reps sirf sahi form par'],
    scroll: 'Neeche scroll karo',
    marquee: [
      'POSE TRACKING',
      'STRICT REP GATING',
      'BILINGUAL VOICE',
      'TURANT CORRECTION',
      'ROZ KA NUTRITION',
    ],
    stats: [
      { value: '33', label: 'body points track' },
      { value: '3', label: 'exercises live' },
      { value: '100%', label: 'device par chalta hai' },
      { value: '2', label: 'coaching languages' },
    ],
    featEyebrow: 'Real trainer jaisa kyun lagta hai',
    featTitle: 'Ek coach jo kabhi palak nahi jhapkata',
    featSub: 'Har frame scan hota hai, har galti turant pakdi jaati hai, aur bina mehnat kuch count nahi hota.',
    features: [
      {
        title: 'Real-time pose AI',
        body: 'MediaPipe har frame me 33 landmarks padhta hai. Hum aapke ghutne, kamar, kohni aur back ke angles naap kar form jaante hain.',
      },
      {
        title: 'Reps sirf sahi form par',
        body: 'Ek pal bhi form bigdi to wo rep turant reject. Galat reps aapke count me kabhi nahi jaati.',
      },
      {
        title: 'Awaaz jo sudhaarti hai',
        body: 'English ya Hindi — coach beech set me sahi fix batata hai, taaki aapko screen dekhne ke liye rukna na pade.',
      },
      {
        title: 'Training ke baad food plan',
        body: 'Calories, protein, carbs aur poore din ka khana — aapke body aur aaj ki mehnat se calculate karke.',
      },
    ],
    techEyebrow: 'Andar ki technology',
    techTitle: '33 points. Har frame me.',
    techBody:
      'MediaPipe pose model aapka skeleton live map karta hai, aur hamara biomechanics engine un points se joint angles nikaalta hai — taaki coach depth, alignment aur control ko ek real trainer ki tarah judge kare.',
    techPoints: [
      'Har frame me 33 landmarks track',
      'Ghutne, kamar, kohni aur back ke angles',
      'Kisi bhi normal webcam par chalta hai',
    ],
    howEyebrow: 'Kaise chalta hai',
    howTitle: 'Session ke teen step',
    howSub: 'Koi setup nahi, koi equipment nahi — bas move karne ki jagah.',
    liveBadge: 'Live rep tracking',
    steps: [
      {
        title: 'Apni exercise chuno',
        body: 'Squat, push-up ya plank. Shuru se pehle ek live guide poora body frame karta hai.',
      },
      {
        title: 'Live feedback ke saath karo',
        body: 'Hum har rep padhte hain, form bigadte hi warning dete hain, aur sirf perfect reps count karte hain.',
      },
      {
        title: 'Mehnat ke hisaab se khao',
        body: 'Set poora hone par protein target aur poore din ka meal plan mil jaata hai.',
      },
    ],
    exEyebrow: 'Shuruaat',
    exTitle: 'Teen basics se shuru karo',
    exSub: 'Har exercise rep-by-rep coach hoti hai, sahi safe range ke saath.',
    muscleLabel: 'Kaam karta hai',
    nutriEyebrow: 'Aakhri rep ke baad',
    nutriTitle: 'Trainer workout par rukta nahi',
    nutriBody:
      'Set complete hote hi FIITEENESS aapke body data aur burnt calories se ek saaf plan banata hai: kitna protein, kitna paani, aur aage kya khaana hai.',
    nutriPoints: [
      'Personal calorie aur protein target',
      'Din bhar ke meal suggestions',
      'Har session ke baad hydration guidance',
      'Goal ke hisaab se — fat loss, fit ya muscle',
    ],
    ctaTitle: 'Aapka trainer pehle se ready hai',
    ctaBody: 'Camera kholo aur aaj hi apna pehla coached set poora karo. Koi equipment nahi, koi sign-up nahi.',
    ctaButton: 'FIITEENESS me aao',
    footerNote: 'AI fitness coach — camera se form tracking aur nutrition planning.',
  },
};

const FEATURE_ICONS = [ScanLine, ShieldCheck, Volume2, Salad];
const STEP_ICONS = [Target, Zap, Salad];

export function LandingPage({ exercises, onEnter }: Props) {
  const [lang, setLang] = useState<Language>('en');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [curtain, setCurtain] = useState(true);
  const [curtainMounted, setCurtainMounted] = useState(true);

  const t = COPY[lang];

  /* Curtain intro timing */
  useEffect(() => {
    const open = window.setTimeout(() => setCurtain(false), 1400);
    const unmount = window.setTimeout(() => setCurtainMounted(false), 2600);
    return () => {
      window.clearTimeout(open);
      window.clearTimeout(unmount);
    };
  }, []);

  /* Lock scrolling while the curtain is on screen */
  useEffect(() => {
    document.body.style.overflow = curtainMounted ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [curtainMounted]);

  /* Transparent header that turns solid on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const d = (ms: number) => ({ animationDelay: `${ms}ms` });
  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-ink">
      {/* ---------------------------------------------------------------- */}
      {/* Curtain intro                                                    */}
      {/* ---------------------------------------------------------------- */}
      {curtainMounted && (
        <div className="fixed inset-0 z-[90]">
          <div
            className={`absolute inset-y-0 left-0 w-1/2 bg-ink transition-transform duration-[1000ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
              curtain ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent" />
          </div>
          <div
            className={`absolute inset-y-0 right-0 w-1/2 bg-ink transition-transform duration-[1000ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
              curtain ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent" />
          </div>

          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-5 transition-opacity duration-500 ${
              curtain ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl font-black text-ink shadow-[0_0_60px_-10px_rgba(16,185,129,0.9)]">
              F
            </span>
            <p className="text-display text-3xl tracking-[0.3em] text-white">FIITEENESS</p>
            <div className="h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-[length:200%_100%] bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">
              {lang === 'hi' ? 'Trainer load ho raha hai' : 'Loading your trainer'}
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/10 bg-ink/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-black text-ink">
              F
            </span>
            <span className="text-sm font-extrabold tracking-[0.3em] text-white">FIITEENESS</span>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {t.nav.map((item) => (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className="group relative text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:text-white"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-emerald-400 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden overflow-hidden rounded-full border border-white/15 sm:flex">
              {(['en', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-[11px] font-bold transition ${
                    lang === l ? 'bg-emerald-400/20 text-emerald-200' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {l === 'en' ? 'EN' : 'हिं'}
                </button>
              ))}
            </div>

            <button
              onClick={onEnter}
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-xs font-bold text-ink transition hover:brightness-110 sm:inline-flex"
            >
              {t.enter}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white lg:hidden"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-xl transition-[max-height] duration-500 lg:hidden ${
            menuOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="space-y-1 px-5 py-4">
            {t.nav.map((item) => (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                {item.label}
              </button>
            ))}
            <div className="flex items-center gap-2 pt-2">
              {(['en', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                    lang === l
                      ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200'
                      : 'border-white/15 text-slate-300'
                  }`}
                >
                  {l === 'en' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
            <button
              onClick={onEnter}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-sm font-bold text-ink"
            >
              {t.enter}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="grain relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Img
            src={HERO_IMAGE}
            alt="Athlete training in a dark gym"
            className="h-full w-full animate-scale-in object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent" />
          <div className="absolute -left-24 top-1/3 h-96 w-96 animate-glow-pulse rounded-full bg-emerald-500/25 blur-[120px]" />
          <div className="absolute -right-20 bottom-10 h-80 w-80 animate-glow-pulse rounded-full bg-cyan-500/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-24 sm:px-8">
          <div className="max-w-3xl">
            <div className="animate-fade-up" style={d(1450)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                {t.heroEyebrow}
              </span>
            </div>

            <h1 className="mt-6 text-display text-[13vw] leading-[0.9] text-white sm:text-6xl lg:text-8xl">
              <span className="block animate-fade-up" style={d(1600)}>
                {t.heroTitle[0]}
              </span>
              <span className="block animate-fade-up" style={d(1730)}>
                {t.heroTitle[1]}
              </span>
              <span className="text-gradient block animate-fade-up" style={d(1860)}>
                {t.heroTitle[2]}
              </span>
            </h1>

            <p
              className="mt-7 max-w-xl animate-fade-up text-sm leading-relaxed text-slate-300 sm:text-base"
              style={d(2000)}
            >
              {t.heroSub}
            </p>

            <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3" style={d(2120)}>
              <button
                onClick={onEnter}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-sm font-bold text-ink shadow-[0_0_50px_-12px_rgba(16,185,129,0.9)] transition hover:brightness-110"
              >
                <Camera className="h-4 w-4" />
                {t.heroPrimary}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => goTo('how')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <Play className="h-4 w-4" />
                {t.heroSecondary}
              </button>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {t.chips.map((chip, i) => (
                <span
                  key={chip}
                  className="inline-flex animate-fade-up items-center gap-2 text-xs font-semibold text-slate-300"
                  style={d(2240 + i * 110)}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-7 left-1/2 flex -translate-x-1/2 animate-fade-in flex-col items-center gap-2"
          style={d(2500)}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{t.scroll}</span>
          <ChevronDown className="h-4 w-4 animate-scroll-cue text-emerald-400" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Marquee                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative flex overflow-hidden border-y border-white/10 bg-white/[0.02] py-5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...t.marquee, ...t.marquee].map((item, i) => (
            <span key={i} className="mx-5 flex items-center gap-5">
              <span className="text-display text-lg tracking-[0.2em] text-slate-500">{item}</span>
              <Flame className="h-4 w-4 text-emerald-500/60" />
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Stats                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {t.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div className="text-center lg:text-left">
                <p className="text-display text-5xl text-white sm:text-6xl">
                  <span className="text-gradient">{stat.value}</span>
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features (dark)                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section id="features" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
            {t.featEyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl text-display text-4xl text-white sm:text-6xl">
            {t.featTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">{t.featSub}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {t.features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <Reveal key={feature.title} delay={i * 100}>
                <article className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/40 hover:bg-emerald-400/[0.05]">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 lg:opacity-0" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-ink">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-bold text-white">{feature.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Under the hood (pose tracking band)                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <Img
                src={POSE_IMAGE}
                alt="Pose tracking overlay on an athlete"
                className="h-72 w-full object-cover sm:h-96"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/85 via-ink/20 to-transparent" />
              <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-ink/70 px-3 py-1.5 text-[11px] font-bold text-emerald-200 backdrop-blur">
                  <ScanLine className="h-3.5 w-3.5" />
                  33 landmarks
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/70 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  Knee 92°
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
              {t.techEyebrow}
            </p>
            <h2 className="mt-3 text-display text-4xl text-white sm:text-5xl">{t.techTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{t.techBody}</p>
            <ul className="mt-7 space-y-3">
              {t.techPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works (light contrast band)                                */}
      {/* ---------------------------------------------------------------- */}
      <section id="how" className="relative bg-slate-100 py-20 text-ink">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-600">
              {t.howEyebrow}
            </p>
            <h2 className="mt-3 text-display text-4xl sm:text-6xl">{t.howTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">{t.howSub}</p>
          </Reveal>

          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-9">
              {t.steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <Reveal key={step.title} delay={i * 120}>
                    <div className="flex items-start gap-5">
                      <span className="text-display text-5xl leading-none text-emerald-500/30">
                        0{i + 1}
                      </span>
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                          <Icon className="h-5 w-5 text-emerald-600" />
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={160}>
              <div className="relative overflow-hidden rounded-3xl border border-slate-900/10 shadow-2xl shadow-slate-900/25">
                <Img
                  src={SESSION_IMAGE}
                  alt="Live coached training session"
                  className="h-80 w-full object-cover sm:h-[26rem]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink/70 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {t.liveBadge}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Exercises                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section id="exercises" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
            {t.exEyebrow}
          </p>
          <h2 className="mt-3 text-display text-4xl text-white sm:text-6xl">{t.exTitle}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">{t.exSub}</p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {exercises.map((exercise, i) => (
            <Reveal key={exercise.id} delay={i * 120}>
              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface">
                <div className="relative h-56 overflow-hidden">
                  <Img
                    src={EXERCISE_IMAGES[exercise.id]}
                    alt={exercise.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/70 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                    {exercise.mode === 'time' ? (
                      <Timer className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Dumbbell className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    {exercise.mode === 'time'
                      ? `${exercise.target_seconds}s`
                      : `${exercise.target_reps} reps`}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-extrabold text-white">
                    {lang === 'hi' ? exercise.name_hi : exercise.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {lang === 'hi' ? exercise.instructions_hi : exercise.instructions_en}
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
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Nutrition                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section id="nutrition" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400">
              {t.nutriEyebrow}
            </p>
            <h2 className="mt-3 text-display text-4xl text-white sm:text-5xl">{t.nutriTitle}</h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">{t.nutriBody}</p>
            <ul className="mt-7 space-y-3">
              {t.nutriPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={140}>
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <Img
                src={NUTRITION_IMAGE}
                alt="High protein athlete meal"
                className="h-80 w-full object-cover sm:h-96"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/15 bg-ink/70 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    {lang === 'hi' ? 'Session ke baad plan' : 'Post-session plan'}
                  </span>
                </div>
                <span className="text-display text-2xl text-gradient">PRO</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Final CTA                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2rem] border border-emerald-400/20 px-6 py-16 text-center sm:px-12">
            <Img
              src={CTA_IMAGE}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/75 to-emerald-900/60" />
            <div className="absolute -left-10 top-0 h-64 w-64 animate-glow-pulse rounded-full bg-emerald-500/20 blur-[100px]" />
            <div className="absolute -right-10 bottom-0 h-64 w-64 animate-glow-pulse rounded-full bg-cyan-500/20 blur-[100px]" />
            <div className="relative">
              <Activity className="mx-auto h-8 w-8 text-emerald-400" />
              <h2 className="mx-auto mt-5 max-w-3xl text-display text-4xl text-white sm:text-6xl">
                {t.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
                {t.ctaBody}
              </p>
              <button
                onClick={onEnter}
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-8 py-4 text-sm font-bold text-ink shadow-[0_0_60px_-12px_rgba(16,185,129,0.9)] transition hover:brightness-110"
              >
                <Camera className="h-4 w-4" />
                {t.ctaButton}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ---------------------------------------------------------------- */}
      <SiteFooter language={lang} onStart={onEnter} />
    </div>
  );
}
