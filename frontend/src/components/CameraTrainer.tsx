/** Live camera panel: webcam feed, skeleton overlay, full-body guide and HUD. */

import { useEffect } from 'react';
import { AlertCircle, Camera, CameraOff, Loader2, RefreshCw, ScanLine } from 'lucide-react';
import { SkeletonOverlay } from './SkeletonOverlay';
import { usePoseCamera, type PoseFrame } from '../hooks/usePoseCamera';
import type { ExerciseDefinition } from '../types';

interface Props {
  exercise: ExerciseDefinition;
  getStage: () => string;
  onFrame: (frame: PoseFrame) => void;
  language: 'en' | 'hi';
}

const COPY = {
  en: {
    cameraTracking: 'Camera tracking',
    live: 'Live',
    fitBody: 'Fit your full body in frame',
    fitBodyHint: 'Step back until your head and feet are both visible.',
    retry: 'Retry camera',
    turnOn: 'Turn on camera',
    turnOff: 'Turn off camera',
    starting: 'Starting camera…',
    loadingPose: 'Loading pose engine…',
  },
  hi: {
    cameraTracking: 'Camera tracking',
    live: 'Live',
    fitBody: 'Poora shareer frame me lao',
    fitBodyHint: 'Peechhe hato jab tak sar aur pair dono dikhein.',
    retry: 'Camera retry karo',
    turnOn: 'Camera on karo',
    turnOff: 'Camera band karo',
    starting: 'Camera start ho raha hai…',
    loadingPose: 'Pose engine load ho raha hai…',
  },
};

export function CameraTrainer({ exercise, getStage, onFrame, language }: Props) {
  const camera = usePoseCamera({ exercise: exercise.id, getStage, onFrame });
  const t = COPY[language];

  const isActive = camera.status === 'active';
  const showGuide = isActive && camera.landmarks.length === 0;
  const blocked = camera.status === 'denied' || camera.status === 'error' || camera.status === 'unsupported';

  /* Start the webcam as soon as the trainer opens — no extra tap needed. */
  useEffect(() => {
    camera.startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] min-h-[260px] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/50">
        <video
          ref={camera.videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        />

        {camera.landmarks.length > 0 && (
          <SkeletonOverlay
            landmarks={camera.landmarks}
            angles={camera.feedback ? { left_knee: camera.feedback.current_angle } : {}}
            status={camera.feedback?.status ?? 'idle'}
          />
        )}

        {/* Full-body alignment guide */}
        {showGuide && !blocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 text-center">
            <div className="relative flex h-72 w-48 flex-col items-center justify-center rounded-[45%] border-2 border-dashed border-emerald-400/60">
              <span className="absolute inset-0 animate-pulse-ring rounded-[45%] border border-emerald-400/40" />
              <ScanLine className="mb-2 h-7 w-7 text-emerald-300" />
              <p className="px-4 text-sm font-semibold text-white">{t.fitBody}</p>
              <p className="mt-1 px-4 text-xs text-slate-300">{t.fitBodyHint}</p>
            </div>
          </div>
        )}

        {/* HUD */}
        <div className="absolute left-4 right-4 top-4 z-30 flex items-start justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur">
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span className="font-mono text-xs font-semibold text-white">
              {isActive ? `${camera.fps} FPS` : t.cameraTracking}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isActive && (
              <button
                type="button"
                onClick={camera.startCamera}
                disabled={camera.status === 'requesting'}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {camera.status === 'requesting' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {camera.status === 'requesting' ? t.starting : t.turnOn}
              </button>
            )}
            {isActive && (
              <button
                type="button"
                onClick={camera.stopCamera}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/70"
              >
                <CameraOff className="h-4 w-4" />
                {t.turnOff}
              </button>
            )}
          </div>
        </div>

        {/* Loading pose engine */}
        {isActive && !camera.poseReady && (
          <div className="absolute inset-x-0 bottom-16 z-30 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs text-slate-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t.loadingPose}
            </span>
          </div>
        )}

        {/* Blocked / error banner */}
        {blocked && (
          <div className="absolute inset-x-4 bottom-4 z-30 flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-[#121218]/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <p className="text-xs leading-relaxed text-slate-200">{camera.errorMessage}</p>
            </div>
            {camera.status !== 'unsupported' && (
              <button
                type="button"
                onClick={camera.startCamera}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t.retry}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
