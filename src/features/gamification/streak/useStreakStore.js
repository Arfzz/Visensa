import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- LOCAL DATE FORMATTER (YYYY-MM-DD) ---
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- GET RELATIVE DATE STRING (OFFSET IN DAYS) ---
const getRelativeDateString = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- DATE DIFFERENCE CALCULATOR ---
const getDaysDifference = (fromDateStr, toDateStr) => {
  if (!fromDateStr || !toDateStr) return Infinity;
  const fromDate = new Date(fromDateStr);
  const toDate = new Date(toDateStr);
  const diffTime = toDate.getTime() - fromDate.getTime();
  return Math.floor(diffTime / (1000 * 3600 * 24));
};

export const useStreakStore = create(
  persist(
    (set, get) => ({
      // --- STREAK STATE ---
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: null,
      lastActiveDate: null,
      todayActiveSeconds: 0,
      streakFreezeAvailable: 1,
      showStreakCelebration: false,
      dailyTargetSeconds: 60,

      // --- CHECK AND RESET DAILY PROGRESS ---
      checkDailyReset: () => {
        const today = getTodayDateString();
        const { lastActiveDate } = get();

        if (lastActiveDate !== today) {
          set({
            todayActiveSeconds: 0,
            lastActiveDate: today,
          });
        }
      },

      // --- ADD ACTIVE PLAYTIME & CHECK STREAK ---
      addActivePlaytime: (secondsToAdd) => {
        const today = getTodayDateString();
        const {
          todayActiveSeconds,
          lastCompletedDate,
          lastActiveDate,
          currentStreak,
          longestStreak,
          streakFreezeAvailable,
          dailyTargetSeconds,
        } = get();

        const currentActiveSecs = lastActiveDate !== today ? 0 : todayActiveSeconds;
        const updatedActiveSecs = currentActiveSecs + secondsToAdd;

        let newCurrentStreak = currentStreak;
        let newLongestStreak = longestStreak;
        let updatedFreeze = streakFreezeAvailable;
        let shouldCelebrate = false;
        let newCompletedDate = lastCompletedDate;

        if (updatedActiveSecs >= dailyTargetSeconds && lastCompletedDate !== today) {
          const daysGap = getDaysDifference(lastCompletedDate, today);

          if (!lastCompletedDate || daysGap === 1) {
            newCurrentStreak = currentStreak + 1;
          } else if (daysGap === 2 && updatedFreeze > 0) {
            updatedFreeze -= 1;
            newCurrentStreak = currentStreak + 1;
          } else {
            newCurrentStreak = 1;
          }

          newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
          newCompletedDate = today;
          shouldCelebrate = true;
        }

        set({
          todayActiveSeconds: updatedActiveSecs,
          lastActiveDate: today,
          lastCompletedDate: newCompletedDate,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          streakFreezeAvailable: updatedFreeze,
          showStreakCelebration: shouldCelebrate,
        });
      },

      // --- MANUAL STREAK FREEZE CONSUMPTION ---
      useStreakFreeze: () => {
        const { streakFreezeAvailable } = get();
        if (streakFreezeAvailable <= 0) return false;

        set({ streakFreezeAvailable: streakFreezeAvailable - 1 });
        return true;
      },

      // --- DISMISS CELEBRATION MODAL ---
      dismissCelebration: () => {
        set({ showStreakCelebration: false });
      },
      resetCelebrationState: () => {
        set({ showStreakCelebration: false });
      },

      // ==========================================
      // INFINITE SIMULATION / DEV CONTROLS ACTIONS
      // ==========================================

      // 1. Add +15s Playtime
      addFifteenSeconds: () => {
        get().addActivePlaytime(15);
      },

      // 2. Trigger 60s (Complete Daily Target for Current Day)
      triggerCompleteDaily: () => {
        const { todayActiveSeconds, dailyTargetSeconds } = get();
        const needed = Math.max(0, dailyTargetSeconds - todayActiveSeconds);
        get().addActivePlaytime(needed > 0 ? needed : 60);
      },

      // 3. Simulate Next Day & Complete (+1 Day Continuously, Unlimited)
      simulateNextDayAndComplete: () => {
        const { currentStreak, longestStreak } = get();
        const nextStreak = currentStreak + 1;
        const newLongest = Math.max(longestStreak, nextStreak);
        const yesterdayStr = getRelativeDateString(-1);
        const todayStr = getTodayDateString();

        set({
          currentStreak: nextStreak,
          longestStreak: newLongest,
          lastCompletedDate: todayStr,
          lastActiveDate: todayStr,
          todayActiveSeconds: 60,
          showStreakCelebration: true,
        });
      },

      // 4. Advance Date to Tomorrow (Ready for New Session)
      simulateTomorrow: () => {
        const yesterdayStr = getRelativeDateString(-1);
        set({
          lastActiveDate: yesterdayStr,
          lastCompletedDate: yesterdayStr,
          todayActiveSeconds: 0,
          showStreakCelebration: false,
        });
      },

      // 5. Add +7 Days to Streak directly
      addSevenDays: () => {
        const { currentStreak, longestStreak } = get();
        const newStreak = currentStreak + 7;
        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
        });
      },

      // 6. Simulate Missed Days (Test Streak Break)
      simulateMissedDays: (daysGap = 3) => {
        const missedDateStr = getRelativeDateString(-daysGap);
        set({
          lastCompletedDate: missedDateStr,
          lastActiveDate: getTodayDateString(),
          todayActiveSeconds: 0,
          showStreakCelebration: false,
        });
      },

      // 7. Add Freeze Token
      addStreakFreeze: () => {
        const { streakFreezeAvailable } = get();
        set({ streakFreezeAvailable: streakFreezeAvailable + 1 });
      },

      // 8. Reset Store to Initial State
      resetStore: () => {
        set({
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: null,
          lastActiveDate: getTodayDateString(),
          todayActiveSeconds: 0,
          streakFreezeAvailable: 1,
          showStreakCelebration: false,
        });
      },
    }),
    {
      name: "visensa_streak_storage",
      partialize: (state) => ({
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastCompletedDate: state.lastCompletedDate,
        lastActiveDate: state.lastActiveDate,
        todayActiveSeconds: state.todayActiveSeconds,
        streakFreezeAvailable: state.streakFreezeAvailable,
      }),
    }
  )
);
