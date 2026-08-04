import React from "react";
import { Award, Flame, CheckCircle2, ArrowRight } from "lucide-react";
import { useStreakStore } from "./useStreakStore";

export const StreakCelebrationModal = React.memo(() => {
  const showStreakCelebration = useStreakStore((state) => state.showStreakCelebration);
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const longestStreak = useStreakStore((state) => state.longestStreak);
  const dismissCelebration = useStreakStore((state) => state.dismissCelebration);

  if (!showStreakCelebration) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(12, 40, 48, 0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          border: "1.5px solid #C4E8EC",
          padding: "32px 28px",
          textAlign: "center",
          boxShadow: "0px 12px 50px rgba(12, 40, 48, 0.15)",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* ICON CONTAINER */}
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 18px auto",
            borderRadius: "20px",
            backgroundColor: "rgba(0, 153, 166, 0.08)",
            border: "1.5px solid #C4E8EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Award size={32} style={{ color: "#0099A6" }} />
        </div>

        {/* STATUS BADGE */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 14px",
            borderRadius: "100px",
            backgroundColor: "rgba(75, 168, 130, 0.10)",
            border: "1.5px solid rgba(75, 168, 130, 0.3)",
            color: "#4BA882",
            fontSize: "13px",
            fontFamily: "'Space Mono', monospace",
            fontWeight: "700",
            marginBottom: "12px",
          }}
        >
          <CheckCircle2 size={15} />
          <span>Goal Achieved</span>
        </div>

        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "26px",
            fontWeight: "700",
            color: "#0C2830",
          }}
        >
          Streak Extended!
        </h2>

        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "15px",
            color: "#7AAAB4",
            lineHeight: 1.5,
          }}
        >
          You played mini-games for over 60 seconds today. Your recovery practice streak is safely recorded!
        </p>

        {/* STREAK STATS CARD */}
        <div
          style={{
            backgroundColor: "#F0FAFB",
            borderRadius: "20px",
            border: "1.5px solid #C4E8EC",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            marginBottom: "24px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Flame size={22} style={{ color: "#F97316", fill: "rgba(249, 115, 22, 0.2)" }} />
              <span style={{ fontSize: "24px", fontFamily: "'Space Mono', monospace", fontWeight: "700", color: "#0C2830" }}>
                {currentStreak}
              </span>
            </div>
            <span style={{ fontSize: "13px", fontFamily: "'Space Mono', monospace", color: "#7AAAB4" }}>
              Current Streak
            </span>
          </div>

          <div style={{ width: "1.5px", height: "32px", backgroundColor: "#C4E8EC" }} />

          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "24px", fontFamily: "'Space Mono', monospace", fontWeight: "700", color: "#0C2830" }}>
              {longestStreak}d
            </span>
            <div style={{ fontSize: "13px", fontFamily: "'Space Mono', monospace", color: "#7AAAB4" }}>
              Best Streak
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON */}
        <button
          onClick={dismissCelebration}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #C2EB30 0%, #9AC404 100%)",
            color: "#1A2332",
            fontSize: "17px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: "700",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 8px 25px rgba(154, 196, 4, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span>Continue Practice</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
});

StreakCelebrationModal.displayName = "StreakCelebrationModal";
export default StreakCelebrationModal;
