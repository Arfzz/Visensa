import React, { useState, useEffect, useMemo } from "react";
import { generateSchedulePreview, getTomorrowDateString } from "../../../utils/scheduleCalculator";
import { Calendar as CalendarIcon, Save, RotateCcw, Clock, ShieldCheck, Database, ChevronLeft, ChevronRight } from "lucide-react";

const calendarDaysHeader = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatYearMonthDay = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ScheduleConfigurationForm = ({
  onSaveInitialProgram,
  patient,
  activeProgram,
  weeklySchedule,
}) => {
  const [planFreq, setPlanFreq] = useState(weeklySchedule?.frequencyPerWeek || 3);
  const [planInterval, setPlanInterval] = useState(weeklySchedule?.restIntervalDays || 1);
  const [planDuration, setPlanDuration] = useState(activeProgram?.programDurationWeeks || 4);
  const [planStartDate, setPlanStartDate] = useState(activeProgram?.startDate || getTomorrowDateString());
  const [previewDate, setPreviewDate] = useState(new Date());

  // --- SYNC DATABASE PROGRAM & SCHEDULE DATA ---
  useEffect(() => {
    if (activeProgram) {
      if (activeProgram.startDate) {
        setPlanStartDate(activeProgram.startDate);
        const parsedDate = new Date(activeProgram.startDate);
        if (!isNaN(parsedDate.getTime())) {
          setPreviewDate(parsedDate);
        }
      }
      if (activeProgram.programDurationWeeks) {
        setPlanDuration(Number(activeProgram.programDurationWeeks));
      }
    }
    if (weeklySchedule) {
      if (weeklySchedule.frequencyPerWeek) {
        setPlanFreq(Number(weeklySchedule.frequencyPerWeek));
      }
      if (weeklySchedule.restIntervalDays !== undefined) {
        setPlanInterval(Number(weeklySchedule.restIntervalDays));
      }
    }
  }, [activeProgram, weeklySchedule, patient?.id]);

  const handleFrequencyChange = (val) => {
    const freqVal = Number(val);
    setPlanFreq(freqVal);
    if (freqVal >= 4 && planInterval > 1) {
      setPlanInterval(1);
    }
  };

  const programSchedule = useMemo(() => {
    return generateSchedulePreview({
      startDate: planStartDate,
      frequencyPerWeek: planFreq,
      programDurationWeeks: planDuration,
    });
  }, [planStartDate, planFreq, planDuration]);

  const scheduleMap = useMemo(() => {
    const map = new Map();
    programSchedule.forEach((item) => {
      map.set(item.date, item.status);
    });
    return map;
  }, [programSchedule]);

  const handlePrevMonth = () => {
    setPreviewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setPreviewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarCells = useMemo(() => {
    const year = previewDate.getFullYear();
    const month = previewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dateObj = new Date(year, month - 1, dayNum);
      const dateStr = formatYearMonthDay(dateObj);
      cells.push({
        date: dayNum,
        isCurrentMonth: false,
        dateStr,
        status: scheduleMap.get(dateStr) || null,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = formatYearMonthDay(dateObj);
      cells.push({
        date: d,
        isCurrentMonth: true,
        dateStr,
        status: scheduleMap.get(dateStr) || null,
      });
    }

    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const dateObj = new Date(year, month + 1, d);
      const dateStr = formatYearMonthDay(dateObj);
      cells.push({
        date: d,
        isCurrentMonth: false,
        dateStr,
        status: scheduleMap.get(dateStr) || null,
      });
    }

    return cells;
  }, [previewDate, scheduleMap]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSaveInitialProgram) {
      onSaveInitialProgram({
        patientId: patient?.id,
        frequencyPerWeek: planFreq,
        restIntervalDays: planInterval,
        programDurationWeeks: planDuration,
        startDate: planStartDate,
      });
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "20px",
        border: "1.5px solid #C4E8EC",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
      }}
    >
      {/* FORM TITLE BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              color: "#0C2830",
              fontSize: "18px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
            }}
          >
            Schedule Configuration
          </div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "13.5px",
              fontFamily: "Space Grotesk, sans-serif",
              marginTop: "2px",
            }}
          >
            Prescribe therapy parameters and project calendar schedule for {patient?.name || "patient"}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {activeProgram?.id && (
            <div
              style={{
                background: "rgba(75, 168, 130, 0.1)",
                border: "1px solid rgba(75, 168, 130, 0.3)",
                borderRadius: "20px",
                padding: "4px 14px",
                color: "#4BA882",
                fontSize: "12.5px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Database size={13} />
              <span>Database Synced</span>
            </div>
          )}
          <div
            style={{
              background: "rgba(0, 153, 166, 0.08)",
              border: "1px solid rgba(0, 153, 166, 0.2)",
              borderRadius: "20px",
              padding: "4px 14px",
              color: "#0099A6",
              fontSize: "13px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
            }}
          >
            Fixed 8-Exercise Protocol
          </div>
        </div>
      </div>

      {/* 4 COMPACT INPUTS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* 1. Frequency */}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "600",
              color: "#3A6870",
              marginBottom: "8px",
            }}
          >
            Frequency per week
          </div>
          <select
            value={planFreq}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            style={{
              width: "100%",
              height: "46px",
              padding: "0 16px",
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              color: "#0C2830",
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value={1}>1x a week</option>
            <option value={2}>2x a week</option>
            <option value={3}>3x a week</option>
            <option value={4}>4x a week</option>
            <option value={5}>5x a week</option>
            <option value={6}>6x a week</option>
            <option value={7}>7x a week (Every day)</option>
          </select>
        </div>

        {/* 2. Rest Interval */}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "600",
              color: "#3A6870",
              marginBottom: "8px",
            }}
          >
            Rest interval
          </div>
          <select
            value={planInterval}
            onChange={(e) => setPlanInterval(Number(e.target.value))}
            style={{
              width: "100%",
              height: "46px",
              padding: "0 16px",
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              color: "#0C2830",
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value={0}>No rest (0 days)</option>
            <option value={1}>1 day rest</option>
            <option value={2} disabled={planFreq >= 4}>
              2 days rest {planFreq >= 4 ? "(Disabled: ≥4x/wk)" : ""}
            </option>
          </select>
        </div>

        {/* 3. Program Duration */}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "600",
              color: "#3A6870",
              marginBottom: "8px",
            }}
          >
            Program duration
          </div>
          <select
            value={planDuration}
            onChange={(e) => setPlanDuration(Number(e.target.value))}
            style={{
              width: "100%",
              height: "46px",
              padding: "0 16px",
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              color: "#0C2830",
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value={1}>1 Week</option>
            <option value={2}>2 Weeks</option>
            <option value={4}>4 Weeks (1 Month)</option>
            <option value={8}>8 Weeks (2 Months)</option>
          </select>
        </div>

        {/* 4. Start Date */}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "600",
              color: "#3A6870",
              marginBottom: "8px",
            }}
          >
            Start date
          </div>
          <input
            type="date"
            value={planStartDate}
            onChange={(e) => setPlanStartDate(e.target.value)}
            style={{
              width: "100%",
              height: "46px",
              padding: "0 16px",
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              color: "#0C2830",
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
              outline: "none",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {/* INTEGRATED PATIENT CALENDAR PREVIEW */}
      <div
        style={{
          background: "#F8FAFC",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                color: "#0C2830",
                fontSize: "16px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
              }}
            >
              Integrated Patient Calendar Preview
            </div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "13px",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Reactive schedule projection for {patient?.name || "Patient"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                color: "#0C2830",
                fontSize: "15px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
              }}
            >
              {previewDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handlePrevMonth}
                type="button"
                style={{
                  width: "32px",
                  height: "32px",
                  background: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "#3A6870",
                  fontWeight: "700",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                type="button"
                style={{
                  width: "32px",
                  height: "32px",
                  background: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "#3A6870",
                  fontWeight: "700",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div
          style={{
            background: "#E2E8F0",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              background: "white",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            {calendarDaysHeader.map((day, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 0",
                  textAlign: "center",
                  color: "#7AAAB4",
                  fontSize: "12px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
              background: "#E2E8F0",
            }}
          >
            {calendarCells.map((cell, idx) => {
              const isExercise = cell.status === "exercise";
              const isRest = cell.status === "rest";

              return (
                <div
                  key={idx}
                  style={{
                    background: cell.isCurrentMonth ? "white" : "#F8FAFC",
                    minHeight: "70px",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    opacity: cell.isCurrentMonth ? 1 : 0.45,
                  }}
                >
                  <div
                    style={{
                      alignSelf: "flex-end",
                      color: cell.isCurrentMonth ? "#0C2830" : "#94A3B8",
                      fontSize: "13px",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: "600",
                    }}
                  >
                    {cell.date}
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    {isExercise && (
                      <div
                        style={{
                          background: "rgba(0, 153, 166, 0.12)",
                          border: "1px solid rgba(0, 153, 166, 0.25)",
                          borderRadius: "6px",
                          padding: "2px 4px",
                          color: "#0099A6",
                          fontSize: "10.5px",
                          fontFamily: "Space Mono, monospace",
                          fontWeight: "700",
                          textAlign: "center",
                        }}
                      >
                        Session
                      </div>
                    )}
                    {isRest && (
                      <div
                        style={{
                          background: "rgba(148, 163, 184, 0.1)",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "6px",
                          padding: "2px 4px",
                          color: "#64748B",
                          fontSize: "10.5px",
                          fontFamily: "Space Mono, monospace",
                          fontWeight: "600",
                          textAlign: "center",
                        }}
                      >
                        Rest
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SAVE INITIAL PROGRAM ACTION BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSubmit}
          type="button"
          style={{
            padding: "14px 28px",
            background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
            border: "none",
            borderRadius: "14px",
            color: "white",
            fontSize: "15px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 18px rgba(0, 153, 166, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <Save size={18} />
          <span>{activeProgram ? "Update Therapy Program" : "Save Initial Program & Publish"}</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleConfigurationForm;
