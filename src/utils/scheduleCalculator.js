// --- WEEKLY PATTERNS FOR EVEN DISTRIBUTION ---
// Calendar Day Indices (Mon = 0, Tue = 1, Wed = 2, Thu = 3, Fri = 4, Sat = 5, Sun = 6)
export const WEEKLY_PATTERNS = {
  1: [0],                  // Mon -> 1 session
  2: [0, 3],               // Mon & Thu -> 2 sessions
  3: [0, 2, 4],            // Mon, Wed, Fri -> 3 sessions
  4: [0, 2, 4, 6],         // Mon, Wed, Fri, Sun -> 4 sessions
  5: [0, 1, 3, 4, 5],      // 5 exercise days, 2 rest days -> 5 sessions
  6: [0, 1, 2, 3, 4, 5],   // 6 exercise days, Sun rest -> 6 sessions
  7: [0, 1, 2, 3, 4, 5, 6] // Everyday -> 7 sessions
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Generates an array of daily objects for a patient's therapy schedule program.
 *
 * @param {Object} params
 * @param {Date|string} params.startDate - Start date of program (defaults to D+1 if invalid)
 * @param {number} params.frequencyPerWeek - Weekly exercise frequency (1 to 7)
 * @param {number} params.programDurationWeeks - Duration in weeks (1, 2, 4, 8, 12)
 * @returns {Array<Object>} Daily schedule objects array
 */
export const generateSchedulePreview = ({
  startDate,
  frequencyPerWeek = 3,
  programDurationWeeks = 4,
}) => {
  const start = startDate ? new Date(startDate) : new Date();

  if (isNaN(start.getTime())) {
    start.setTime(Date.now() + 86400000);
  }

  const freq = Math.min(Math.max(Number(frequencyPerWeek) || 3, 1), 7);
  const duration = Math.max(Number(programDurationWeeks) || 1, 1);
  const totalDays = duration * 7;
  const pattern = WEEKLY_PATTERNS[freq] || WEEKLY_PATTERNS[3];

  const schedule = [];

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(start.getTime());
    currentDate.setDate(start.getDate() + i);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // FIX: Match pattern against the ACTUAL CALENDAR DAY index (Mon = 0, Tue = 1, ..., Fri = 4, Sat = 5, Sun = 6)
    // This ensures Friday is ALWAYS Friday regardless of what day of the week startDate lands on.
    const calendarDayIndex = (currentDate.getDay() + 6) % 7;
    const isExercise = pattern.includes(calendarDayIndex);
    const status = isExercise ? "exercise" : "rest";
    const dayName = DAY_NAMES[currentDate.getDay()];
    const weekNumber = Math.floor(i / 7) + 1;

    schedule.push({
      date: dateStr,
      dayName,
      status,
      weekNumber,
      isFixedProtocol: isExercise,
    });
  }

  return schedule;
};

/**
 * Helper to compute default start date (D+1 tomorrow) formatted as YYYY-MM-DD
 */
export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
