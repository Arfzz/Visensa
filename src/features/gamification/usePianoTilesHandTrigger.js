import { useEffect, useRef, useState } from 'react';
import { useVisionStore } from '../../store/zustand/VisionStore';

// --- MIRRORED FINGER LANDMARK MAPPING (MEDIAPIPE HANDS) ---
// Wrist: 0
// Lane 0 (Far Left): Pinky (Tip 20, PIP 18, MCP 17)
// Lane 1 (Mid Left): Ring (Tip 16, PIP 14, MCP 13)
// Lane 2 (Mid Right): Middle (Tip 12, PIP 10, MCP 9)
// Lane 3 (Far Right): Index (Tip 8, PIP 6, MCP 5)
const FINGER_LANDMARKS = [
  { lane: 0, finger: 'Pinky', tip: 20, pip: 18, mcp: 5 },
  { lane: 1, finger: 'Ring', tip: 16, pip: 14, mcp: 13 },
  { lane: 2, finger: 'Middle', tip: 12, pip: 10, mcp: 9 },
  { lane: 3, finger: 'Index', tip: 8, pip: 6, mcp: 5 },
];

// Inline 3D Euclidean distance (Zero allocation)
function getDistance3D(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function usePianoTilesHandTrigger({
  onLaneHit,
  enabled = true,
  cooldownMs = 280, // Cooldown (ms) per finger to prevent spam hits
  flexionThreshold = 1.45, // Ratio threshold: Tip-Wrist / MCP-Wrist
  releaseThreshold = 1.60, // Release threshold to reset tap trigger
}) {
  const [fingerRatios, setFingerRatios] = useState([2.0, 2.0, 2.0, 2.0]);
  const [activeTriggers, setActiveTriggers] = useState([false, false, false, false]);

  // Zero-GC Pre-allocated Buffers & Refs
  const ratiosBufferRef = useRef([2.0, 2.0, 2.0, 2.0]);
  const activeTriggersRef = useRef([false, false, false, false]);
  const lastTriggerTimesRef = useRef([0, 0, 0, 0]);
  const fingerFlexedStatesRef = useRef([false, false, false, false]);
  const lastStateUpdateRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = useVisionStore.subscribe((state) => {
      const { handLandmarks } = state;
      if (!handLandmarks || handLandmarks.length === 0) return;

      const singleHand = Array.isArray(handLandmarks[0]) ? handLandmarks[0] : handLandmarks;
      const wrist = singleHand[0];
      if (!wrist) return;

      const now = performance.now();
      let hasRatioChange = false;

      for (let i = 0; i < 4; i++) {
        const { lane, tip, mcp } = FINGER_LANDMARKS[i];
        const tipPoint = singleHand[tip];
        const mcpPoint = singleHand[mcp];

        if (!tipPoint || !mcpPoint) continue;

        const tipToWrist = getDistance3D(tipPoint, wrist);
        const mcpToWrist = getDistance3D(mcpPoint, wrist);

        if (mcpToWrist === 0) continue;

        const ratio = Math.round((tipToWrist / mcpToWrist) * 100) / 100;
        if (Math.abs(ratio - ratiosBufferRef.current[lane]) > 0.04) {
          ratiosBufferRef.current[lane] = ratio;
          hasRatioChange = true;
        }

        const timeSinceLastTrigger = now - lastTriggerTimesRef.current[lane];
        const isFlexed = ratio <= flexionThreshold;
        const isReleased = ratio >= releaseThreshold;

        if (isFlexed && !fingerFlexedStatesRef.current[lane] && timeSinceLastTrigger >= cooldownMs) {
          fingerFlexedStatesRef.current[lane] = true;
          lastTriggerTimesRef.current[lane] = now;
          activeTriggersRef.current[lane] = true;

          if (typeof onLaneHit === 'function') {
            onLaneHit(lane);
          }

          setTimeout(() => {
            activeTriggersRef.current[lane] = false;
            setActiveTriggers([...activeTriggersRef.current]);
          }, 150);

          hasRatioChange = true;
        } else if (isReleased) {
          fingerFlexedStatesRef.current[lane] = false;
        }
      }

      // Throttle React state updates to discrete changes / max 10 Hz for HUD tuning
      if (hasRatioChange && now - lastStateUpdateRef.current > 100) {
        lastStateUpdateRef.current = now;
        setFingerRatios([...ratiosBufferRef.current]);
        setActiveTriggers([...activeTriggersRef.current]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, cooldownMs, flexionThreshold, releaseThreshold, onLaneHit]);

  return {
    fingerRatios,
    activeTriggers,
  };
}
