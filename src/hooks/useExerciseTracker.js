import { useEffect, useRef } from "react";
import { useVisionStore } from "../store/zustand/VisionStore";
import { useExerciseStore } from "../store/zustand/useExerciseStore";

// MediaPipe Landmark Indices
const WRIST_INDEX = 0;
const INDEX_MCP_INDEX = 5;
const PALM_REF_INDEX = 9;
const RING_MCP_INDEX = 13;
const PINKY_MCP_INDEX = 17;
const REPEAT_COOLDOWN_MS = 400;

// Fingertip Indices
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;

// Scale & Translation Invariant Threshold Ratios
// Exercise 1: Open & Close (Normalized by Palm Length L0->L9)
const EX1_RATIO_OPEN = 1.65;
const EX1_RATIO_CLOSE = 1.25;

// Exercise 2: Wrist Flexion & Extension (Vertical Normalized Ratio L0->L9)
const EX2_FLEX_UP_THRESHOLD = -0.50;   // Stop pose (fingers up, deltaY negative)
const EX2_FLEX_DOWN_THRESHOLD = 0.15;   // Flexed pose (fingers down, deltaY positive)

// Exercise 3: Pinch Grip — Koin (Thumb & Index tip normalized by L0->L5)
const EX3_RATIO_PINCH = 0.35;
const EX3_RATIO_RELEASE = 0.85;

// Exercise 4: Wrist Deviation — Floating (Horizontal Normalized Ratio L0->L9)
const EX4_DEV_LEFT_THRESHOLD = -0.30;  // Tilted/deviated left (deltaX negative)
const EX4_DEV_RIGHT_THRESHOLD = 0.30;  // Tilted/deviated right (deltaX positive)

// Exercise 5: Finger Tap Sequence (Piano Tapping - Tip to Wrist vs MCP to Wrist ratio)
const EX5_TAP_THRESHOLD = 1.22;

// Exercise 6: Static Open Hold (3000ms / 3s hold duration)
const HOLD_DURATION_MS = 3000;

// Exercise 7: Single Finger Lift (Index Finger extended vs Middle/Ring/Pinky curled)
const EX7_EXTENDED_THRESHOLD = 1.60;
const EX7_CURLED_THRESHOLD = 1.25;

// Exercise 8: Resting Pose Stability (Neutral natural hand curve ratio & 10s hold timer)
const EX8_REST_MIN_RATIO = 1.25;
const EX8_REST_MAX_RATIO = 1.60;
const REST_DURATION_MS = 10000;

