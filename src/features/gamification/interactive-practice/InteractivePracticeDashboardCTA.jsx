import { Activity, Flame, Check, ChevronRight } from "lucide-react";
import { useStreakStore } from "../streak/useStreakStore";

export const InteractivePracticeDashboardCTA = ({ onNavigate }) => {
  // --- REAL-TIME STREAK & TIMER DATA ---
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const todayActiveSeconds = useStreakStore((state) => state.todayActiveSeconds);
  const dailyTargetSeconds = useStreakStore((state) => state.dailyTargetSeconds);

  const isTargetCompleted = todayActiveSeconds >= dailyTargetSeconds;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        background: "white",
        borderRadius: "16px",
        border: "1.5px solid #C4E8EC",
        padding: "10px 18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* --- LEFT: MINI ICON & SINGLE-LINE STRIP TEXT --- */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "rgba(0, 153, 166, 0.08)",
            border: "1.5px solid rgba(0, 153, 166, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Activity size={17} color="#0099A6" strokeWidth={2.5} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", whiteSpace: "nowrap" }}>
          <span style={{ color: "#0C2830", fontSize: "14.5px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
            Interactive Practice
          </span>
          <span style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif" }}>
            • 4-finger reflex warm-up
          </span>
        </div>
      </div>

      {/* --- RIGHT: COMPACT STREAK BADGE, STATUS & ACTION BUTTON --- */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {/* STREAK BADGE */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#D97706",
            padding: "3px 10px",
            borderRadius: "100px",
            fontSize: "12.5px",
            fontFamily: "Space Mono, monospace",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            flexShrink: 0,
          }}
        >
          <Flame size={13} color="#D97706" fill="rgba(217, 119, 6, 0.2)" />
          <span>{currentStreak} Days</span>
        </div>

        {/* MINI STATUS */}
        <div style={{ flexShrink: 0 }}>
          {isTargetCompleted ? (
            <span
              style={{
                color: "#4BA882",
                fontSize: "12.5px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Check size={14} color="#4BA882" strokeWidth={3} /> Goal Completed
            </span>
          ) : (
            <span style={{ color: "#7AAAB4", fontSize: "12.5px", fontFamily: "Space Mono, monospace", fontWeight: "600" }}>
              {todayActiveSeconds}/60s
            </span>
          )}
        </div>

        {/* COMPACT ACTION BUTTON */}
        <button
          onClick={onNavigate}
          style={{
            padding: "7px 14px",
            background: "rgba(0, 153, 166, 0.08)",
            border: "1.5px solid #0099A6",
            borderRadius: "10px",
            color: "#0099A6",
            fontSize: "13.5px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 153, 166, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 153, 166, 0.08)";
          }}
        >
          <span>Open Practice</span>
          <ChevronRight size={16} color="#0099A6" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default InteractivePracticeDashboardCTA;
