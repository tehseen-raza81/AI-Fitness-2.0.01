/// <reference types="vite/client" />

declare module '@mediapipe/pose' {
  const Pose: any;
  export { Pose };
}

interface Window {
  Pose: any;
}