export function useExerciseTracker() {
  // --- STATE SELECTORS ---
  const handLandmarks = useVisionStore((state) => state.handLandmarks);

  const activeExerciseId = useExerciseStore((state) => state.activeExerciseId);
  const isCompleted = useExerciseStore((state) => state.isCompleted);
  const phase = useExerciseStore((state) => state.phase);

  const addRep = useExerciseStore((state) => state.addRep);
  const completeExercise = useExerciseStore((state) => state.completeExercise);
  const setPhase = useExerciseStore((state) => state.setPhase);

  const lastRepTimeRef = useRef(0);
  const holdStartTimeRef = useRef(null);
  const restStartTimeRef = useRef(null);

  // --- KINEMATICS & KINEMATIC STATE MACHINE ---
  useEffect(() => {
    if (isCompleted || !handLandmarks || handLandmarks.length < 21) {
      return;
    }

    const wrist = handLandmarks[WRIST_INDEX];
    const palmRef = handLandmarks[PALM_REF_INDEX];

    // Reference 3D Palm Length (Wrist L0 -> Middle MCP L9) for translation/scale invariance
    const palmLength = Math.hypot(
      palmRef.x - wrist.x,
      palmRef.y - wrist.y,
      palmRef.z - wrist.z
    );

    if (palmLength < 0.001) return;

    const now = Date.now();

    switch (activeExerciseId) {
      // --- EXERCISE 1: OPEN & CLOSE ---
      case 1: {
        let totalTipDistance = 0;
        const tips = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
        for (let i = 0; i < tips.length; i++) {
          const tip = handLandmarks[tips[i]];
          totalTipDistance += Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
        }

        const avgTipDistance = totalTipDistance / tips.length;
        const extensionRatio = avgTipDistance / palmLength;

        if (extensionRatio > EX1_RATIO_OPEN && phase === "WAITING_OPEN") {
          setPhase("WAITING_CLOSE");
          return;
        }

        if (
          extensionRatio < EX1_RATIO_CLOSE &&
          phase === "WAITING_CLOSE" &&
          now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
        ) {
          lastRepTimeRef.current = now;
          addRep();
          setPhase("WAITING_OPEN");
        }
        break;
      }

      // --- EXERCISE 2: WRIST FLEXION & EXTENSION ---
      case 2: {
        const deltaY = palmRef.y - wrist.y;
        const flexionRatio = deltaY / palmLength;

        if (phase !== "WAITING_UP" && phase !== "WAITING_DOWN") {
          setPhase("WAITING_UP");
          return;
        }

        if (flexionRatio < EX2_FLEX_UP_THRESHOLD && phase === "WAITING_UP") {
          setPhase("WAITING_DOWN");
          return;
        }

        if (
          flexionRatio > EX2_FLEX_DOWN_THRESHOLD &&
          phase === "WAITING_DOWN" &&
          now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
        ) {
          lastRepTimeRef.current = now;
          addRep();
          setPhase("WAITING_UP");
        }
        break;
      }

      // --- EXERCISE 3: PINCH GRIP (THUMB & INDEX OPPOSITION) ---
      case 3: {
        const thumbPt = handLandmarks[THUMB_TIP];
        const indexPt = handLandmarks[INDEX_TIP];
        const indexMcp = handLandmarks[INDEX_MCP_INDEX];

        const pinchDistance = Math.hypot(
          indexPt.x - thumbPt.x,
          indexPt.y - thumbPt.y,
          indexPt.z - thumbPt.z
        );

        const referenceDistance = Math.hypot(
          indexMcp.x - wrist.x,
          indexMcp.y - wrist.y,
          indexMcp.z - wrist.z
        );

        if (referenceDistance < 0.001) return;

        const pinchRatio = pinchDistance / referenceDistance;

        if (phase !== "WAITING_PINCH" && phase !== "WAITING_RELEASE") {
          setPhase("WAITING_PINCH");
          return;
        }

        if (pinchRatio < EX3_RATIO_PINCH && phase === "WAITING_PINCH") {
          setPhase("WAITING_RELEASE");
          return;
        }

        if (
          pinchRatio > EX3_RATIO_RELEASE &&
          phase === "WAITING_RELEASE" &&
          now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
        ) {
          lastRepTimeRef.current = now;
          addRep();
          setPhase("WAITING_PINCH");
        }
        break;
      }

      // --- EXERCISE 4: WRIST DEVIATION — FLOATING ---
      case 4: {
        const deltaX = palmRef.x - wrist.x;
        const deviationRatio = deltaX / palmLength;

        if (phase !== "WAITING_LEFT" && phase !== "WAITING_RIGHT") {
          setPhase("WAITING_LEFT");
          return;
        }

        if (deviationRatio < EX4_DEV_LEFT_THRESHOLD && phase === "WAITING_LEFT") {
          setPhase("WAITING_RIGHT");
          return;
        }

        if (
          deviationRatio > EX4_DEV_RIGHT_THRESHOLD &&
          phase === "WAITING_RIGHT" &&
          now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
        ) {
          lastRepTimeRef.current = now;
          addRep();
          setPhase("WAITING_LEFT");
        }
        break;
      }

      // --- EXERCISE 5: FINGER TAP SEQUENCE (PIANO TAPPING) ---
      case 5: {
        const validPhases = [
          "WAITING_INDEX_TAP",
          "WAITING_MIDDLE_TAP",
          "WAITING_RING_TAP",
          "WAITING_PINKY_TAP",
        ];

        if (!validPhases.includes(phase)) {
          setPhase("WAITING_INDEX_TAP");
          return;
        }

        const getTapRatio = (tipIdx, mcpIdx) => {
          const tip = handLandmarks[tipIdx];
          const mcp = handLandmarks[mcpIdx];
          const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
          const mcpDist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y, mcp.z - wrist.z);
          return mcpDist < 0.001 ? 99 : tipDist / mcpDist;
        };

        const indexTap = getTapRatio(INDEX_TIP, INDEX_MCP_INDEX) < EX5_TAP_THRESHOLD;
        const middleTap = getTapRatio(MIDDLE_TIP, PALM_REF_INDEX) < EX5_TAP_THRESHOLD;
        const ringTap = getTapRatio(RING_TIP, RING_MCP_INDEX) < EX5_TAP_THRESHOLD;
        const pinkyTap = getTapRatio(PINKY_TIP, PINKY_MCP_INDEX) < EX5_TAP_THRESHOLD;

        if (phase === "WAITING_INDEX_TAP" && indexTap) {
          setPhase("WAITING_MIDDLE_TAP");
          return;
        }

        if (phase === "WAITING_MIDDLE_TAP" && middleTap) {
          setPhase("WAITING_RING_TAP");
          return;
        }

        if (phase === "WAITING_RING_TAP" && ringTap) {
          setPhase("WAITING_PINKY_TAP");
          return;
        }

        if (
          phase === "WAITING_PINKY_TAP" &&
          pinkyTap &&
          now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
        ) {
          lastRepTimeRef.current = now;
          addRep();
          setPhase("WAITING_INDEX_TAP");
        }
        break;
      }

      // --- EXERCISE 6: STATIC OPEN HOLD (3s TIMER) ---
      case 6: {
        let totalTipDistance = 0;
        const tips = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
        for (let i = 0; i < tips.length; i++) {
          const tip = handLandmarks[tips[i]];
          totalTipDistance += Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
        }

        const avgTipDistance = totalTipDistance / tips.length;
        const extensionRatio = avgTipDistance / palmLength;
        const isOpenHand = extensionRatio > EX1_RATIO_OPEN;

        if (phase !== "WAITING_OPEN" && phase !== "HOLDING" && phase !== "WAITING_RELAX") {
          holdStartTimeRef.current = null;
          setPhase("WAITING_OPEN");
          return;
        }

        if (phase === "WAITING_OPEN" && isOpenHand) {
          holdStartTimeRef.current = Date.now();
          setPhase("HOLDING");
          return;
        }

        if (phase === "HOLDING") {
          if (!isOpenHand) {
            holdStartTimeRef.current = null;
            setPhase("WAITING_OPEN");
            return;
          }

          if (
            holdStartTimeRef.current &&
            now - holdStartTimeRef.current >= HOLD_DURATION_MS &&
            now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
          ) {
            lastRepTimeRef.current = now;
            holdStartTimeRef.current = null;
            addRep();
            setPhase("WAITING_RELAX");
            return;
          }
        }

        if (phase === "WAITING_RELAX" && extensionRatio < EX1_RATIO_CLOSE) {
          setPhase("WAITING_OPEN");
        }
        break;
      }

      // --- EXERCISE 7: SINGLE FINGER LIFT (INDEX POINTING ISOLATION) ---
      case 7: {
        const getExtensionRatio = (tipIdx) => {
          const tip = handLandmarks[tipIdx];
          const dist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
          return dist / palmLength;
        };

        const indexRatio = getExtensionRatio(INDEX_TIP);
        const middleRatio = getExtensionRatio(MIDDLE_TIP);
        const ringRatio = getExtensionRatio(RING_TIP);
        const pinkyRatio = getExtensionRatio(PINKY_TIP);

        const isIndexLifted =
          indexRatio > EX7_EXTENDED_THRESHOLD &&
          middleRatio < EX7_CURLED_THRESHOLD &&
          ringRatio < EX7_CURLED_THRESHOLD &&
          pinkyRatio < EX7_CURLED_THRESHOLD;

        const isIndexCurled = indexRatio < EX7_CURLED_THRESHOLD;

        if (phase !== "WAITING_LIFT" && phase !== "WAITING_RELAX") {
          setPhase("WAITING_LIFT");
          return;
        }

        if (phase === "WAITING_LIFT" && isIndexLifted) {
          setPhase("WAITING_RELAX");
          return;
        }

        if (
          phase === "WAITING_RELAX" &&
          isIndexCurled &&
          now - lastRepTimeRef.current > REPEAT_COOLDOWN_MS
        ) {
          lastRepTimeRef.current = now;
          addRep();
          setPhase("WAITING_LIFT");
        }
        break;
      }

      // --- EXERCISE 8: RESTING POSE STABILITY (PURE 10s HOLD TIMER) ---
      case 8: {
        let totalTipDistance = 0;
        const tips = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
        for (let i = 0; i < tips.length; i++) {
          const tip = handLandmarks[tips[i]];
          totalTipDistance += Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
        }

        const avgTipDistance = totalTipDistance / tips.length;
        const averageRatio = avgTipDistance / palmLength;
        const isRestingNeutral =
          averageRatio >= EX8_REST_MIN_RATIO && averageRatio <= EX8_REST_MAX_RATIO;

        if (phase !== "WAITING_REST" && phase !== "HOLDING_REST" && phase !== "COMPLETED") {
          restStartTimeRef.current = null;
          setPhase("WAITING_REST");
          return;
        }

        // WAITING_REST: Start 10s hold timer when hand enters neutral posture
        if (phase === "WAITING_REST" && isRestingNeutral) {
          restStartTimeRef.current = Date.now();
          setPhase("HOLDING_REST");
          return;
        }

        // HOLDING_REST: Monitor continuous 10-second hold
        if (phase === "HOLDING_REST") {
          // If user leaves neutral zone, reset timestamp cleanly
          if (!isRestingNeutral) {
            restStartTimeRef.current = null;
            setPhase("WAITING_REST");
            return;
          }

          // Complete session when 10,000ms is reached
          if (
            restStartTimeRef.current &&
            now - restStartTimeRef.current >= REST_DURATION_MS
          ) {
            restStartTimeRef.current = null;
            completeExercise();
            return;
          }
        }
        break;
      }

      default:
        break;
    }
  }, [
    handLandmarks,
    activeExerciseId,
    isCompleted,
    phase,
    addRep,
    completeExercise,
    setPhase,
  ]);
}

export default useExerciseTracker;
