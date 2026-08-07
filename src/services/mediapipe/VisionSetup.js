// src/services/mediapipe/visionSetup.js
import { FilesetResolver, HandLandmarker, PoseLandmarker } from '@mediapipe/tasks-vision';

export const setupMediaPipe = async ({ numHands = 2 } = {}) => {
  // WASM tetep narik dari CDN biar lu ga pusing setup MIME types server
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  
  // HandLandmarker narik file dari komputer lu sendiri
  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/hand_landmarker.task", 
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: numHands,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55
  });

  // PoseLandmarker juga narik dari komputer lu
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/pose_landmarker_lite.task", 
      delegate: "GPU"
    },
    runningMode: "VIDEO",
  });

  return { hand: handLandmarker, pose: poseLandmarker };
};