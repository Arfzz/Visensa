import React from "react";

const PatientKPICards = ({ feedbackStats, patient, program }) => {
  // --- PAIN SCORE FORMATTER ---
  const formatPainDisplay = (val) => {
    if (val === "-" || (!val && val !== 0) || val === "N/A" || val === "undefined/10") return "-";
    const strVal = String(val).trim();
    if (strVal.includes("/10")) return strVal;
    return `${strVal}/10`;
  };

  const rawPain = patient?.pain ?? patient?.pain_level ?? program?.pain_level;
  const initialPainVal = rawPain !== undefined && rawPain !== null && rawPain !== "" && rawPain !== "N/A"
    ? formatPainDisplay(rawPain)
    : "-";

  const stats = feedbackStats || [
    {
      label: "CURRENT PAIN",
      val: initialPainVal,
      sub: initialPainVal === "-" ? "No evaluation logged" : "patient reported",
      color: "#D4A843",
    },
    {
      label: "AVG. PAIN RELIEF",
      val: "-",
      sub: "awaiting first session",
      color: "#7AAAB4",
    },
    {
      label: "SESSIONS LOGGED",
      val: patient?.sessions !== undefined ? String(patient.sessions) : "0",
      sub: patient?.week || "Week 1",
      color: "#0099A6",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginBottom: "24px",
      }}
    >
      {stats.map((stat, idx) => {
        const displayVal = stat.label === "CURRENT PAIN" ? formatPainDisplay(stat.val) : stat.val;

        return (
          <div
            key={idx}
            style={{
              background: "white",
              padding: "24px 28px",
              borderRadius: "20px",
              border: "1.5px solid #C4E8EC",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "12px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              {stat.label}
            </div>

            <div
              style={{
                color: stat.color || "#0C2830",
                fontSize: "36px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "800",
                lineHeight: "1",
                marginBottom: "8px",
              }}
            >
              {displayVal}
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
        );
      })}
    </div>
  );
};

export default PatientKPICards;
