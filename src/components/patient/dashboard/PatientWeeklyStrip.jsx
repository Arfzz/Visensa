import React, { useMemo } from "react";
import { Check, Calendar } from "lucide-react";
import { generateSchedulePreview } from "../../../utils/scheduleCalculator";

const formatYearMonthDay = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const PatientWeeklyStrip = ({
  sessionLogs = [],
  weeklySchedule,
  program,
  onOpenMonthlyPlan,
}) => {
  const startDate = program?.startDate || program?.start_date || new Date().toISOString().split("T")[0];
  const frequencyPerWeek = weeklySchedule?.frequencyPerWeek || program?.frequency_per_week || 3;
  const programDurationWeeks = program?.programDurationWeeks || program?.program_duration_weeks || 4;

  // GENERATE SCHEDULE MAP FROM REHABILITATION CALCULATOR
  const scheduleMap = useMemo(() => {
    const list = generateSchedulePreview({
      startDate,
      frequencyPerWeek,
      programDurationWeeks,
    });

    const map = new Map();
    list.forEach((item) => {
      map.set(item.date, item.status);
    });
    return map;
  }, [startDate, frequencyPerWeek, programDurationWeeks]);

  const weekDays = useMemo(() => {
    const currentDate = new Date();
    const todayStr = formatYearMonthDay(currentDate);

    // Calculate Monday of current calendar week
    const dayOfWeek = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const result = [];

    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(startOfWeek);
      dateObj.setDate(startOfWeek.getDate() + i);
      const dateStr = formatYearMonthDay(dateObj);

      const isToday = dateStr === todayStr;
      const isScheduledTherapy = scheduleMap.get(dateStr) === "exercise";

      const hasCompletedSession = sessionLogs.some((log) => {
        if (!log?.rawDate) return false;
        return formatYearMonthDay(new Date(log.rawDate)) === dateStr;
      });

      let status = "rest";
      if (hasCompletedSession) {
        status = "completed";
      } else if (isToday) {
        status = "today";
      } else if (isScheduledTherapy) {
        status = dateObj > currentDate ? "upcoming" : "missed";
      } else {
        status = "rest";
      }

      result.push({
        day: dayNames[i],
        date: dateObj.getDate(),
        dateStr,
        status,
        isScheduledTherapy,
      });
    }

    return result;
  }, [sessionLogs, scheduleMap]);

  return (
    <div
      style={{
        background: "white",
        padding: "20px 24px",
        borderRadius: "20px",
        border: "1.5px solid #C4E8EC",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        flexShrink: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER WITH ACTION LINK */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#0C2830",
            fontSize: "16px",
            fontWeight: "700",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          Weekly Therapy Overview
        </div>

        <div
          onClick={onOpenMonthlyPlan}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#0099A6",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "Space Grotesk, sans-serif",
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          <Calendar size={15} color="#0099A6" />
          <span>View Full Monthly Plan</span>
        </div>
      </div>

      {/* 7-DAY STRIP */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
      {weekDays.map((item, idx) => {
        const isToday = item.status === "today";
        const isCompleted = item.status === "completed";
        const isUpcoming = item.status === "upcoming";
        const isMissed = item.status === "missed";

        let circleBg = "transparent";
        let textColor = "#7AAAB4";
        let borderStyle = "none";
        let labelText = "Rest";
        let labelColor = "#94A3B8";

        if (isCompleted) {
          circleBg = "#E6F4F1";
          textColor = "#4BA882";
          labelText = "Done";
          labelColor = "#4BA882";
        } else if (isToday) {
          circleBg = "#0099A6";
          textColor = "white";
          labelText = "Today";
          labelColor = "#0099A6";
        } else if (isUpcoming) {
          circleBg = "rgba(0, 153, 166, 0.06)";
          borderStyle = "1.5px dashed #0099A6";
          textColor = "#0099A6";
          labelText = "Therapy";
          labelColor = "#0099A6";
        } else if (isMissed) {
          circleBg = "rgba(200, 112, 74, 0.08)";
          borderStyle = "1px solid rgba(200, 112, 74, 0.3)";
          textColor = "#C8704A";
          labelText = "Pending";
          labelColor = "#C8704A";
        } else {
          circleBg = "#F8FAFC";
          borderStyle = "1px solid #E2E8F0";
          textColor = "#94A3B8";
          labelText = "Rest";
          labelColor = "#94A3B8";
        }

        return (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              flex: 1,
            }}
          >
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "12.5px",
                fontWeight: "700",
                fontFamily: "Space Mono, monospace",
                textTransform: "uppercase",
              }}
            >
              {item.day}
            </div>

            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: circleBg,
                color: textColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "700",
                border: borderStyle,
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "15px",
                boxShadow: isToday ? "0 4px 12px rgba(0, 153, 166, 0.3)" : "none",
              }}
            >
              {isCompleted ? <Check size={18} color="#4BA882" strokeWidth={2.5} /> : item.date}
            </div>

            <div
              style={{
                fontSize: "11px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "600",
                color: labelColor,
              }}
            >
              {labelText}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default PatientWeeklyStrip;
