import { create } from "zustand";

/**
 * High-performance state store for tracking real-time 60fps hand tracking data.
 * Employs Zustand's non-reactive/transient updates to prevent component re-render loops.
 */
export const useHandStore = create((set) => ({
  // Holds translation/rotation vectors for 15 key bones
  handPose: {
    wrist: { x: 0, y: 0, z: 0 },
    thumb_mcp: { x: 0, y: 0, z: 0 },
    thumb_pip: { x: 0, y: 0, z: 0 },
    thumb_dip: { x: 0, y: 0, z: 0 },
    index_mcp: { x: 0, y: 0, z: 0 },
    index_pip: { x: 0, y: 0, z: 0 },
    index_dip: { x: 0, y: 0, z: 0 },
    middle_mcp: { x: 0, y: 0, z: 0 },
    middle_pip: { x: 0, y: 0, z: 0 },
    middle_dip: { x: 0, y: 0, z: 0 },
    ring_mcp: { x: 0, y: 0, z: 0 },
    ring_pip: { x: 0, y: 0, z: 0 },
    ring_dip: { x: 0, y: 0, z: 0 },
    pinky_mcp: { x: 0, y: 0, z: 0 },
    pinky_pip: { x: 0, y: 0, z: 0 },
    pinky_dip: { x: 0, y: 0, z: 0 },
  },

  // Set whole handpose payload
  setHandPose: (pose) => set({ handPose: pose }),

  // Bounding box constraints for clinical/reachable target coordinates
  targetPosition: { x: 0, y: 15, z: 5 },

  // Instantly shifts the holographic target to a random coordinate within reachable bounds
  relocateTarget: () => set({
    targetPosition: {
      x: (Math.random() - 0.5) * 16,     // reachable lateral bounds
      y: (Math.random() - 0.5) * 10 + 5, // vertical bounds aligned with arm rest position
      z: (Math.random() - 0.5) * 12,     // depth bounds
    }
  }),
}));
