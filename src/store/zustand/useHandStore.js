import { create } from "zustand";

/**
 * High-performance state store for tracking real-time 60fps hand tracking data.
 * Employs Zustand's non-reactive/transient updates to prevent component re-render loops.
 */
export const RESET_POSE = Object.freeze({
  upper_arm:  { x: Math.PI / 2, y: 0, z: 0 },
  lower_arm:  { x: 0, y: 0, z: 0 },
  wrist:      { x: Math.PI / 3, y: 0, z: 0 },
  thumb_mcp:  { x: 0, y: 0, z: 0 }, thumb_pip:  { x: 0, y: 0, z: 0 }, thumb_dip:  { x: 0, y: 0, z: 0 },
  index_mcp:  { x: 0, y: 0, z: 0 }, index_pip:  { x: 0, y: 0, z: 0 }, index_dip:  { x: 0, y: 0, z: 0 },
  middle_mcp: { x: 0, y: 0, z: 0 }, middle_pip: { x: 0, y: 0, z: 0 }, middle_dip: { x: 0, y: 0, z: 0 },
  ring_mcp:   { x: 0, y: 0, z: 0 }, ring_pip:   { x: 0, y: 0, z: 0 }, ring_dip:   { x: 0, y: 0, z: 0 },
  pinky_mcp:  { x: 0, y: 0, z: 0 }, pinky_pip:  { x: 0, y: 0, z: 0 }, pinky_dip:  { x: 0, y: 0, z: 0 },
});

export const useHandStore = create((set) => ({
  handPose: RESET_POSE,

  // Set whole handpose payload
  setHandPose: (pose) => set({ handPose: pose }),

  // Bounding box constraints for clinical/reachable target coordinates
  targetPosition: { x: 2, y: -8, z: -15 },

  // Instantly shifts the holographic target to a random coordinate within reachable bounds
  relocateTarget: () => set({
    targetPosition: {
      x: (Math.random() - 0.5) * 8 + 2,     // reachable lateral bounds
      y: (Math.random() - 0.5) * 6 - 8,     // vertical bounds aligned with first-person horizontal lay
      z: -(Math.random() * 15 + 15),        // depth bounds extending forward from shoulder
    }
  }),
}));
