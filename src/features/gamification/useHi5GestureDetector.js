import { useState, useEffect, useRef } from "react";
import { useVisionStore } from "../../store/zustand/VisionStore";

// --- 5-FINGER EXTENSION LANDMARK MAP ---
const FINGER_MAP = [
  { name: "Thumb", tip: 4, mcp: 2, minRatio: 1.25 },
  { name: "Index", tip: 8, mcp: 5, minRatio: 1.50 },
  { name: "Middle", tip: 12, mcp: 9, minRatio: 1.50 },
  { name: "Ring", tip: 16, mcp: 13, minRatio: 1.50 },
  { name: "Pinky", tip: 20, mcp: 17, minRatio: 1.45 },
];

function getDistance3D(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function useHi5GestureDetector({ enabled = true } = {}) {
  const [isHi5Detected, setIsHi5Detected] = useState(false);
  const [isHandVisible, setIsHandVisible] = useState(false);

  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setIsHi5Detected(false);
      setIsHandVisible(false);
      return;
    }

    const unsubscribe = useVisionStore.subscribe((state) => {
      const { handLandmarks } = state;
      if (!handLandmarks || handLandmarks.length === 0) {
        setIsHandVisible(false);
        setIsHi5Detected(false);
        return;
      }

      const singleHand = Array.isArray(handLandmarks[0]) ? handLandmarks[0] : handLandmarks;
      const wrist = singleHand[0];
      if (!wrist) return;

      const now = performance.now();
      if (now - lastUpdateRef.current < 60) return;
      lastUpdateRef.current = now;

      let extendedCount = 0;

      for (let i = 0; i < FINGER_MAP.length; i++) {
        const { tip, mcp, minRatio } = FINGER_MAP[i];
        const tipPoint = singleHand[tip];
        const mcpPoint = singleHand[mcp];

        if (!tipPoint || !mcpPoint) continue;

        const tipToWrist = getDistance3D(tipPoint, wrist);
        const mcpToWrist = getDistance3D(mcpPoint, wrist);

        if (mcpToWrist === 0) continue;

        const ratio = tipToWrist / mcpToWrist;
        if (ratio >= minRatio) {
          extendedCount++;
        }
      }

      const isDetected = extendedCount >= 4;
      setIsHandVisible(true);
      setIsHi5Detected(isDetected);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  return {
    isHi5Detected,
    isHandVisible,
  };
}

export default useHi5GestureDetector;
