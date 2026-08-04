import { Flame, Trophy, Award } from "lucide-react";
import { useStreakStore } from "../streak/useStreakStore";

export const PersonalBestCard = () => {
  // --- STORE DATA ---
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const longestStreak = useStreakStore((state) => state.longestStreak);

  // --- STREAK PROGRESS RATIO ---
  const progressRatio = longestStreak > 0 ? Math.min(100, Math.round((currentStreak / longestStreak) * 100)) : 100;
  const isNewRecord = currentStreak >= longestStreak && currentStreak > 1;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "24px",
        border: "1.5px solid #C4E8EC",
        padding: "28px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        minWidth: "300px",
        boxSizing: "border-box",
      }}
    >
      {/* --- HEADER --- */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
              Personal Best & Streak
            </div>
            <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", marginTop: "2px" }}>
              Daily consistency comparison
            </div>
          </div>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(212, 168, 67, 0.12)",
              border: "1.5px solid rgba(212, 168, 67, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={18} color="#D4A843" strokeWidth={2.5} />
          </div>
        </div>

        {/* --- METRIC PILLS GRID --- */}
        <div style={{ display: "flex", gap: "16px", margin: "20px 0 16px 0" }}>
          {/* CURRENT STREAK PILL */}
          <div
            style={{
              flex: 1,
              background: "rgba(245, 158, 11, 0.06)",
              border: "1.5px solid rgba(245, 158, 11, 0.25)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#B45309", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>
              <Flame size={15} color="#D97706" fill="rgba(217, 119, 6, 0.2)" />
              <span>Current Streak</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
              <span style={{ color: "#D97706", fontSize: "28px", fontFamily: "Space Mono, monospace", fontWeight: "800" }}>
                {currentStreak}
              </span>
              <span style={{ color: "#B45309", fontSize: "14px", fontFamily: "Space Mono, monospace", fontWeight: "600" }}>
                Days
              </span>
            </div>
          </div>

          {/* LONGEST STREAK PILL */}
          <div
            style={{
              flex: 1,
              background: "rgba(75, 168, 130, 0.06)",
              border: "1.5px solid rgba(75, 168, 130, 0.25)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#047857", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "600" }}>
              <Award size={15} color="#4BA882" strokeWidth={2.5} />
              <span>Longest Streak</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
              <span style={{ color: "#4BA882", fontSize: "28px", fontFamily: "Space Mono, monospace", fontWeight: "800" }}>
                {longestStreak}
              </span>
              <span style={{ color: "#047857", fontSize: "14px", fontFamily: "Space Mono, monospace", fontWeight: "600" }}>
                Days
              </span>
            </div>
          </div>
        </div>

        {/* --- PROGRESS BAR --- */}
        <div style={{ margin: "16px 0 8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", color: "#7AAAB4", marginBottom: "6px" }}>
            <span>Record Progress</span>
            <span style={{ fontFamily: "Space Mono, monospace", fontWeight: "700", color: "#0C2830" }}>{progressRatio}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "#E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progressRatio}%`,
                height: "100%",
                background: "linear-gradient(90deg, #F59E0B 0%, #D97706 100%)",
                borderRadius: "10px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* --- FOOTER MOTIVATIONAL COPY --- */}
      <div style={{ borderTop: "1.5px solid #E2E8F0", paddingTop: "14px", display: "flex", alignItems: "center", gap: "10px", marginTop: "auto" }}>
        <Flame size={18} color="#D97706" fill="rgba(217, 119, 6, 0.2)" style={{ flexShrink: 0 }} />
        <div style={{ color: "#0C2830", fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif", fontWeight: "500", lineHeight: "1.4" }}>
          {isNewRecord
            ? "Congratulations! You currently hold a new personal streak record!"
            : `Keep your flame burning to beat your personal best (${longestStreak} days)!`}
        </div>
      </div>
    </div>
  );
};

export default PersonalBestCard;
