import { useEffect } from "react";
import { useVisionStore } from "../../store/zustand/VisionStore";
import { useHandStore } from "../../store/zustand/useHandStore";
import * as Kalidokit from "kalidokit";

/**
 * Custom hook acting as an imperative bridge between MediaPipe landmarks and R3F bone poses.
 * Subscribes to the VisionStore, solves the kinematic rotations via Kalidokit, and writes
 * directly to useHandStore's handPose.
 */
export function useKalidokitBridge() {
  useEffect(() => {
    let lastLandmarks = null;
    let lastLogTime = 0;

    const unsubscribe = useVisionStore.subscribe((state) => {
      const landmarks = state.handLandmarks;
      
      // Avoid processing if landmarks haven't changed or are null
      if (!landmarks || landmarks === lastLandmarks) return;
      lastLandmarks = landmarks;

      const handedness = state.handedness || "Right";

      try {
        // FORCE LEFT HAND CALCULATION: Hardcoded to "Left" since the 3D model is natively a Left Hand
        const solved = Kalidokit.Hand.solve(landmarks, "Left");
        if (!solved) return;

        const prefix = "Left";

        // Map Kalidokit's camelCase joint outputs to the store's snake_case schema
        const pose = {
          wrist: solved[`${prefix}Wrist`] || { x: 0, y: 0, z: 0 },
          thumb_mcp: solved[`${prefix}ThumbProximal`] || { x: 0, y: 0, z: 0 },
          thumb_pip: solved[`${prefix}ThumbIntermediate`] || { x: 0, y: 0, z: 0 },
          thumb_dip: solved[`${prefix}ThumbDistal`] || { x: 0, y: 0, z: 0 },
          index_mcp: solved[`${prefix}IndexProximal`] || { x: 0, y: 0, z: 0 },
          index_pip: solved[`${prefix}IndexIntermediate`] || { x: 0, y: 0, z: 0 },
          index_dip: solved[`${prefix}IndexDistal`] || { x: 0, y: 0, z: 0 },
          middle_mcp: solved[`${prefix}MiddleProximal`] || { x: 0, y: 0, z: 0 },
          middle_pip: solved[`${prefix}MiddleIntermediate`] || { x: 0, y: 0, z: 0 },
          middle_dip: solved[`${prefix}MiddleDistal`] || { x: 0, y: 0, z: 0 },
          ring_mcp: solved[`${prefix}RingProximal`] || { x: 0, y: 0, z: 0 },
          ring_pip: solved[`${prefix}RingIntermediate`] || { x: 0, y: 0, z: 0 },
          ring_dip: solved[`${prefix}RingDistal`] || { x: 0, y: 0, z: 0 },
          pinky_mcp: solved[`${prefix}LittleProximal`] || { x: 0, y: 0, z: 0 },
          pinky_pip: solved[`${prefix}LittleIntermediate`] || { x: 0, y: 0, z: 0 },
          pinky_dip: solved[`${prefix}LittleDistal`] || { x: 0, y: 0, z: 0 },
        };

        // Perform transient store update to bypass component re-render loops (60fps constraint)
        useHandStore.getState().setHandPose(pose);

        // Throttled logging (1-second intervals) to verify the solved output
        const now = performance.now();
        if (now - lastLogTime > 1000) {
          console.log(`[Kalidokit Bridge] Solved Hand Pose (${prefix}):`, pose);
          lastLogTime = now;
        }
      } catch (error) {
        // Log errors only periodically to prevent console spam
        const now = performance.now();
        if (now - lastLogTime > 2000) {
          console.error("[Kalidokit Bridge] Kinematics solver error:", error);
          lastLogTime = now;
        }
      }
    });

    return unsubscribe;
  }, []);
}
