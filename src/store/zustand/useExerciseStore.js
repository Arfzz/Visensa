import { create } from "zustand";

export const EXERCISES_LIST = [
  { id: 1, title: "Open & close — gentle", targetReps: 5 },
  { id: 2, title: "Wrist flexion/extension", targetReps: 5 },
  { id: 3, title: "Pinch grip — coin", targetReps: 5 },
  { id: 4, title: "Wrist deviation — floating", targetReps: 5 },
  { id: 5, title: "Finger tap sequence", targetReps: 5 },
  { id: 6, title: "Static open hold", targetReps: 5 },
  { id: 7, title: "Single finger lift", targetReps: 5 },
  { id: 8, title: "Fist hold", targetReps: 1 },
];

export const useExerciseStore = create((set, get) => ({
  activeExerciseId: 1, 
  repCount: 0,
  targetReps: 5,
  phase: "WAITING_OPEN",
  isCompleted: false,
  isSessionFinished: false,
  elapsedTime: 0,
  totalElapsedTime: 0,
  isTimerRunning: true,
  avgDistance: 0,
  thresholdOpen: 0.35,
  thresholdClose: 0.22,
  holdTimeRemaining: 10,

  // --- ACTIONS ---
  setHoldTimeRemaining: (time) => set({ holdTimeRemaining: time }),
  addRep: () => {
    const nextCount = get().repCount + 1;
    const target = get().targetReps;
    const completed = nextCount >= target;

    set({
      repCount: nextCount,
      isCompleted: completed,
      isTimerRunning: !completed,
    });
  },

  completeExercise: () => {
    set({
      repCount: get().targetReps,
      isCompleted: true,
      isTimerRunning: false,
      phase: "COMPLETED",
    });
  },

  setPhase: (phase) => set({ phase }),

  tickTimer: () => {
    if (get().isTimerRunning && !get().isCompleted && !get().isSessionFinished) {
      set((state) => ({ 
        elapsedTime: state.elapsedTime + 1,
        totalElapsedTime: state.totalElapsedTime + 1 
      }));
    }
  },

  resetTimer: () => set({ elapsedTime: 0, isTimerRunning: true }),

  nextExercise: () => {
    const currentId = get().activeExerciseId;
    if (currentId >= EXERCISES_LIST.length) {
      set({
        isSessionFinished: true,
        isTimerRunning: false,
      });
      return;
    }

    const nextId = currentId + 1;
    const exercise = EXERCISES_LIST.find((e) => e.id === nextId) || EXERCISES_LIST[0];

    set({
      activeExerciseId: nextId,
      repCount: 0,
      targetReps: exercise.targetReps,
      phase: "WAITING_OPEN",
      isCompleted: false,
      elapsedTime: 0,
      isTimerRunning: true,
      holdTimeRemaining: 10,
    });
  },

  setActiveExerciseId: (id) => {
    const exercise = EXERCISES_LIST.find((e) => e.id === id) || EXERCISES_LIST[0];
    set({
      activeExerciseId: exercise.id,
      repCount: 0,
      targetReps: exercise.targetReps,
      phase: "WAITING_OPEN",
      isCompleted: false,
      isSessionFinished: false,
      elapsedTime: 0,
      totalElapsedTime: 0,
      isTimerRunning: true,
      holdTimeRemaining: 10,
    });
  },

  endSession: () => {
    set({
      isSessionFinished: true,
      isTimerRunning: false,
    });
  },

  resetExercise: () =>
    set({
      repCount: 0,
      phase: "WAITING_OPEN",
      isCompleted: false,
      isSessionFinished: false,
      elapsedTime: 0,
      totalElapsedTime: 0,
      isTimerRunning: true,
      avgDistance: 0,
      holdTimeRemaining: 10,
    }),
}));
