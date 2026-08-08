import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Moon,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Lock,
} from "lucide-react";
import { generateSchedulePreview } from "../../../utils/scheduleCalculator";

const DEFAULT_EXERCISES = [
  { id: 1, name: "Open & close — gentle", duration: "60s" },
  { id: 2, name: "Wrist flexion/extension", duration: "45s" },
  { id: 3, name: "Pinch grip — koin", duration: "60s" },
  { id: 4, name: "Wrist deviation — floating", duration: "60s" },
  { id: 5, name: "Finger tap sequence", duration: "60s" },
  { id: 6, name: "Static open hold", duration: "60s" },
  { id: 7, name: "Single finger lift", duration: "60s" },
  { id: 8, name: "Fist hold", duration: "60s" },
];

const formatYearMonthDay = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const PatientMonthlyPlanModal = ({
  isOpen = true,
  onClose,
  sessionLogs = [],
  activeProgram,
  weeklySchedule,
  isEmbeddedView = false,
}) => {
  const navigate = useNavigate();
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const startDate =
    activeProgram?.startDate ||
    activeProgram?.start_date ||
    new Date().toISOString().split("T")[0];
  const frequencyPerWeek =
    weeklySchedule?.frequencyPerWeek ||
    activeProgram?.frequency_per_week ||
    3;
  const programDurationWeeks =
    activeProgram?.programDurationWeeks ||
    activeProgram?.program_duration_weeks ||
    4;

  // --- SCHEDULE MAP FROM DB CALCULATOR ---
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

  // --- CALENDAR GRID GENERATION ENGINE ---
  const calendarGrid = useMemo(() => {
    const todayStr = formatYearMonthDay(new Date());
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // 1. Previous Month Padding
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const prevDateObj = new Date(year, month - 1, prevMonthDays - i);
      const dateStr = formatYearMonthDay(prevDateObj);
      cells.push({
        dateObj: prevDateObj,
        dateStr,
        dayNum: prevDateObj.getDate(),
        isCurrentMonth: false,
      });
    }

    // 2. Current Month Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = formatYearMonthDay(dateObj);
      cells.push({
        dateObj,
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // 3. Next Month Padding (7 columns grid)
    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let j = 1; j <= remainingCells; j++) {
      const nextDateObj = new Date(year, month + 1, j);
      const dateStr = formatYearMonthDay(nextDateObj);
      cells.push({
        dateObj: nextDateObj,
        dateStr,
        dayNum: j,
        isCurrentMonth: false,
      });
    }

    // Process Clinical Status for each cell
    return cells.map((cell) => {
      const isToday = cell.dateStr === todayStr;
      const isTherapy = scheduleMap.get(cell.dateStr) === "exercise";

      const hasCompletedLog = sessionLogs.some((log) => {
        if (!log?.rawDate) return false;
        return formatYearMonthDay(new Date(log.rawDate)) === cell.dateStr;
      });

      let status = "rest";
      if (hasCompletedLog) {
        status = "completed";
      } else if (isToday) {
        status = "today";
      } else if (isTherapy) {
        status = cell.dateObj > new Date() ? "upcoming" : "missed";
      } else {
        status = "rest";
      }

      return {
        ...cell,
        isToday,
        isTherapy,
        status,
        hasCompletedLog,
      };
    });
  }, [year, month, sessionLogs, scheduleMap]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  // Selected Date Info for Detail Panel
  const selectedDateStr = formatYearMonthDay(selectedDate);
  const selectedDateCell = useMemo(() => {
    return (
      calendarGrid.find((c) => c.dateStr === selectedDateStr) || {
        dateObj: selectedDate,
        dateStr: selectedDateStr,
        dayNum: selectedDate.getDate(),
        isCurrentMonth: selectedDate.getMonth() === month,
        isToday: selectedDateStr === formatYearMonthDay(new Date()),
        isTherapy: scheduleMap.get(selectedDateStr) === "exercise",
        status:
          sessionLogs.some((log) => log?.rawDate && formatYearMonthDay(new Date(log.rawDate)) === selectedDateStr)
            ? "completed"
            : selectedDateStr === formatYearMonthDay(new Date())
            ? "today"
            : scheduleMap.get(selectedDateStr) === "exercise"
            ? selectedDate > new Date()
              ? "upcoming"
              : "missed"
            : "rest",
        hasCompletedLog: sessionLogs.some(
          (log) => log?.rawDate && formatYearMonthDay(new Date(log.rawDate)) === selectedDateStr
        ),
      }
    );
  }, [calendarGrid, selectedDate, selectedDateStr, month, scheduleMap, sessionLogs]);

  const exerciseRoutine = useMemo(() => {
    if (activeProgram?.exercises && Array.isArray(activeProgram.exercises) && activeProgram.exercises.length > 0) {
      return activeProgram.exercises.map((ex, index) => ({
        id: ex.id || index + 1,
        name: ex.name || ex.title || `Exercise ${index + 1}`,
        duration: ex.duration || ex.time || "60s",
      }));
    }
    return DEFAULT_EXERCISES;
  }, [activeProgram]);

  const monthLabel = currentMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!isOpen && !isEmbeddedView) return null;

  const contentUI = (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        maxHeight: isEmbeddedView ? "calc(100vh - 48px)" : "85vh",
        background: "white",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1.5px solid #C4E8EC",
        boxShadow: "0 20px 60px rgba(12, 40, 48, 0.08)",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      {/* --- LEFT CANVAS: CALENDAR MONTH GRID --- */}
      <div
        style={{
          flex: 1,
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        {/* TOP HEADER CONTROLS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                background: "rgba(0, 153, 166, 0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#0099A6",
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <div
                style={{
                  color: "#0C2830",
                  fontSize: "22px",
                  fontWeight: "700",
                }}
              >
                My Therapy Plan
              </div>
              <div style={{ color: "#7AAAB4", fontSize: "13px" }}>
                Monthly Rehabilitation Schedule
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handlePrevMonth}
              type="button"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                color: "#0C2830",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <span
              style={{
                color: "#0C2830",
                fontSize: "17px",
                fontWeight: "700",
                minWidth: "140px",
                textAlign: "center",
              }}
            >
              {monthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              type="button"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                color: "#0C2830",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <ChevronRight size={18} />
            </button>

            {!isEmbeddedView && onClose && (
              <button
                onClick={onClose}
                type="button"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "none",
                  background: "rgba(122, 170, 180, 0.15)",
                  color: "#7AAAB4",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  marginLeft: "12px",
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* CALENDAR 7-COLUMN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px",
          }}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
            <div
              key={dayName}
              style={{
                textAlign: "center",
                color: "#7AAAB4",
                fontSize: "12px",
                fontWeight: "700",
                fontFamily: "Space Mono, monospace",
                textTransform: "uppercase",
                paddingBottom: "8px",
              }}
            >
              {dayName}
            </div>
          ))}

          {calendarGrid.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDateStr;

            let badgeBg = "transparent";
            let badgeColor = "#7AAAB4";
            let badgeText = "Rest";
            let BadgeIcon = null;

            if (cell.status === "completed") {
              badgeBg = "#E6F4F1";
              badgeColor = "#4BA882";
              badgeText = "Completed";
              BadgeIcon = CheckCircle2;
            } else if (cell.status === "today") {
              badgeBg = "rgba(245, 158, 11, 0.12)";
              badgeColor = "#F59E0B";
              badgeText = "Today";
              BadgeIcon = Star;
            } else if (cell.status === "upcoming") {
              badgeBg = "rgba(0, 153, 166, 0.08)";
              badgeColor = "#0099A6";
              badgeText = "Therapy";
              BadgeIcon = Clock;
            } else if (cell.status === "missed") {
              badgeBg = "rgba(200, 112, 74, 0.08)";
              badgeColor = "#C8704A";
              badgeText = "Pending";
              BadgeIcon = Clock;
            }

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(cell.dateObj)}
                style={{
                  minHeight: "84px",
                  padding: "10px",
                  borderRadius: "14px",
                  background: cell.isCurrentMonth ? "#FFFFFF" : "#F8FAFC",
                  border: "1.5px solid",
                  borderColor: isSelected
                    ? "#0099A6"
                    : cell.isToday
                    ? "#F59E0B"
                    : "#E2E8F0",
                  opacity: cell.isCurrentMonth ? 1 : 0.45,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "inset 0 0 0 2.5px #0099A6" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: cell.isToday ? "#F59E0B" : "#0C2830",
                    }}
                  >
                    {cell.dayNum}
                  </span>
                  {cell.isToday && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#F59E0B",
                      }}
                    />
                  )}
                </div>

                {cell.isTherapy || cell.hasCompletedLog ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 6px",
                      borderRadius: "8px",
                      background: badgeBg,
                      color: badgeColor,
                      fontSize: "10.5px",
                      fontWeight: "700",
                    }}
                  >
                    {BadgeIcon && <BadgeIcon size={12} color={badgeColor} />}
                    <span style={{ whiteSpace: "nowrap" }}>{badgeText}</span>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94A3B8",
                      fontWeight: "500",
                    }}
                  >
                    Rest
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT CANVAS: FUNCTIONAL RIGHT PANEL --- */}
      <div
        style={{
          width: "360px",
          minWidth: "340px",
          background: "#F8FAFC",
          borderLeft: "1.5px solid #C4E8EC",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "11.5px",
              fontFamily: "Space Mono, monospace",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "4px",
            }}
          >
            {selectedDateLabel}
          </div>

          <div
            style={{
              color: "#0C2830",
              fontSize: "20px",
              fontWeight: "700",
              marginBottom: "16px",
            }}
          >
            {selectedDateCell.isTherapy
              ? "Therapy Routine"
              : "Rest & Recovery"}
          </div>

          {selectedDateCell.isTherapy ? (
            <div>
              {/* STATUS HEADER BADGE */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  background:
                    selectedDateCell.status === "completed"
                      ? "#E6F4F1"
                      : selectedDateCell.status === "today"
                      ? "rgba(245, 158, 11, 0.12)"
                      : "rgba(0, 153, 166, 0.1)",
                  color:
                    selectedDateCell.status === "completed"
                      ? "#4BA882"
                      : selectedDateCell.status === "today"
                      ? "#F59E0B"
                      : "#0099A6",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                {selectedDateCell.status === "completed" ? (
                  <CheckCircle2 size={14} />
                ) : selectedDateCell.status === "today" ? (
                  <Star size={14} />
                ) : (
                  <Clock size={14} />
                )}
                <span>
                  {selectedDateCell.status === "completed"
                    ? "Session Completed"
                    : selectedDateCell.status === "today"
                    ? "Action Required Today"
                    : "Upcoming Schedule"}
                </span>
              </div>

              {/* 8-EXERCISE ROUTINE LIST */}
              <div
                style={{
                  color: "#7AAAB4",
                  fontSize: "11px",
                  fontFamily: "Space Mono, monospace",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Assigned Routine ({exerciseRoutine.length} exercises)
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {exerciseRoutine.map((ex, i) => (
                  <div
                    key={ex.id || i}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "white",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          color: "#7AAAB4",
                          fontSize: "12px",
                          fontFamily: "Space Mono, monospace",
                        }}
                      >
                        {i + 1}.
                      </span>
                      <span
                        style={{
                          color: selectedDateCell.status === "completed" ? "#94A3B8" : "#0C2830",
                          fontSize: "13px",
                          fontWeight: "600",
                          textDecoration: selectedDateCell.status === "completed" ? "line-through" : "none",
                        }}
                      >
                        {ex.name}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {selectedDateCell.status === "completed" ? (
                        <CheckCircle2 size={14} color="#4BA882" />
                      ) : (
                        <span
                          style={{
                            color: "#7AAAB4",
                            fontSize: "11px",
                            fontFamily: "Space Mono, monospace",
                          }}
                        >
                          {ex.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* REST DAY CARD */
            <div
              style={{
                padding: "24px 16px",
                background: "white",
                borderRadius: "16px",
                border: "1.5px solid #C4E8EC",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(0, 153, 166, 0.1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#0099A6",
                }}
              >
                <Moon size={28} />
              </div>
              <div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700" }}>
                Rest & Recovery
              </div>
              <div style={{ color: "#7AAAB4", fontSize: "13px", lineHeight: "1.5" }}>
                No therapy session scheduled for {selectedDateLabel}. Enjoy your rest!
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CTA BUTTON */}
        <div style={{ marginTop: "24px" }}>
          {selectedDateCell.isToday && selectedDateCell.status !== "completed" ? (
            <button
              onClick={() => navigate("/intro")}
              type="button"
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
                boxShadow: "0 4px 16px rgba(0, 153, 166, 0.3)",
                border: "none",
                borderRadius: "14px",
                color: "white",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Play size={18} fill="white" color="white" />
              <span>Start Session Now</span>
            </button>
          ) : selectedDateCell.status === "completed" ? (
            <div
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "#E6F4F1",
                color: "#4BA882",
                textAlign: "center",
                fontWeight: "700",
                fontSize: "13.5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <CheckCircle2 size={16} color="#4BA882" />
              <span>Session Logged</span>
            </div>
          ) : (
            <button
              disabled
              type="button"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "#E2E8F0",
                color: "#94A3B8",
                border: "none",
                textAlign: "center",
                fontWeight: "700",
                fontSize: "13.5px",
                cursor: "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Lock size={16} />
              <span>No Session Active</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isEmbeddedView) {
    return contentUI;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(12, 24, 32, 0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1080px", width: "100%" }}>{contentUI}</div>
    </div>
  );
};

export default PatientMonthlyPlanModal;
