import React, { useEffect } from "react";
import { Flame, Snowflake } from "lucide-react";
import { useStreakStore } from "./useStreakStore";

export const StreakTopbarWidget = React.memo(({ onClick }) => {
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const streakFreezeAvailable = useStreakStore((state) => state.streakFreezeAvailable);
  const checkDailyReset = useStreakStore((state) => state.checkDailyReset);

  useEffect(() => {
    checkDailyReset();
  }, [checkDailyReset]);

  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px",
        borderRadius: "16px",
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #C4E8EC",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
        cursor: "pointer",
        transition: "all 0.2s ease-out",
        userSelect: "none",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#0099A6";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#C4E8EC";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      title="Mini-Games Daily Streak"
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "10px",
          backgroundColor: "rgba(249, 115, 22, 0.12)",
          border: "1px solid rgba(249, 115, 22, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flame size={18} style={{ color: "#F97316", fill: "rgba(249, 115, 22, 0.3)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
        <span
          style={{
            fontSize: "12px",
            fontFamily: "'Space Mono', monospace",
            color: "#7AAAB4",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            lineHeight: 1,
          }}
        >
          Daily Streak
        </span>
        <span
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#0C2830",
            lineHeight: 1.2,
          }}
        >
          {currentStreak} {currentStreak === 1 ? "day" : "days"}
        </span>
      </div>

      {streakFreezeAvailable > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            paddingLeft: "8px",
            borderLeft: "1.5px solid #E2E8F0",
          }}
          title={`${streakFreezeAvailable} Streak Freeze Protection Available`}
        >
          <Snowflake size={15} style={{ color: "#3ED8C8" }} />
          <span style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "#3ED8C8", fontWeight: "700" }}>
            x{streakFreezeAvailable}
          </span>
        </div>
      )}
    </div>
  );
});

StreakTopbarWidget.displayName = "StreakTopbarWidget";
export default StreakTopbarWidget;
