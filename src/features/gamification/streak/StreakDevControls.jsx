import React from "react";
import { Plus, Zap, Calendar, AlertTriangle, RotateCcw, Wrench, FastForward, Snowflake } from "lucide-react";
import { useStreakStore } from "./useStreakStore";

export const StreakDevControls = React.memo(() => {
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const longestStreak = useStreakStore((state) => state.longestStreak);
  const todayActiveSeconds = useStreakStore((state) => state.todayActiveSeconds);
  const streakFreezeAvailable = useStreakStore((state) => state.streakFreezeAvailable);
  const lastCompletedDate = useStreakStore((state) => state.lastCompletedDate);

  const addFifteenSeconds = useStreakStore((state) => state.addFifteenSeconds);
  const triggerCompleteDaily = useStreakStore((state) => state.triggerCompleteDaily);
  const simulateNextDayAndComplete = useStreakStore((state) => state.simulateNextDayAndComplete);
  const simulateTomorrow = useStreakStore((state) => state.simulateTomorrow);
  const addSevenDays = useStreakStore((state) => state.addSevenDays);
  const simulateMissedDays = useStreakStore((state) => state.simulateMissedDays);
  const addStreakFreeze = useStreakStore((state) => state.addStreakFreeze);
  const resetStore = useStreakStore((state) => state.resetStore);

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
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* PANEL HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          paddingBottom: "14px",
          borderBottom: "1.5px solid #C4E8EC",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 153, 166, 0.08)",
              border: "1.5px solid #C4E8EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wrench size={18} style={{ color: "#0099A6" }} />
          </div>
          <div>
            <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700" }}>
              Unlimited Streak Dev Controls
            </div>
            <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>
              Test multi-day streaks (Day 1, 2, 3... 30+ days), freeze shields & rollover
            </div>
          </div>
        </div>

        {/* LIVE STATE HUD */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontSize: "12px",
            fontFamily: "'Space Mono', monospace",
            color: "#7AAAB4",
            flexWrap: "wrap",
          }}
        >
          <span>Secs: <strong style={{ color: "#0099A6" }}>{todayActiveSeconds}s</strong></span>
          <span>Streak: <strong style={{ color: "#0C2830" }}>{currentStreak}d</strong></span>
          <span>Best: <strong style={{ color: "#D4A843" }}>{longestStreak}d</strong></span>
          <span>Freeze: <strong style={{ color: "#3ED8C8" }}>{streakFreezeAvailable}</strong></span>
        </div>
      </div>

      {/* BUTTON GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {/* BUTTON 1: +15s PLAYTIME */}
        <button
          onClick={addFifteenSeconds}
          style={{
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: "rgba(0, 153, 166, 0.06)",
            border: "1.5px solid #C4E8EC",
            color: "#0099A6",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 153, 166, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 153, 166, 0.06)";
          }}
        >
          <Plus size={16} />
          <span>+15s Playtime</span>
        </button>

        {/* BUTTON 2: TRIGGER 60s (COMPLETE TODAY) */}
        <button
          onClick={triggerCompleteDaily}
          style={{
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: "rgba(75, 168, 130, 0.10)",
            border: "1.5px solid rgba(75, 168, 130, 0.3)",
            color: "#4BA882",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(75, 168, 130, 0.20)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(75, 168, 130, 0.10)";
          }}
        >
          <Zap size={16} />
          <span>Complete 60s Today</span>
        </button>

        {/* BUTTON 3: SIMULATE NEXT DAY & COMPLETE (+1 DAY INFINITE) */}
        <button
          onClick={simulateNextDayAndComplete}
          style={{
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
            backgroundColor: "#0099A6",
            border: "none",
            color: "#FFFFFF",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0, 153, 166, 0.25)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#00838e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#0099A6";
          }}
          title="Simulate completing 60s for next day (Click continuously for Day 1, 2, 3, 4, 5...)"
        >
          <Calendar size={16} />
          <span>+1 Day &amp; Complete</span>
        </button>

        {/* BUTTON 4: +7 DAYS JUMP */}
        <button
          onClick={addSevenDays}
          style={{
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: "#F8FAFA",
            border: "1.5px solid #C4E8EC",
            color: "#0C2830",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#0099A6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#C4E8EC";
          }}
        >
          <FastForward size={16} style={{ color: "#0099A6" }} />
          <span>+7 Days Jump</span>
        </button>

        {/* BUTTON 5: MISSED 3 DAYS (TEST STREAK BREAK) */}
        <button
          onClick={() => simulateMissedDays(3)}
          style={{
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: "rgba(249, 115, 22, 0.08)",
            border: "1.5px solid rgba(249, 115, 22, 0.25)",
            color: "#F97316",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(249, 115, 22, 0.16)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(249, 115, 22, 0.08)";
          }}
        >
          <AlertTriangle size={16} />
          <span>Miss 3 Days (Break)</span>
        </button>

        {/* BUTTON 6: ADD FREEZE TOKEN */}
        <button
          onClick={addStreakFreeze}
          style={{
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: "rgba(62, 216, 200, 0.10)",
            border: "1.5px solid rgba(62, 216, 200, 0.3)",
            color: "#0099A6",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(62, 216, 200, 0.20)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(62, 216, 200, 0.10)";
          }}
        >
          <Snowflake size={16} style={{ color: "#3ED8C8" }} />
          <span>+1 Freeze Shield</span>
        </button>

        {/* BUTTON 7: RESET STORE */}
        <button
          onClick={resetStore}
          style={{
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: "#FFE9E9",
            border: "1.5px solid #FFCECE",
            color: "#C0574C",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FFD6D6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFE9E9";
          }}
        >
          <RotateCcw size={16} />
          <span>Reset Store</span>
        </button>
      </div>
    </div>
  );
});

StreakDevControls.displayName = "StreakDevControls";
export default StreakDevControls;
