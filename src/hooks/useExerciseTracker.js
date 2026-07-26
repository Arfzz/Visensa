import { useEffect, useRef } from 'react';
import { useVisionStore } from '../store/zustand/VisionStore';
import { useExerciseStore } from '../store/zustand/useExerciseStore';

const FINGERTIP_INDICES = [8, 12, 16, 20];
const WRIST_INDEX = 0;
const REPEAT_COOLDOWN_MS = 500;

export function useExerciseTracker() {
  const handLandmarks = useVisionStore((state) => state.handLandmarks);
  const { phase, thresholdOpen, thresholdClose, setPhase, addRepCount, setAvgDistance } = useExerciseStore();
  const lastRepTimeRef = useRef(0);

  useEffect(() => {
    // --- GUARD CLAUSE ---
    if (!handLandmarks || handLandmarks.length < 21) return;

    // --- EUCLIDEAN DISTANCE CALCULATION ---
    const wrist = handLandmarks[WRIST_INDEX];
    let totalDistance = 0;

    for (let i = 0; i < FINGERTIP_INDICES.length; i++) {
      const tip = handLandmarks[FINGERTIP_INDICES[i]];
      totalDistance += Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
    }

    const currentAvgDistance = totalDistance / FINGERTIP_INDICES.length;
    setAvgDistance(Number(currentAvgDistance.toFixed(3)));

    // --- STATE MACHINE LOGIC ---
    const now = Date.now();

    if (currentAvgDistance > thresholdOpen && phase !== 'WAITING_CLOSE') {
      setPhase('WAITING_CLOSE');
      return;
    }

    if (
      currentAvgDistance < thresholdClose &&
      phase === 'WAITING_CLOSE' &&
      now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
    ) {
      lastRepTimeRef.current = now;
      addRepCount();
      setPhase('WAITING_OPEN');
    }
  }, [handLandmarks, phase, thresholdOpen, thresholdClose, setPhase, addRepCount, setAvgDistance]);
}
