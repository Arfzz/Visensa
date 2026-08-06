import { create } from "zustand";

const API_BASE = "http://localhost:3000/api/v1";

export const useProgramScheduleStore = create((set, get) => ({
  // --- STATE AWAL ---
  activeProgram: null,
  weeklySchedule: null,
  programHistory: [],
  isLoadingApi: false,

  // --- ASYNC API FETCH PROGRAM DARI BACKEND (Mendukung ID pasien spesifik) ---
  fetchProgramFromApi: async (patientIdOverride = null) => {
    set({ isLoadingApi: true });
    try {
      const token = localStorage.getItem("accessToken");
      let patientId = patientIdOverride;

      if (!patientId) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          patientId = user.id;
        }
      }

      if (!patientId) {
        set({ isLoadingApi: false });
        return null;
      }

      // Tembak API backend: /programs/patient/:patientId
      const res = await fetch(`${API_BASE}/programs/patient/${patientId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const result = await res.json();

        if (result.data) {
          const p = result.data;
          const schedules = p.weekly_schedules || p.weekly_targets || [];

          const formattedProg = {
            id: p.id,
            patientId: p.patient_id,
            programDurationWeeks: schedules.length || 4,
            startDate: p.start_date,
            endDate: p.end_date,
            status: p.status === "completed" ? "Completed / Review Required" : "Active",
            totalCompletedSessions: schedules.reduce(
              (acc, curr) => acc + (curr.completed_sessions || 0),
              0
            ),
          };

          const currentWeek = schedules.length > 0 ? schedules[0] : null;
          const formattedSchedule = currentWeek
            ? {
                id: currentWeek.id,
                programId: p.id,
                weekNumber: 1,
                frequencyPerWeek: currentWeek.target_sessions || 3,
                restIntervalDays: 1,
              }
            : {
                frequencyPerWeek: 3,
                restIntervalDays: 1,
              };

          set({
            activeProgram: formattedProg,
            weeklySchedule: formattedSchedule,
            isLoadingApi: false,
          });

          return { activeProgram: formattedProg, weeklySchedule: formattedSchedule };
        }
      }
    } catch (err) {
      console.warn("Fetch program DB notice:", err.message);
    }

    set({ isLoadingApi: false });
    return null;
  },

  // --- DEV / MOCK STATUS TOGGLE ---
  setMockStatus: (status) => {
    set((state) => ({
      activeProgram: state.activeProgram
        ? { ...state.activeProgram, status }
        : null,
    }));
  },
}));