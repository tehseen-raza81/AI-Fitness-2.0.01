/**
 * Central image asset map.
 *
 * Local, hand-picked photos live in `frontend/public/images/` and are served
 * from the site root (e.g. `/images/hero.jpg`). If a local file is missing,
 * the UI automatically falls back to a generated placeholder so nothing breaks.
 */

import type { ExerciseId } from '../types';

const IMG_ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image';

export type ImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9';

function remote(prompt: string, size: ImageSize): string {
  return `${IMG_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

function local(file: string): string {
  return `/images/${file}`;
}

/* ------------------------------------------------------------------ */
/* Primary assets — drop your own files in /public/images with these    */
/* exact names and they appear everywhere automatically.               */
/* ------------------------------------------------------------------ */
export const HERO_IMAGE = local('hero.jpg');
export const POSE_IMAGE = local('pose-tracking.jpg');
export const SESSION_IMAGE = local('live-session.jpg');
export const NUTRITION_IMAGE = local('nutrition.jpg');
export const CTA_IMAGE = local('cta-bg.jpg');

export const EXERCISE_IMAGES: Record<ExerciseId, string> = {
  squat: local('exercise-squat.jpg'),
  pushup: local('exercise-pushup.jpg'),
  plank: local('exercise-plank.jpg'),
};

/* ------------------------------------------------------------------ */
/* Generated fallbacks — used only until the local file exists.        */
/* ------------------------------------------------------------------ */
export const IMAGE_FALLBACK: Record<string, string> = {
  [HERO_IMAGE]: remote(
    'cinematic dark gym interior at night, muscular athlete mid workout silhouette, dramatic emerald and teal rim lighting, volumetric haze, deep shadows, high contrast editorial fitness photography, ultra detailed, moody atmosphere',
    'landscape_16_9'
  ),
  [POSE_IMAGE]: remote(
    'athlete training in a dark studio with a glowing digital skeleton pose tracking overlay on the body, neon emerald tracking dots and joint markers, futuristic sports technology, cinematic lighting, high contrast',
    'landscape_16_9'
  ),
  [SESSION_IMAGE]: remote(
    'person doing a home workout in front of a laptop with a webcam, dark room lit by screen glow and emerald accent light, cinematic, high contrast, editorial fitness photography',
    'landscape_4_3'
  ),
  [NUTRITION_IMAGE]: remote(
    'overhead flat lay of a high protein athlete meal, grilled chicken, eggs, oats, avocado, fresh vegetables, dark slate table, soft cinematic side light, premium food photography',
    'landscape_4_3'
  ),
  [CTA_IMAGE]: remote(
    'wide dramatic dark gym shot, empty barbell and dumbbells on the floor, single emerald spotlight beam, volumetric haze, moody cinematic atmosphere, high contrast',
    'landscape_16_9'
  ),
  [EXERCISE_IMAGES.squat]: remote(
    'athlete performing a deep bodyweight squat in a dark gym, full body side profile, dramatic emerald teal rim lighting, volumetric haze, cinematic fitness photography, high contrast',
    'portrait_4_3'
  ),
  [EXERCISE_IMAGES.pushup]: remote(
    'athlete performing a push up on a gym floor, full body side profile, dark background, dramatic emerald teal rim lighting, cinematic fitness photography, high contrast',
    'portrait_4_3'
  ),
  [EXERCISE_IMAGES.plank]: remote(
    'athlete holding a forearm plank on a gym mat, full body side profile, dark gym, dramatic emerald teal rim lighting, cinematic fitness photography, high contrast',
    'portrait_4_3'
  ),
};
