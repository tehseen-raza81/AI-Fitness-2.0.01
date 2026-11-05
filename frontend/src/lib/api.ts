/** Thin fetch wrapper around the FIITEENESS Python API. */

import type {
  ExerciseDefinition,
  NutritionAdvice,
  NutritionPlan,
  Profile,
  SessionPayload,
  SessionRecord,
  Stats,
} from '../types';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  getExercises: () => request<ExerciseDefinition[]>('/exercises'),

  getProfile: () => request<Profile | null>('/profile'),

  saveProfile: (profile: Omit<Profile, 'updated_at'>) =>
    request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  saveSession: (session: SessionPayload) =>
    request<SessionRecord>('/sessions', { method: 'POST', body: JSON.stringify(session) }),

  getSessions: (limit = 20) => request<SessionRecord[]>(`/sessions?limit=${limit}`),

  getStats: () => request<Stats>('/stats'),

  nutritionPlan: (payload: { profile?: Profile; workout_calories?: number; exercises_done?: string[] }) =>
    request<NutritionPlan>('/nutrition/plan', { method: 'POST', body: JSON.stringify(payload) }),

  recommendations: (payload: { profile?: Profile }) =>
    request<NutritionAdvice>('/nutrition/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
