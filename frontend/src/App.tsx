import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Salad, LayoutDashboard } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { NutritionPage } from './pages/NutritionPage';
import { OnboardingForm } from './pages/OnboardingForm';
import { SessionPage } from './pages/SessionPage';
import { SummaryPage } from './pages/SummaryPage';
import { SiteFooter } from './components/SiteFooter';
import { api } from './lib/api';
import { LOCAL_EXERCISES } from './lib/pose';
import type { ExerciseDefinition, Language, Profile, SessionRecord, Stats } from './types';

type View = 'home' | 'session' | 'summary' | 'nutrition';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [exercises, setExercises] = useState<ExerciseDefinition[]>(LOCAL_EXERCISES);
  const [stats, setStats] = useState<Stats | null>(null);
  const [view, setView] = useState<View>('home');
  const [activeExercise, setActiveExercise] = useState<ExerciseDefinition | null>(null);
  const [lastRecord, setLastRecord] = useState<SessionRecord | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [entered, setEntered] = useState(false);

  const language: Language = profile?.language ?? 'en';

  /* ------------------------------------------------------------------ */
  /* Bootstrap                                                          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let active = true;

    (async () => {
      const [exerciseRes, profileRes, statsRes] = await Promise.allSettled([
        api.getExercises(),
        api.getProfile(),
        api.getStats(),
      ]);

      if (!active) return;

      if (exerciseRes.status === 'fulfilled' && exerciseRes.value.length) {
        setExercises(exerciseRes.value);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
      setBooting(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const refreshStats = useCallback(() => {
    api
      .getStats()
      .then(setStats)
      .catch(() => undefined);
  }, []);

  const handleSaveProfile = useCallback((next: Omit<Profile, 'updated_at'>) => {
    setSavingProfile(true);
    api
      .saveProfile(next)
      .then((saved) => setProfile(saved))
      .catch(() => setProfile({ ...next, updated_at: new Date().toISOString() }))
      .finally(() => setSavingProfile(false));
  }, []);

  const handleLanguageToggle = useCallback(
    (next: Language) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, language: next };
        api.saveProfile({ ...updated }).catch(() => undefined);
        return updated;
      });
    },
    []
  );

  const handleStart = useCallback((exercise: ExerciseDefinition) => {
    setActiveExercise(exercise);
    setView('session');
  }, []);

  const handleCompleted = useCallback(
    (record: SessionRecord, exercise: ExerciseDefinition) => {
      setLastRecord(record);
      setActiveExercise(exercise);
      refreshStats();
      setView('summary');
    },
    [refreshStats]
  );

  const userName = useMemo(() => profile?.name?.trim() || 'Athlete', [profile]);

  if (booting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 text-slate-400">
        <span className="flex h-14 w-14 animate-glow-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl font-black text-ink">
          F
        </span>
        <p className="text-display text-2xl tracking-[0.3em] text-white">FIITEENESS</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Starting your trainer…</span>
        </div>
      </div>
    );
  }

  if (!entered) {
    return <LandingPage exercises={exercises} onEnter={() => setEntered(true)} />;
  }

  if (!profile || editingProfile) {
    return (
      <div className="min-h-screen">
        <BrandBar language={language} onLanguageToggle={handleLanguageToggle} showToggle />
        <div className="animate-fade-up">
          <OnboardingForm
            initial={profile}
            saving={savingProfile}
            onSave={(next) => {
              handleSaveProfile(next);
              setEditingProfile(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BrandBar
        language={language}
        onLanguageToggle={handleLanguageToggle}
        showToggle={view !== 'session'}
        view={view}
        onNavigate={(next) => setView(next)}
      />

      <div key={view} className="animate-fade-up">
        {view === 'home' && (
          <HomePage
            exercises={exercises}
            stats={stats}
            language={language}
            userName={userName}
            onStart={handleStart}
            onEditProfile={() => setEditingProfile(true)}
            onNutrition={() => setView('nutrition')}
          />
        )}

        {view === 'nutrition' && (
          <NutritionPage
            profile={profile}
            language={language}
            onBack={() => setView('home')}
            onStart={() => setView('home')}
          />
        )}

        {view === 'session' && activeExercise && (
          <SessionPage
            key={activeExercise.id}
            exercise={activeExercise}
            language={language}
            onExit={() => setView('home')}
            onCompleted={handleCompleted}
          />
        )}

        {view === 'summary' && lastRecord && activeExercise && (
          <SummaryPage
            record={lastRecord}
            exercise={activeExercise}
            profile={profile}
            language={language}
            onHome={() => setView('home')}
            onTrainAgain={() => setView('home')}
            onNutrition={() => setView('nutrition')}
          />
        )}
      </div>

      {view !== 'session' && (
        <SiteFooter
          language={language}
          onNavigate={(next) => setView(next)}
          onStart={() => setView('home')}
        />
      )}
    </div>
  );
}

function BrandBar({
  language,
  onLanguageToggle,
  showToggle,
  view,
  onNavigate,
}: {
  language: Language;
  onLanguageToggle: (lang: Language) => void;
  showToggle: boolean;
  view?: View;
  onNavigate?: (view: 'home' | 'nutrition') => void;
}) {
  const nav: { id: 'home' | 'nutrition'; label: string; labelHi: string; icon: typeof Salad }[] = [
    { id: 'home', label: 'Dashboard', labelHi: 'Dashboard', icon: LayoutDashboard },
    { id: 'nutrition', label: 'Fuel & Nutrition', labelHi: 'Fuel aur Nutrition', icon: Salad },
  ];

  return (
    <div className="sticky top-0 z-50 border-b border-white/5 bg-[#05060a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center gap-2.5 transition hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-black text-slate-950">
            F
          </span>
          <span className="text-sm font-extrabold tracking-[0.3em] text-white">FIITEENESS</span>
        </button>

        {onNavigate && (
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-emerald-400/15 text-emerald-200'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {language === 'hi' ? item.labelHi : item.label}
                </button>
              );
            })}
          </nav>
        )}

        {showToggle && (
          <div className="flex overflow-hidden rounded-full border border-white/10">
            {(['en', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageToggle(lang)}
                className={`px-3.5 py-1.5 text-xs font-semibold transition ${
                  language === lang
                    ? 'bg-emerald-400/15 text-emerald-200'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {lang === 'en' ? 'EN' : 'हिं'}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
    </div>
  );
}
