import { create } from "zustand";

const API_BASE = "http://localhost:3000/api/v1";

export const useProgramScheduleStore = create((set, get) => ({
  // --- STATE AWAL KOSONG (Menunggu DB) ---
  activeProgram: null,
  weeklySchedule: null,
  programHistory: [],
  isLoadingApi: false,

  // --- ASYNC API FETCH PROGRAM DARI BACKEND ---
  // --- ASYNC API FETCH PROGRAM DARI BACKEND ---
  fetchProgramFromApi: async () => {
    set({ isLoadingApi: true });
    try {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      
      if (!token || !userStr) {
        set({ isLoadingApi: false });
        return null;
      }

      const user = JSON.parse(userStr);
      const patientId = user.id; // Asumsi ID pasien disimpen di sini pas fetch /patients/me

      // Tembak endpoint sesuai rute lu: /programs/patient/:patientId
      const res = await fetch(`${API_BASE}/programs/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        
        if (result.data) {
          const p = result.data; 
          
          // Asumsi relasinya bernama 'weekly_targets' atau 'weekly_schedules' dari query Supabase lu
          // Sesuaikan nama propertinya sama output JSON lu
          const schedules = p.weekly_targets || p.weekly_schedules || [];

          const formattedProg = {
            id: p.id,
            patientId: p.patient_id,
            programDurationWeeks: schedules.length || 1, 
            startDate: p.start_date,
            endDate: p.end_date,
            
            // Map status DB lu ('active', 'completed') ke status UI
            status: p.status === "completed" ? "Completed / Review Required" : "Active",
            
            totalCompletedSessions: schedules.reduce((acc, curr) => acc + (curr.completed_sessions || 0), 0),
          };

          const currentWeek = schedules.length > 0 ? schedules[0] : null;
          const formattedSchedule = currentWeek ? {
            id: currentWeek.id,
            programId: p.id,
            weekNumber: 1, 
            frequencyPerWeek: currentWeek.target_sessions || 3,
            restIntervalDays: 1, 
          } : null;

          set({ 
            activeProgram: formattedProg, 
            weeklySchedule: formattedSchedule,
            isLoadingApi: false 
          });

          return formattedProg;
        }
      }
    } catch (err) {
      console.error("Gagal menarik data program dari DB:", err.message);
    }
    
    set({ isLoadingApi: false, activeProgram: null, weeklySchedule: null });
    return null;
  },

  // --- DEV / MOCK STATUS TOGGLE (Biar tombol di UI lu tetep jalan pas ngetes) ---
  setMockStatus: (status) => {
    set((state) => ({
      activeProgram: state.activeProgram
        ? { ...state.activeProgram, status }
        : null,
    }));
  },
}));