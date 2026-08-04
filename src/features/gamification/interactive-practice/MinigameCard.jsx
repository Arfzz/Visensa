import { Play, Check, Sparkles, Zap, Clock } from "lucide-react";

export const MinigameCard = ({
  title,
  description = "Interactive 1-minute warm-up exercise for 4-finger rhythm and reflexes.",
  tags = [],
  durationLabel = "1 Min",
  targetSeconds = 60,
  todayActiveSeconds = 0,
  dailyTargetSeconds = 60,
  onStart,
}) => {
  const targetReached = todayActiveSeconds >= dailyTargetSeconds;
  const progressPercent = Math.min(
    100,
    Math.round((todayActiveSeconds / dailyTargetSeconds) * 100)
  );

  return (
    <div
      style={{
        background: "white",
        borderRadius: "24px",
        border: "1.5px solid #C4E8EC",
        padding: "32px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* CLINICAL IDENTITY BADGES */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {tags.map((tag, idx) => {
            const isCyan = idx % 2 === 0;
            return (
              <span
                key={tag}
                style={{
                  background: isCyan ? "rgba(0, 153, 166, 0.08)" : "rgba(212, 168, 67, 0.1)",
                  border: isCyan ? "1.5px solid rgba(0, 153, 166, 0.2)" : "1.5px solid rgba(212, 168, 67, 0.25)",
                  color: isCyan ? "#0099A6" : "#D4A843",
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isCyan ? <Sparkles size={14} color="#0099A6" /> : <Zap size={14} color="#D4A843" />}
                {tag}
              </span>
            );
          })}
        </div>

        {/* MODULE TITLE & DESCRIPTION */}
        <div>
          <div style={{ color: "#0C2830", fontSize: "28px", fontWeight: "800", fontFamily: "Space Grotesk, sans-serif" }}>
            {title}
          </div>
          <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", marginTop: "4px" }}>
            {description}
          </div>
        </div>

        {/* DAILY GOAL PROGRESS BAR */}
        <div style={{ width: "100%", maxWidth: "420px", marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif", color: "#7AAAB4", marginBottom: "6px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={15} color="#0099A6" />
              Daily Warm-Up Target ({targetSeconds}s)
            </span>
            {targetReached ? (
              <span style={{ color: "#4BA882", fontSize: "13px", fontFamily: "Space Mono, monospace", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                <Check size={16} color="#4BA882" strokeWidth={3} /> Today's Goal Completed
              </span>
            ) : (
              <span style={{ fontFamily: "Space Mono, monospace", fontWeight: "700", color: "#0C2830" }}>
                {todayActiveSeconds}s / {dailyTargetSeconds}s
              </span>
            )}
          </div>

          <div style={{ width: "100%", height: "10px", background: "#E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: targetReached ? "#4BA882" : "#0099A6",
                borderRadius: "10px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* PRIMARY CTA BUTTON */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={onStart}
          style={{
            padding: "18px 32px",
            background: "linear-gradient(135deg, #C8F135 0%, #96C000 100%)",
            border: "none",
            borderRadius: "18px",
            color: "#1A2332",
            fontSize: "17px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 8px 25px rgba(154, 196, 4, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            whiteSpace: "nowrap",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <Play size={20} color="#1A2332" fill="#1A2332" />
          <span>Start Warm-Up Session ({durationLabel})</span>
        </button>
        <span style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono, monospace" }}>
          Status: Interactive Mode Ready
        </span>
      </div>
    </div>
  );
};

export default MinigameCard;
