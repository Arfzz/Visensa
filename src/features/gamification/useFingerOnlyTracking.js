import { useEffect, useRef } from 'react';
import { useVisionStore } from '../../store/zustand/VisionStore';

// Landmark mapping (MediaPipe Hands 21 Keypoints)
// Index: Tip 8, PIP 6, MCP 5
// Middle: Tip 12, PIP 10, MCP 9
// Ring: Tip 16, PIP 14, MCP 13
// Pinky: Tip 20, PIP 18, MCP 17
const FINGERS = [
  { name: 'pinky', tip: 20, mcp: 17 },
  { name: 'ring', tip: 16, mcp: 13 },
  { name: 'middle', tip: 12, mcp: 9 },
  { name: 'index', tip: 8, mcp: 5 },
];

function getDistance3D(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function useFingerOnlyTracking() {
  // Target flexion angles (in radians: 0 = extended, 1.2 = flexed)
  const fingerAnglesRef = useRef({
    pinky: 0,
    ring: 0,
    middle: 0,
    index: 0,
  });

  useEffect(() => {
    const unsubscribe = useVisionStore.subscribe((state) => {
      const { handLandmarks } = state;
      if (!handLandmarks || handLandmarks.length === 0) return;

      const singleHand = Array.isArray(handLandmarks[0]) ? handLandmarks[0] : handLandmarks;
      const wrist = singleHand[0];
      if (!wrist) return;

      for (let i = 0; i < FINGERS.length; i++) {
        const { name, tip, mcp } = FINGERS[i];
        const tipPoint = singleHand[tip];
        const mcpPoint = singleHand[mcp];

        if (!tipPoint || !mcpPoint) continue;

        const tipToWrist = getDistance3D(tipPoint, wrist);
        const mcpToWrist = getDistance3D(mcpPoint, wrist);

        if (mcpToWrist === 0) continue;

        // Ratio: lower value means flexed inward toward wrist
        const ratio = tipToWrist / mcpToWrist;

        // Map ratio [1.1, 1.6] -> flexion angle [1.2, 0.0]
        let angle = 0;
        if (ratio <= 1.45) {
          const norm = Math.max(0, Math.min(1, (1.45 - ratio) / 0.35));
          angle = norm * 1.2;
        }

        fingerAnglesRef.current[name] = angle;
      }
    });

    return () => unsubscribe();
  }, []);

  return fingerAnglesRef;
}
