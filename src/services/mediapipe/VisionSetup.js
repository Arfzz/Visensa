// src/services/mediapipe/visionSetup.js
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export const setupMediaPipe = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  
  // Inisialisasi HandLandmarker pakai file .task yang udah lu taruh di public/models
  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/hand_landmarker.task", 
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.65
  });

  return handLandmarker;
};