/** Profile setup / edit form — feeds the nutrition engine. */

import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import type { ActivityLevel, Goal, Language, Profile } from '../types';

interface Props {
  initial: Profile | null;
  saving: boolean;
  onSave: (profile: Omit<Profile, 'updated_at'>) => void;
}

const ACTIVITY: { value: ActivityLevel; en: string; hi: string }[] = [
  { value: 'sedentary', en: 'Sedentary (desk job)', hi: 'Baithne wala kaam' },
  { value: 'light', en: 'Light (1-2 days/week)', hi: 'Halka (1-2 din/week)' },
  { value: 'moderate', en: 'Moderate (3-4 days/week)', hi: 'Medium (3-4 din/week)' },
  { value: 'active', en: 'Active (5-6 days/week)', hi: 'Active (5-6 din/week)' },
  { value: 'very_active', en: 'Very active (athlete)', hi: 'Bahut active (athlete)' },
];

const GOALS: { value: Goal; en: string; hi: string }[] = [
  { value: 'lose_fat', en: 'Lose fat', hi: 'Fat kam karni hai' },
  { value: 'maintain', en: 'Stay fit', hi: 'Fit rehna hai' },
  { value: 'build_muscle', en: 'Build muscle', hi: 'Muscle banani hai' },
];

export function OnboardingForm({ initial, saving, onSave }: Props) {
  const [form, setForm] = useState<Omit<Profile, 'updated_at'>>(
    initial ?? {
      name: '',
      age: 22,
      gender: 'male',
      height_cm: 170,
      weight_kg: 65,
      goal: 'maintain',
      activity_level: 'moderate',
      language: 'en',
    }
  );

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const language = form.language;
  const labels = {
    en: {
      title: 'Set up your coach',
      sub: 'We use these details to read your body and to build your daily food plan.',
      name: 'Your name',
      age: 'Age',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      goal: 'Your goal',
      activity: 'Activity level',
      language: 'Coaching language',
      submit: 'Save and continue',
      saving: 'Saving…',
      privacy: 'Everything stays on your own machine.',
    },
    hi: {
      title: 'Apna coach setup karo',
      sub: 'In details se hum aapka shareer samajh kar roz ka khana plan karte hain.',
      name: 'Aapka naam',
      age: 'Umar',
      gender: 'Gender',
      male: 'Purush',
      female: 'Mahila',
      height: 'Lambai (cm)',
      weight: 'Wazan (kg)',
      goal: 'Aapka goal',
      activity: 'Activity level',
      language: 'Coaching ki bhasha',
      submit: 'Save karke aage badho',
      saving: 'Save ho raha hai…',
      privacy: 'Poora data aapke hi computer par rehta hai.',
    },
  }[language];

  const valid = form.name.trim().length > 0 && form.age > 0 && form.height_cm > 0 && form.weight_kg > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8">
        <h1 className="text-display text-3xl text-white sm:text-4xl">{labels.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{labels.sub}</p>

        <div className="mt-8 space-y-5">
          <Field label={labels.name}>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
              placeholder="Tehseen"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={labels.age}>
              <input
                type="number"
                value={form.age}
                onChange={(e) => update('age', Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
              />
            </Field>

            <Field label={labels.gender}>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update('gender', g)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      form.gender === g
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                        : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {g === 'male' ? labels.male : labels.female}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={labels.height}>
              <input
                type="number"
                value={form.height_cm}
                onChange={(e) => update('height_cm', Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
              />
            </Field>

            <Field label={labels.weight}>
              <input
                type="number"
                value={form.weight_kg}
                onChange={(e) => update('weight_kg', Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
              />
            </Field>
          </div>

          <Field label={labels.goal}>
            <div className="grid gap-2 sm:grid-cols-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => update('goal', goal.value)}
                  className={`rounded-xl border px-4 py-3 text-xs font-semibold transition ${
                    form.goal === goal.value
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                      : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {language === 'hi' ? goal.hi : goal.en}
                </button>
              ))}
            </div>
          </Field>

          <Field label={labels.activity}>
            <select
              value={form.activity_level}
              onChange={(e) => update('activity_level', e.target.value as ActivityLevel)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60"
            >
              {ACTIVITY.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0b0d12]">
                  {language === 'hi' ? option.hi : option.en}
                </option>
              ))}
            </select>
          </Field>

          <Field label={labels.language}>
            <div className="flex gap-2">
              {(['en', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => update('language', lang as Language)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    form.language === lang
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                      : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {lang === 'en' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button
          type="button"
          disabled={!valid || saving}
          onClick={() => onSave({ ...form, name: form.name.trim() })}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? labels.saving : labels.submit}
        </button>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          {labels.privacy}
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
