import React from "react";

const formatPainValue = (pain) => {
  if (pain === null || pain === undefined || pain === "" || pain === "—")
    return "-";
  const str = String(pain).trim();
  if (str.includes("/10")) return str;
  return `${str} / 10`;
};

const PatientSummaryKPIs = ({
  currentWeek,
  completedSessions = 0,
  currentPain,
  initialPain,
  currentStreak = 0,
  highestStreak = 0,
}) => {
  const painDisplay = formatPainValue(currentPain);
  const initialPainSub =
    initialPain !== null && initialPain !== undefined && initialPain !== "—"
      ? `from ${initialPain}`
      : "current level";

  const weekDisplay = currentWeek ? `Week ${currentWeek}` : "Week 1";

  const kpis = [
    {
      label: "RECOVERY",
      val: weekDisplay,
      sub: "of programme",
      color: "#0C2830",
    },
    {
      label: "SESSIONS",
      val: String(completedSessions),
      sub: "total done",
      color: "#0C2830",
    },
    {
      label: "PAIN",
      val: painDisplay,
      sub: initialPainSub,
      color: "#0C2830",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        background: "white",
        padding: "24px",
        borderRadius: "20px",
        border: "1.5px solid #C4E8EC",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        flexShrink: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {kpis.map((stat, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRight: i < 3 ? "1.5px solid #E2E8F0" : "none",
            paddingLeft: i === 0 ? "0" : "24px",
            paddingRight: i === 3 ? "0" : "24px",
          }}
        >
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "12.5px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            {stat.label}
          </div>

          <div
            style={{
              color: stat.color,
              fontSize: "24px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "800",
              marginBottom: "4px",
              lineHeight: "1.2",
            }}
          >
            {stat.val}
          </div>

          <div
            style={{
              color: "#7AAAB4",
              fontSize: "13.5px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "500",
            }}
          >
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientSummaryKPIs;
