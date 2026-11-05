/** Canvas overlay that draws the tracked skeleton and joint angles. */

import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../lib/pose';
import type { FormStatus, JointAngles, Landmark } from '../types';

interface Props {
  landmarks: Landmark[];
  angles: JointAngles;
  status: FormStatus;
  mirrored?: boolean;
}

const STATUS_COLORS: Record<FormStatus, string> = {
  correct: '#22d3a8',
  warning: '#fbbf24',
  incorrect: '#f43f5e',
  idle: '#64748b',
};

export function SkeletonOverlay({ landmarks, angles, status, mirrored = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (!landmarks.length) return;

    const color = STATUS_COLORS[status] ?? STATUS_COLORS.idle;
    const toX = (x: number) => (mirrored ? 1 - x : x) * width;
    const toY = (y: number) => y * height;

    // Bones
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    for (const [start, end] of POSE_CONNECTIONS) {
      const a = landmarks[start];
      const b = landmarks[end];
      if (!a || !b) continue;
      if ((a.visibility ?? 1) < 0.45 || (b.visibility ?? 1) < 0.45) continue;
      ctx.beginPath();
      ctx.moveTo(toX(a.x), toY(a.y));
      ctx.lineTo(toX(b.x), toY(b.y));
      ctx.stroke();
    }

    // Joints
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#f8fafc';
    for (const index of [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) {
      const lm = landmarks[index];
      if (!lm || (lm.visibility ?? 1) < 0.45) continue;
      ctx.beginPath();
      ctx.arc(toX(lm.x), toY(lm.y), 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Angle badge near the knees / elbows
    ctx.shadowBlur = 0;
    const angle = angles.left_knee ?? angles.left_elbow ?? angles.left_plank_line;
    const badgeLandmark = angles.left_knee !== undefined ? landmarks[25] : landmarks[13];
    if (angle !== undefined && badgeLandmark) {
      const label = `${Math.round(angle)}°`;
      const bx = toX(badgeLandmark.x) + 14;
      const by = toY(badgeLandmark.y);
      ctx.font = '600 13px Inter, system-ui, sans-serif';
      const padding = 7;
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = `${color}22`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by - 13, textWidth + padding * 2, 24, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(label, bx + padding, by + 4);
    }
  }, [landmarks, angles, status, mirrored]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
    />
  );
}
