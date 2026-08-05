import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- DATE HELPER UTILITIES ---
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getOffsetDateString = (offsetDays, fromDateStr = null) => {
  const date = fromDateStr ? new Date(fromDateStr) : new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- SCHEDULE PARAMETERS HARD-CEILING VALIDATOR ---
// Enforces: frequencyPerWeek + ((frequencyPerWeek - 1) * restIntervalDays) <= 7
export const validateScheduleParams = (frequencyPerWeek, restIntervalDays) => {
  const freq = Math.max(1, Math.min(7, Number(frequencyPerWeek) || 1));
  const rest = Math.max(0, Math.min(6, Number(restIntervalDays) || 0));

  const totalRequiredDays = freq + (freq - 1) * rest;
  const isValid = totalRequiredDays <= 7;

  return {
    isValid,
    totalRequiredDays,
    errorMsg: isValid
      ? null
      : `Batas istirahat (${rest} hari) dengan ${freq}x sesi membutuhkan ${totalRequiredDays} hari, melebihi kapasitas 7 hari seminggu.`,
  };
};

// --- INITIAL MOCK PROGRAM DATA ---
const initialStartDate = getOffsetDateString(-14);
const initialEndDate = getOffsetDateString(0);

const initialProgram = {
  id: "prog_001",
  patientId: "pat_101",
  programDurationWeeks: 2,
  startDate: initialStartDate,
  endDate: initialEndDate,
  status: "Completed / Review Required",
  totalCompletedSessions: 6,
};

const initialSchedule = {
  id: "sched_001",
  programId: "prog_001",
  weekNumber: 1,
  frequencyPerWeek: 3,
  restIntervalDays: 1,
  activeDaysDistribution: [1, 3, 5],
};

export const useProgramScheduleStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      activeProgram: initialProgram,
      weeklySchedule: initialSchedule,
      programHistory: [initialProgram],

      // --- VALIDATOR HELPER METHOD ---
      checkScheduleValidity: (frequency, restInterval) => {
        return validateScheduleParams(frequency, restInterval);
      },

      // --- EVALUATE COMPLETION STATUS ---
      evaluateProgramStatus: () => {
        const { activeProgram, weeklySchedule } = get();
        if (!activeProgram || activeProgram.status === "Completed / Review Required") {
          return "Completed / Review Required";
        }

        const today = getTodayDateString();
        const totalRequiredSessions =
          activeProgram.programDurationWeeks * (weeklySchedule ? weeklySchedule.frequencyPerWeek : 3);

        const isTimeExpired = today > activeProgram.endDate;
        const isQuotaReached =
          activeProgram.totalCompletedSessions >= totalRequiredSessions;

        if (isTimeExpired || isQuotaReached) {
          const updatedProgram = {
            ...activeProgram,
            status: "Completed / Review Required",
          };
          set({ activeProgram: updatedProgram });
          return "Completed / Review Required";
        }

        return "Active";
      },

      // --- ACTION: CREATE NEW PROGRAM (D+1 START DATE DEFAULT) ---
      createProgram: ({
        patientId = "pat_101",
        programDurationWeeks = 4,
        frequencyPerWeek = 3,
        restIntervalDays = 1,
      }) => {
        const validation = validateScheduleParams(frequencyPerWeek, restIntervalDays);
        if (!validation.isValid) {
          return { success: false, error: validation.errorMsg };
        }

        const startDate = getOffsetDateString(1); // D+1 default
        const totalDays = programDurationWeeks * 7;
        const endDate = getOffsetDateString(totalDays - 1, startDate);

        const newProgramId = `prog_${Date.now()}`;
        const newScheduleId = `sched_${Date.now()}`;

        const newProgram = {
          id: newProgramId,
          patientId,
          programDurationWeeks: Number(programDurationWeeks),
          startDate,
          endDate,
          status: "Active",
          totalCompletedSessions: 0,
        };

        const newSchedule = {
          id: newScheduleId,
          programId: newProgramId,
          weekNumber: 1,
          frequencyPerWeek: Number(frequencyPerWeek),
          restIntervalDays: Number(restIntervalDays),
          activeDaysDistribution: Array.from(
            { length: frequencyPerWeek },
            (_, i) => i * (Number(restIntervalDays) + 1) + 1
          ),
        };

        set((state) => ({
          activeProgram: newProgram,
          weeklySchedule: newSchedule,
          programHistory: [newProgram, ...state.programHistory],
        }));

        return { success: true, program: newProgram };
      },

      // --- ACTION: COMPLETE EXERCISE SESSION ---
      completeSession: () => {
        const { activeProgram } = get();
        if (!activeProgram || activeProgram.status !== "Active") return;

        const updatedCount = activeProgram.totalCompletedSessions + 1;
        const updatedProgram = {
          ...activeProgram,
          totalCompletedSessions: updatedCount,
        };

        set({ activeProgram: updatedProgram });
        get().evaluateProgramStatus();
      },

      // --- ACTION: EXTEND PROGRAM (KEEP SCHEDULE, RE-ASSIGN D+1) ---
      extendProgram: (additionalWeeks = 2) => {
        const { activeProgram, weeklySchedule } = get();
        const freq = weeklySchedule ? weeklySchedule.frequencyPerWeek : 3;
        const rest = weeklySchedule ? weeklySchedule.restIntervalDays : 1;

        return get().createProgram({
          patientId: activeProgram ? activeProgram.patientId : "pat_101",
          programDurationWeeks: additionalWeeks,
          frequencyPerWeek: freq,
          restIntervalDays: rest,
        });
      },

      // --- ACTION: RE-ASSIGN PROGRAM (NEW SCHEDULE CONFIG, START D+1) ---
      reassignProgram: ({ programDurationWeeks, frequencyPerWeek, restIntervalDays }) => {
        const { activeProgram } = get();
        return get().createProgram({
          patientId: activeProgram ? activeProgram.patientId : "pat_101",
          programDurationWeeks,
          frequencyPerWeek,
          restIntervalDays,
        });
      },

      // --- ACTION: ASSIGN INITIAL PROGRAM (NEW PATIENT, START D+1) ---
      assignInitialProgram: ({ patientId, programDurationWeeks = 4, frequencyPerWeek = 3, restIntervalDays = 1 }) => {
        return get().createProgram({
          patientId,
          programDurationWeeks,
          frequencyPerWeek,
          restIntervalDays,
        });
      },

      // --- ACTION: DEV / MOCK STATUS TOGGLE ---
      setMockStatus: (status) => {
        set((state) => ({
          activeProgram: state.activeProgram
            ? { ...state.activeProgram, status }
            : null,
        }));
      },
    }),
    {
      name: "visensa_program_schedule_storage",
    }
  )
);
