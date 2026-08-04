import { useMemo } from "react";
import { Check, Snowflake } from "lucide-react";
import { useStreakStore } from "../streak/useStreakStore";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const SevenDayTrackerCard = () => {
  // --- STORE DATA ---
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const streakFreezeAvailable = useStreakStore((state) => state.streakFreezeAvailable);
  const lastCompletedDate = useStreakStore((state) => state.lastCompletedDate);
  const todayActiveSeconds = useStreakStore((state) => state.todayActiveSeconds);
  const dailyTargetSeconds = useStreakStore((state) => state.dailyTargetSeconds);

  // --- CALCULATE WEEK DAYS ---
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    
    return DAY_LABELS.map((label, index) => {
      const offsetDays = index - currentDayIndex;
      const date = new Date(today);
      date.setDate(today.getDate() + offsetDays);

      const isToday = index === currentDayIndex;
      const isPast = index < currentDayIndex;
      
      const isTodayCompleted = isToday && (todayActiveSeconds >= dailyTargetSeconds || lastCompletedDate === date.toISOString().split("T")[0]);
      
      const daysAgo = currentDayIndex - index;
      const isStreakCompleted = isPast && daysAgo < currentStreak;
      const isCompleted = isToday ? isTodayCompleted : isStreakCompleted;
      const isProtected = isPast && !isCompleted && daysAgo === currentStreak && streakFreezeAvailable > 0;

      return {
        label,
        dayNum: date.getDate(),
        isToday,
        isPast,
        isCompleted,
        isProtected,
      };
    });
  }, [currentStreak, streakFreezeAvailable, lastCompletedDate, todayActiveSeconds, dailyTargetSeconds]);

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
              Consistency Tracker
            </div>
            <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif", marginTop: "2px" }}>
              7-day practice schedule for this week
            </div>
          </div>
          <span
            style={{
              background: "rgba(0, 153, 166, 0.08)",
              color: "#0099A6",
              border: "1.5px solid #C4E8EC",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
            }}
          >
            7 Days
          </span>
        </div>

        {/* --- 7-DAY CIRCLES ROW --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", margin: "24px 0" }}>
          {weekDays.map((day, idx) => {
            let circleBg = "#F8FAFA";
            let circleBorder = "1.5px solid #C4E8EC";
            let textColor = "#7AAAB4";

            if (day.isCompleted) {
              circleBg = "rgba(75, 168, 130, 0.12)";
              circleBorder = "1.5px solid #4BA882";
              textColor = "#4BA882";
            } else if (day.isProtected) {
              circleBg = "rgba(62, 216, 200, 0.12)";
              circleBorder = "1.5px solid #3ED8C8";
              textColor = "#0099A6";
            } else if (day.isToday) {
              circleBg = "rgba(0, 153, 166, 0.08)";
              circleBorder = "2px solid #0099A6";
              textColor = "#0099A6";
            }

            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "600" }}>
                  {day.label}
                </span>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: circleBg,
                    border: circleBorder,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  {day.isCompleted ? (
                    <Check size={18} color="#4BA882" strokeWidth={3} />
                  ) : day.isProtected ? (
                    <Snowflake size={16} color="#0099A6" strokeWidth={2.5} />
                  ) : (
                    <span style={{ color: textColor, fontSize: "13px", fontFamily: "Space Mono, monospace", fontWeight: "700" }}>
                      {day.dayNum}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- FOOTER CLINICAL FREEZE PROTECTION STATUS --- */}
      <div style={{ borderTop: "1.5px solid #E2E8F0", paddingTop: "16px", display: "flex", alignItems: "center", gap: "14px", marginTop: "auto" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(0, 153, 166, 0.1)",
            border: "1.5px solid rgba(0, 153, 166, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Snowflake size={20} color="#0099A6" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#0C2830", fontSize: "15px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
              {streakFreezeAvailable}/1 Freeze Shield Ready
            </span>
            <span
              style={{
                background: "rgba(0, 153, 166, 0.1)",
                color: "#0099A6",
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              Protection Active
            </span>
          </div>
          <div style={{ color: "#7AAAB4", fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif", marginTop: "2px" }}>
            Protects 1 missed day due to medical considerations
          </div>
        </div>
      </div>
    </div>
  );
};

export default SevenDayTrackerCard;
