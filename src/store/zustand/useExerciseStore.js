import { create } from 'zustand';

export const useExerciseStore = create((set) => ({
  exerciseType: 'OPEN_CLOSE',
  repCount: 0,
  phase: 'WAITING_OPEN',
  avgDistance: 0,
  thresholdOpen: 0.38,
  thresholdClose: 0.24,

  // --- ACTIONS ---
  addRepCount: () => set((state) => ({ repCount: state.repCount + 1 })),
  setPhase: (phase) => set({ phase }),
  setExerciseType: (type) => set({ exerciseType: type }),
  setAvgDistance: (distance) => set({ avgDistance: distance }),
  setThresholds: (open, close) => set({ thresholdOpen: open, thresholdClose: close }),
  resetExercise: () => set({ repCount: 0, phase: 'WAITING_OPEN', avgDistance: 0 }),
}));
