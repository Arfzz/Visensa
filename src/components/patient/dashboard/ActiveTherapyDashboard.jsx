import React, { useRef } from "react";
import PatientTopHeader from "./PatientTopHeader";
import PatientSummaryKPIs from "./PatientSummaryKPIs";
import PatientTealCards from "./PatientTealCards";
import PatientWeeklyStrip from "./PatientWeeklyStrip";
import PatientPainTrend from "./PatientPainTrend";
import PatientRecentSessions from "./PatientRecentSessions";
import PatientRightSidebar from "./PatientRightSidebar";
import { generateSchedulePreview } from "../../../utils/scheduleCalculator";

const ActiveTherapyDashboard = ({
  patient,
  program,
  schedule,
  stats,
  sessionLogs = [],
  notifications = [],
  monthlyGoal = 0,
  onOpenPractice,
  onStartSession,
  onMarkAllRead,
}) => {
  const mainContentRef = useRef(null);

  const fullName = patient?.user?.name || patient?.name || "Patient";
  const doctorName =
    patient?.assigned_doctor?.name ||
    patient?.doctor?.name ||
    program?.doctor_name ||
    null;
  const programStatus =
    program?.status === "Completed / Review Required"
      ? "Completed / Review Required"
      : program?.status || "Active";
  const isCompletedReview = program?.status === "Completed / Review Required";

  const totalSessionsDone = sessionLogs.length;
  const completedExercises =
    stats?.completed_exercises ??
    schedule?.completed_sessions ??
    totalSessionsDone;
  const currentStreak = stats?.current_streak ?? 0;
  const highestStreak = stats?.highest_streak ?? 0;

  // DYNAMIC PAIN CALCULATIONS FROM DB/LOGS
  const currentPainRaw =
    sessionLogs.length > 0
      ? sessionLogs[0].newPain
      : (patient?.pain ?? program?.pain_level);
  const currentPain =
    currentPainRaw !== null &&
    currentPainRaw !== undefined &&
    currentPainRaw !== "—"
      ? currentPainRaw
      : null;

  const startPainRaw =
    sessionLogs.length > 0
      ? sessionLogs[sessionLogs.length - 1].oldPain
      : (program?.initial_pain ?? patient?.initial_pain);

  const startPain =
    startPainRaw !== null && startPainRaw !== undefined && startPainRaw !== "—"
      ? startPainRaw
      : null;

  const currentWeek =
    program?.current_week ||
    (completedExercises > 0 ? Math.ceil(completedExercises / 3) : 1);

  const currentMonthStr = new Date().toLocaleString("default", {
    month: "short",
  });
  const sessionsThisMonth = sessionLogs.filter(
    (s) => s.month === currentMonthStr,
  ).length;

  const nextReviewDate = program?.next_review_date
    ? new Date(program.next_review_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : program?.end_date
      ? new Date(program.end_date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const jointAccuracy =
    stats?.avg_accuracy ??
    stats?.accuracy ??
    (sessionLogs.length > 0 ? 95 : null);

  const formatYearMonthDay = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const scheduleList = generateSchedulePreview({
    startDate: program?.start_date || program?.startDate || new Date().toISOString().split("T")[0],
    frequencyPerWeek: schedule?.frequencyPerWeek || program?.frequency_per_week || 3,
    programDurationWeeks: program?.program_duration_weeks || program?.programDurationWeeks || 4,
  });

  const todayStrLocal = formatYearMonthDay(new Date());
  const todaySchedule = scheduleList.find(s => s.date === todayStrLocal);
  const isTodayScheduled = todaySchedule ? todaySchedule.status === "exercise" : false;

  return (
    <div
      className="main-content"
      style={{
        display: "flex",
        flex: 1,
        gap: "24px",
        height: "calc(100vh - 48px)",
        maxHeight: "calc(100vh - 48px)",
        width: "100%",
        boxSizing: "border-box",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* --- LEFT SCROLLABLE MAIN CANVAS WITH NATIVE WHEEL & LENIS PREVENT --- */}
      <div
        ref={mainContentRef}
        data-lenis-prevent="true"
        onWheel={(e) => {
          if (mainContentRef.current) {
            mainContentRef.current.scrollTop += e.deltaY;
          }
        }}
        className="hide-scroll"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
          height: "100%",
          maxHeight: "100%",
          paddingRight: "10px",
          paddingBottom: "160px",
          minWidth: 0,
          minHeight: 0,
          boxSizing: "border-box",
        }}
      >
        {/* C. TOP HEADER & PRACTICE BANNER */}
        <PatientTopHeader
          fullName={fullName}
          programStatus={programStatus}
          notifications={notifications}
          currentStreak={currentStreak}
          onOpenPractice={onOpenPractice}
          onMarkAllRead={onMarkAllRead}
        />

        {/* D. SECTION 1: 4 WHITE KPI CARDS */}
        <PatientSummaryKPIs
          currentWeek={currentWeek}
          completedSessions={completedExercises}
          currentPain={currentPain}
          initialPain={startPain}
          currentStreak={currentStreak}
          highestStreak={highestStreak}
        />

        {/* E. SECTION 2: 2 LARGE TEAL CARDS */}
        <PatientTealCards
          currentPain={currentPain}
          initialPain={startPain}
          sessionsThisMonth={sessionsThisMonth}
          monthlyGoal={monthlyGoal}
        />

        {/* F. SECTION 3: WEEKLY DATE CALENDAR STRIP */}
        <PatientWeeklyStrip
          sessionLogs={sessionLogs}
          weeklySchedule={schedule}
          program={program}
        />

        {/* G. SECTION 4: BOTTOM PAIN TREND CARD */}
        <PatientPainTrend sessionLogs={sessionLogs} />

        {/* H. SECTION 5: RECENT SESSIONS LIST */}
        <PatientRecentSessions sessionLogs={sessionLogs} />
      </div>

      {/* I. RIGHT SIDEBAR COLUMN */}
      <PatientRightSidebar
        isCompletedReview={isCompletedReview}
        onStartSession={onStartSession}
        currentPain={currentPain}
        initialPain={startPain}
        currentWeek={currentWeek}
        completedSessions={completedExercises}
        jointAccuracy={jointAccuracy}
        doctorName={doctorName}
        nextReviewDate={nextReviewDate}
        isTodayScheduled={isTodayScheduled}
      />
    </div>
  );
};

export default ActiveTherapyDashboard;
