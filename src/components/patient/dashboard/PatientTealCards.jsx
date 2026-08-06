import React from "react";

const PatientTealCards = ({
  currentPain,
  initialPain,
  sessionsThisMonth = 0,
  monthlyGoal = 8,
}) => {
  const painValDisplay = currentPain !== null && currentPain !== undefined && currentPain !== "—" && currentPain !== ""
    ? String(currentPain).replace("/10", "").trim()
    : "-";

  const startPainDisplay = initialPain !== null && initialPain !== undefined && initialPain !== "—" && initialPain !== ""
    ? initialPain
    : null;

  let painDiffText = "No evaluation recorded";
  if (painValDisplay !== "-" && startPainDisplay !== null) {
    const diff = Number(painValDisplay) - Number(startPainDisplay);
    painDiffText = diff > 0
      ? `↑ from ${startPainDisplay} at start`
      : diff < 0
        ? `↓ from ${startPainDisplay} at start`
        : `from ${startPainDisplay} at start`;
  } else if (painValDisplay !== "-") {
    painDiffText = "Current baseline level";
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        height: "230px",
        flexShrink: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* --- LEFT DARK TEAL CARD: PAIN TODAY --- */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
          borderRadius: "24px",
          padding: "24px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 18px rgba(0, 153, 166, 0.25)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
              opacity: 0.85,
              marginBottom: "12px",
            }}
          >
            Pain today
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                fontSize: "42px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                lineHeight: "1",
              }}
            >
              {painValDisplay}
            </span>
            <span
              style={{
                fontSize: "18px",
                fontFamily: "Space Mono, monospace",
                opacity: 0.8,
              }}
            >
              /10
            </span>
          </div>

          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              opacity: 0.85,
            }}
          >
            {painDiffText}
          </div>
        </div>

        {/* 7 MINI STEP BARS */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            height: "36px",
            alignItems: "flex-end",
            marginTop: "16px",
          }}
        >
          {[0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1].map((opacity, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.25)",
                height: `${40 + idx * 10}%`,
                borderRadius: "4px",
                opacity,
              }}
            />
          ))}
        </div>
      </div>

      {/* --- RIGHT MEDIUM TEAL CARD: SESSIONS THIS MONTH --- */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #3ED8C8 0%, #28C0AE 100%)",
          borderRadius: "24px",
          padding: "24px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 18px rgba(62, 216, 200, 0.25)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
              opacity: 0.85,
              marginBottom: "12px",
            }}
          >
            Sessions this month
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                fontSize: "42px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                lineHeight: "1",
              }}
            >
              {sessionsThisMonth}
            </span>
            <span
              style={{
                fontSize: "18px",
                fontFamily: "Space Mono, monospace",
                opacity: 0.85,
              }}
            >
              sessions
            </span>
          </div>

          <div
            style={{
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              opacity: 0.85,
            }}
          >
            Goal: {monthlyGoal}/month
          </div>
        </div>

        {/* 7 MINI STEP BARS */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            height: "36px",
            alignItems: "flex-end",
            marginTop: "16px",
          }}
        >
          {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((opacity, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.3)",
                height: `${45 + idx * 9}%`,
                borderRadius: "4px",
                opacity,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientTealCards;
