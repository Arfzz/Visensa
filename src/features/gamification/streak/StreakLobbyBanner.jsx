import React, { useEffect } from "react";
import { Clock, Flame, ShieldCheck, Award, Check, Snowflake, Trophy, HelpCircle } from "lucide-react";
import { useStreakStore } from "./useStreakStore";

// --- MILESTONES DEFINITION ---
const MILESTONES = [
  { target: 3, title: "Bronze Warmup" },
  { target: 7, title: "Silver Finger Athlete" },
  { target: 14, title: "Gold Dexterity" },
  { target: 30, title: "Master Musician" },
  { target: 60, title: "Grandmaster Receptive" },
];

const DAYS_OF_WEEK = [
  { short: "M", label: "Mon", index: 0 },
  { short: "T", label: "Tue", index: 1 },
  { short: "W", label: "Wed", index: 2 },
  { short: "T", label: "Thu", index: 3 },
  { short: "F", label: "Fri", index: 4 },
  { short: "S", label: "Sat", index: 5 },
  { short: "S", label: "Sun", index: 6 },
];

export const StreakLobbyBanner = React.memo(() => {
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const longestStreak = useStreakStore((state) => state.longestStreak);
  const todayActiveSeconds = useStreakStore((state) => state.todayActiveSeconds);
  const dailyTargetSeconds = useStreakStore((state) => state.dailyTargetSeconds || 60);
  const lastCompletedDate = useStreakStore((state) => state.lastCompletedDate);
  const streakFreezeAvailable = useStreakStore((state) => state.streakFreezeAvailable);
  const checkDailyReset = useStreakStore((state) => state.checkDailyReset);

  useEffect(() => {
    checkDailyReset();
  }, [checkDailyReset]);

  const today = new Date().toISOString().split("T")[0];
  const isStreakCompletedToday = lastCompletedDate === today;
  const progressPercent = Math.min(
    100,
    Math.round((todayActiveSeconds / dailyTargetSeconds) * 100)
  );

  // --- GET CURRENT DAY INDEX (0 = MON, ..., 6 = SUN) ---
  const todayDateObj = new Date();
  const dayOfWeekJs = todayDateObj.getDay(); // 0 = Sun, 1 = Mon ...
  const currentDayIndex = dayOfWeekJs === 0 ? 6 : dayOfWeekJs - 1;

  // --- COMPUTE NEXT MILESTONE ---
  const nextMilestone =
    MILESTONES.find((m) => m.target > currentStreak) || {
      target: currentStreak + 10,
      title: "Legendary Champion",
    };
  const remainingDays = Math.max(1, nextMilestone.target - currentStreak);

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "24px 28px",
        borderRadius: "24px",
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #C4E8EC",
        boxShadow: "0px 2px 10px rgba(28, 24, 22, 0.04)",
        transition: "all 0.2s ease-out",
        fontFamily: "'Space Grotesk', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* ========================================== */}
      {/* 1. HEADER ROW                              */}
      {/* ========================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              backgroundColor: "rgba(0, 153, 166, 0.08)",
              border: "1.5px solid #C4E8EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Clock size={22} style={{ color: "#0099A6" }} />
          </div>

          <div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "13px",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              Mini-Games Target
            </div>
            <div
              style={{
                color: "#0C2830",
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "1.2",
              }}
            >
              Daily Streak Practice
            </div>
          </div>
        </div>

        {/* STREAK BADGES (CURRENT & BEST) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            backgroundColor: "rgba(0, 153, 166, 0.04)",
            border: "1.5px solid #C4E8EC",
            padding: "8px 18px",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Flame size={20} style={{ color: "#F97316", fill: "rgba(249, 115, 22, 0.2)" }} />
            <span
              style={{
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "'Space Mono', monospace",
                color: "#0C2830",
              }}
            >
              {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>

          <div style={{ width: "1.5px", height: "20px", backgroundColor: "#C4E8EC" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Award size={18} style={{ color: "#D4A843" }} />
            <span style={{ fontSize: "14px", fontFamily: "'Space Mono', monospace", color: "#7AAAB4" }}>
              Best: <strong style={{ color: "#0C2830" }}>{longestStreak}d</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. PROGRESS BAR & STATUS                   */}
      {/* ========================================== */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            fontFamily: "'Space Mono', monospace",
            fontSize: "14px",
          }}
        >
          <span style={{ color: "#7AAAB4" }}>
            {isStreakCompletedToday
              ? "Goal Achieved for Today! · Resets at 23:59"
              : `${todayActiveSeconds}s / ${dailyTargetSeconds}s active practice today`}
          </span>
          <span
            style={{
              fontWeight: "700",
              color: isStreakCompletedToday ? "#4BA882" : "#0099A6",
            }}
          >
            {progressPercent}%
          </span>
        </div>

        {/* PROGRESS TRACK */}
        <div
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#F0FAFB",
            borderRadius: "100px",
            border: "1.5px solid #C4E8EC",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: isStreakCompletedToday
                ? "linear-gradient(90deg, #4BA882 0%, #3ED8C8 100%)"
                : "linear-gradient(90deg, #0099A6 0%, #3ED8C8 100%)",
              borderRadius: "100px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. 7-DAY ACTIVITY ROW & SHIELD STATUS      */}
      {/* ========================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          backgroundColor: "#F8FAFA",
          border: "1.5px solid #C4E8EC",
          borderRadius: "18px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* 7-DAY ROW */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {DAYS_OF_WEEK.map((dayObj) => {
            const isTodayIndex = dayObj.index === currentDayIndex;
            const isPastIndex = dayObj.index < currentDayIndex;
            
            let isDayDone = false;
            if (isPastIndex && currentStreak > (currentDayIndex - dayObj.index)) {
              isDayDone = true;
            } else if (isTodayIndex && isStreakCompletedToday) {
              isDayDone = true;
            }

            return (
              <div
                key={dayObj.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {/* DAY SHORT LABEL (S S R K J S M) */}
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: "700",
                    color: isTodayIndex ? "#0099A6" : "#7AAAB4",
                  }}
                >
                  {dayObj.short}
                </span>

                {/* CIRCLE ICON STATUS */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDayDone
                      ? "#4BA882"
                      : isTodayIndex
                      ? "rgba(0, 153, 166, 0.12)"
                      : "#FFFFFF",
                    border: isDayDone
                      ? "none"
                      : isTodayIndex
                      ? "2px solid #0099A6"
                      : "1.5px solid #C4E8EC",
                    boxShadow: isTodayIndex ? "0 0 10px rgba(0, 153, 166, 0.2)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDayDone ? (
                    <Check size={18} style={{ color: "#FFFFFF", strokeWidth: 3 }} />
                  ) : isTodayIndex ? (
                    <Flame size={18} style={{ color: "#F97316", fill: "rgba(249, 115, 22, 0.3)" }} />
                  ) : (
                    <span style={{ fontSize: "11px", color: "#C4E8EC" }}>•</span>
                  )}
                </div>

                {/* DAY FULL LABEL (Sen Sel Rab...) */}
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "'Space Mono', monospace",
                    color: isTodayIndex ? "#0099A6" : "#7AAAB4",
                    fontWeight: isTodayIndex ? "700" : "400",
                  }}
                >
                  {dayObj.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* SHIELD / FREEZE STATUS BADGE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            backgroundColor: "rgba(62, 216, 200, 0.10)",
            border: "1.5px solid rgba(62, 216, 200, 0.3)",
            borderRadius: "14px",
          }}
          title="Protects your streak if absent 1 day for medical rest."
        >
          <Snowflake size={16} style={{ color: "#3ED8C8" }} />
          <span
            style={{
              fontSize: "13px",
              fontFamily: "'Space Mono', monospace",
              fontWeight: "700",
              color: "#0C2830",
            }}
          >
            {streakFreezeAvailable}/1 Shield Ready
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4. NEXT MILESTONE BAR                      */}
      {/* ========================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          backgroundColor: "rgba(212, 168, 67, 0.08)",
          border: "1.5px solid rgba(212, 168, 67, 0.25)",
          borderRadius: "16px",
          fontSize: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Trophy size={18} style={{ color: "#D4A843" }} />
          <span style={{ color: "#0C2830", fontWeight: "600" }}>
            Next Milestone: <strong>{nextMilestone.target} Days</strong> ({nextMilestone.title})
          </span>
        </div>

        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "13px",
            color: "#D4A843",
            fontWeight: "700",
          }}
        >
          {remainingDays} {remainingDays === 1 ? "day" : "days"} to go!
        </span>
      </div>
    </div>
  );
});

StreakLobbyBanner.displayName = "StreakLobbyBanner";
export default StreakLobbyBanner;
