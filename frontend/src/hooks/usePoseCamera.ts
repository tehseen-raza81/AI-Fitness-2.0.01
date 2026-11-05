/**
 * Webcam + MediaPipe Pose pipeline.
 * Owns the camera stream, runs 33-point pose inference on every animation
 * frame, and hands a fully analysed frame to the consumer.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateForm, extractJointAngles, isFullBodyVisible } from '../lib/pose';
import type { ExerciseId, FormFeedback, JointAngles, Landmark } from '../types';

export interface PoseFrame {
  landmarks: Landmark[];
  angles: JointAngles;
  feedback: FormFeedback;
  fullBody: boolean;
  fps: number;
}

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error' | 'unsupported';

interface Options {
  exercise: ExerciseId;
  getStage: () => string;
  onFrame: (frame: PoseFrame) => void;
}

export function usePoseCamera({ exercise, getStage, onFrame }: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const fpsRef = useRef({ frames: 0, last: performance.now(), value: 0 });
  const startingRef = useRef(false);

  const exerciseRef = useRef(exercise);
  const getStageRef = useRef(getStage);
  const onFrameRef = useRef(onFrame);
  exerciseRef.current = exercise;
  getStageRef.current = getStage;
  onFrameRef.current = onFrame;

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [landmarkPreview, setLandmarkPreview] = useState<Landmark[]>([]);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const [fps, setFps] = useState(0);
  const [poseReady, setPoseReady] = useState(false);

  /* ----------------------------------------------------------------- */
  /* MediaPipe initialisation                                          */
  /* ----------------------------------------------------------------- */
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const mod = await import('@mediapipe/pose');
        const PoseCtor = (mod as any).Pose ?? (window as any).Pose;
        if (!PoseCtor) throw new Error('MediaPipe Pose failed to load');

        const pose = new PoseCtor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        pose.onResults((results: any) => {
          busyRef.current = false;
          if (!mountedRef.current) return;

          const now = performance.now();
          fpsRef.current.frames += 1;
          if (now - fpsRef.current.last >= 1000) {
            fpsRef.current.value = fpsRef.current.frames;
            fpsRef.current.frames = 0;
            fpsRef.current.last = now;
            setFps(fpsRef.current.value);
          }

          const raw = results?.poseLandmarks;
          if (!raw) {
            setLandmarkPreview([]);
            const empty: FormFeedback = {
              status: 'idle',
              score: 0,
              message_en: 'Step back so your full body is visible in the frame.',
              message_hi: 'Peechhe hato taaki poora shareer camera me dikhe.',
              current_angle: 0,
              target_range: [0, 180],
            };
            setFeedback(empty);
            onFrameRef.current({
              landmarks: [],
              angles: {},
              feedback: empty,
              fullBody: false,
              fps: fpsRef.current.value,
            });
            return;
          }

          const landmarks: Landmark[] = raw.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z ?? 0,
            visibility: lm.visibility ?? 1,
          }));

          const fullBody = isFullBodyVisible(landmarks);
          const angles = extractJointAngles(landmarks);
          const frameFeedback = evaluateForm(exerciseRef.current, angles, getStageRef.current());

          setLandmarkPreview(landmarks);
          setFeedback(frameFeedback);
          onFrameRef.current({
            landmarks,
            angles,
            feedback: frameFeedback,
            fullBody,
            fps: fpsRef.current.value,
          });
        });

        poseRef.current = pose;
        setPoseReady(true);
      } catch (err) {
        console.error('MediaPipe init failed', err);
        setErrorMessage('Pose engine could not be loaded. Check your internet connection and reload.');
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      try {
        poseRef.current?.close?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  /* ----------------------------------------------------------------- */
  /* Camera controls                                                   */
  /* ----------------------------------------------------------------- */
  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus((prev) => (prev === 'denied' ? prev : 'idle'));
  }, []);

  const startCamera = useCallback(async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        setErrorMessage('This browser does not support camera access.');
        return;
      }

      setStatus('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus('active');
    } catch (err: any) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      setStatus(denied ? 'denied' : 'error');
      setErrorMessage(
        denied
          ? 'Camera permission was blocked. Allow camera access in your browser settings and try again.'
          : err?.message || 'Camera could not be started.'
      );
    } finally {
      startingRef.current = false;
    }
  }, []);

  /* ----------------------------------------------------------------- */
  /* Inference loop                                                    */
  /* ----------------------------------------------------------------- */
  useEffect(() => {
    const loop = async () => {
      const video = videoRef.current;
      const pose = poseRef.current;

      if (video && pose && video.readyState >= 2 && !busyRef.current) {
        busyRef.current = true;
        try {
          await pose.send({ image: video });
        } catch {
          busyRef.current = false;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    if (status === 'active' && poseReady) {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [status, poseReady]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    status,
    errorMessage,
    landmarks: landmarkPreview,
    feedback,
    fps,
    poseReady,
    startCamera,
    stopCamera,
  };
}
