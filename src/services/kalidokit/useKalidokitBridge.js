import { useEffect } from "react";
import { useVisionStore } from "../../store/zustand/VisionStore";
import { useHandStore, RESET_POSE } from "../../store/zustand/useHandStore";
import { OneEuroFilter3D } from "../filters/OneEuroFilter";
import * as Kalidokit from "kalidokit";

const ZERO = { x: 0, y: 0, z: 0 };

// --- PRE-ALLOCATED ONE EURO FILTERS (OUTSIDE LOOP) ---
const jointFilters = {
  upper_arm: new OneEuroFilter3D(1.0, 0.005),
  lower_arm: new OneEuroFilter3D(1.0, 0.005),
  wrist:     new OneEuroFilter3D(1.0, 0.005),
};

export function useKalidokitBridge() {
  useEffect(() => {
    let lastSolveTime = 0;
    let lastLogTime   = 0;

    const THROTTLE_MS = 1000 / 30;

    const unsubscribe = useVisionStore.subscribe((state) => {
      const now = performance.now();
      if (now - lastSolveTime < THROTTLE_MS) return;
      lastSolveTime = now;

      const { handLandmarks, poseLandmarks, poseWorldLandmarks } = state;

      // ── FIX #3: Guard yang benar ────────────────────────────────────
      if (!handLandmarks && (!poseLandmarks || !poseWorldLandmarks)) {
        jointFilters.upper_arm.reset();
        jointFilters.lower_arm.reset();
        jointFilters.wrist.reset();
        useHandStore.getState().setHandPose(RESET_POSE);
        return;
      }

      try {
        let handSolved = null;
        let poseSolved = null;

        // ── 1. Solve Rotasi Jari & Pergelangan ─────────────────────────
        if (handLandmarks && handLandmarks.length > 0) {
          const singleHand = Array.isArray(handLandmarks[0]) ? handLandmarks[0] : handLandmarks;
          
          handSolved = Kalidokit.Hand.solve(singleHand, "Right");
        }

        // ── 2. Solve Rotasi Bahu & Siku ────────────────────────────────
        if (poseLandmarks && poseWorldLandmarks) {
          poseSolved = Kalidokit.Pose.solve(
            poseWorldLandmarks,
            poseLandmarks,
            { runtime: "mediapipe", video: null }
          );
        }

        const handPrefix = "Right";
        let upperArmRot = ZERO;
        let lowerArmRot = ZERO;

        if (poseWorldLandmarks) {
          const shoulder = poseWorldLandmarks[12];
          const elbow    = poseWorldLandmarks[14];
          const wrist    = poseWorldLandmarks[16];

          if (shoulder && elbow && wrist) {
            const ux = elbow.x - shoulder.x;
            const uy = elbow.y - shoulder.y;
            const uz = elbow.z - shoulder.z;

            const uxzLen = Math.sqrt(ux * ux + uz * uz);
            const elevAngle = Math.atan2(-uy, uxzLen); 

            const abdAngle = Math.atan2(-uz, ux);

            upperArmRot = { x: elevAngle, y: 0, z: abdAngle };

            const lx = wrist.x - elbow.x;
            const ly = wrist.y - elbow.y;
            const lz = wrist.z - elbow.z;
            const len = Math.sqrt(lx*lx + ly*ly + lz*lz);
            if (len > 0.001) {
              const elbowAngle = Math.atan2(
                Math.sqrt(ly*ly + lz*lz),
                lx
              );
              lowerArmRot = { x: elbowAngle * 0.8, y: 0, z: 0 };
            }
          }
        }

        const timestamp = now / 1000;
        const rawWrist = handSolved?.[`${handPrefix}Wrist`] ?? ZERO;

        const pose = {
          handedness: state.handedness || "Right",
          upper_arm: jointFilters.upper_arm.filter(upperArmRot, timestamp),
          lower_arm: jointFilters.lower_arm.filter(lowerArmRot, timestamp),
          wrist:     jointFilters.wrist.filter(rawWrist, timestamp),

          thumb_mcp:  handSolved?.[`${handPrefix}ThumbProximal`]       ?? ZERO,
          thumb_pip:  handSolved?.[`${handPrefix}ThumbIntermediate`]   ?? ZERO,
          thumb_dip:  handSolved?.[`${handPrefix}ThumbDistal`]         ?? ZERO,
          index_mcp:  handSolved?.[`${handPrefix}IndexProximal`]       ?? ZERO,
          index_pip:  handSolved?.[`${handPrefix}IndexIntermediate`]   ?? ZERO,
          index_dip:  handSolved?.[`${handPrefix}IndexDistal`]         ?? ZERO,
          middle_mcp: handSolved?.[`${handPrefix}MiddleProximal`]      ?? ZERO,
          middle_pip: handSolved?.[`${handPrefix}MiddleIntermediate`]  ?? ZERO,
          middle_dip: handSolved?.[`${handPrefix}MiddleDistal`]        ?? ZERO,
          ring_mcp:   handSolved?.[`${handPrefix}RingProximal`]        ?? ZERO,
          ring_pip:   handSolved?.[`${handPrefix}RingIntermediate`]    ?? ZERO,
          ring_dip:   handSolved?.[`${handPrefix}RingDistal`]          ?? ZERO,
          pinky_mcp:  handSolved?.[`${handPrefix}LittleProximal`]      ?? ZERO,
          pinky_pip:  handSolved?.[`${handPrefix}LittleIntermediate`]  ?? ZERO,
          pinky_dip:  handSolved?.[`${handPrefix}LittleDistal`]        ?? ZERO,
        };

        useHandStore.getState().setHandPose(pose);

        // Throttled debug log (Opsional: aktifkan jika window.__debugBridge = true)
        if (window.__debugBridge && now - lastLogTime > 1000) {
          console.log("[Bridge] handSolved keys:", handSolved ? Object.keys(handSolved) : "null");
          console.log("[Bridge] handSolved sample (wrist):", handSolved?.RightWrist, "| index_mcp:", handSolved?.RightIndexProximal);
          console.log("[Bridge] pose sent to store:", {
            wrist: pose.wrist,
            index_mcp: pose.index_mcp,
            lower_arm: pose.lower_arm,
          });
          lastLogTime = now;
        }

      } catch (error) {
        if (now - lastLogTime > 2000) {
          console.error("[Kalidokit Bridge] Kinematics solver error:", error);
          lastLogTime = now;
        }
      }
    });

    return unsubscribe;
  }, []);
}

export default useKalidokitBridge;
