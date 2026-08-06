import React, { useState } from "react";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

const PatientPainTrend = ({ sessionLogs = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const hasData = sessionLogs.length > 0;

  const currentPainRaw = hasData ? sessionLogs[0].newPain : null;
  const currentPain = currentPainRaw !== null && currentPainRaw !== undefined && currentPainRaw !== "—"
    ? Number(currentPainRaw)
    : null;

  const startPainRaw = hasData ? sessionLogs[sessionLogs.length - 1].oldPain : null;
  const startPain = startPainRaw !== null && startPainRaw !== undefined && startPainRaw !== "—"
    ? Number(startPainRaw)
    : null;

  let painImprovement = 0;
  let painTrendPercentage = 0;
  let isImproved = true;
  let painTrendString = "0%";

  if (currentPain !== null && startPain !== null) {
    painImprovement = startPain - currentPain;
    painTrendPercentage = startPain > 0 ? Math.round((Math.abs(painImprovement) / startPain) * 100) : 0;
    isImproved = painImprovement >= 0;
    painTrendString = isImproved ? `+${painTrendPercentage}%` : `-${painTrendPercentage}%`;
  } else {
    painTrendString = "Baseline";
  }

  const painTrendColor = isImproved ? "#4BA882" : "#C0574C";
  const painTrendBg = isImproved ? "rgba(75, 168, 130, 0.1)" : "rgba(192, 87, 76, 0.1)";

  // --- DYNAMIC CHART POINTS (STRICTLY DERIVED FROM DB SESSION LOGS) ---
  const chartLogsBase = sessionLogs.slice(0, 5).reverse();
  const dynamicChartPoints = chartLogsBase.map((log, index) => {
    const step = chartLogsBase.length > 1 ? 850 / (chartLogsBase.length - 1) : 0;
    const x = chartLogsBase.length === 1 ? 475 : 50 + index * step;
    const painVal = log.newPain !== "—" && log.newPain !== null && log.newPain !== undefined ? Number(log.newPain) : 0;
    const y = 160 - (painVal / 10) * 110;
    return { date: log.date || `Session ${index + 1}`, x, y, pain: painVal.toString() };
  });

  const polylinePoints = dynamicChartPoints.map((pt) => `${pt.x},${pt.y}`).join(" ");
  const polygonPoints = dynamicChartPoints.length > 0
    ? `50,160 ${polylinePoints} ${dynamicChartPoints[dynamicChartPoints.length - 1].x},160`
    : "";

  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        border: "1.5px solid #C4E8EC",
        padding: "28px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        flexShrink: 0,
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* CARD HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              color: "#0C2830",
              fontSize: "17px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              marginBottom: "4px",
            }}
          >
            Pain trend
          </div>
          <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif" }}>
            Overall progress
          </div>
        </div>

        {/* PROGRESS BADGE */}
        <div
          style={{
            background: painTrendBg,
            border: `1.5px solid ${painTrendColor}33`,
            color: painTrendColor,
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "14px",
            fontFamily: "Space Mono, monospace",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {isImproved ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          <span>{painTrendString}</span>
        </div>
      </div>

      {/* SVG CHART CANVAS */}
      <div
        style={{
          position: "relative",
          height: "160px",
          width: "100%",
          borderBottom: "1.5px solid #E2E8F0",
          marginBottom: "15px",
        }}
      >
        {hoveredPoint && (
          <div
            style={{
              position: "absolute",
              left: `${(hoveredPoint.x / 960) * 100}%`,
              top: `${hoveredPoint.y - 80}px`,
              transform: "translateX(-50%)",
              background: "white",
              padding: "8px 16px",
              borderRadius: "14px",
              border: "1.5px solid #C4E8EC",
              zIndex: 10,
              pointerEvents: "none",
              boxShadow: "0 10px 30px rgba(0,153,166,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <div style={{ color: "#7AAAB4", fontSize: "12px", fontFamily: "Space Mono, monospace" }}>
              {hoveredPoint.date}
            </div>
            <div style={{ color: "#0099A6", fontSize: "18px", fontFamily: "Space Mono, monospace", fontWeight: "700" }}>
              {hoveredPoint.pain}/10
            </div>
          </div>
        )}

        <svg
          viewBox="0 0 960 160"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="patientPainGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(0, 153, 166, 0.2)" />
              <stop offset="100%" stopColor="rgba(0, 153, 166, 0.0)" />
            </linearGradient>
          </defs>

          {/* GRID LINES */}
          <line x1="50" y1="40" x2="900" y2="40" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="50" y1="90" x2="900" y2="90" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* POLYGON & POLYLINE ONLY RENDER IF REAL DATA EXISTS */}
          {dynamicChartPoints.length > 0 && polygonPoints && (
            <polygon points={polygonPoints} fill="url(#patientPainGrad)" />
          )}

          {dynamicChartPoints.length > 1 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#0099A6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {dynamicChartPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.date === pt.date ? "8" : "5"}
              fill="#0099A6"
              stroke="white"
              strokeWidth="2.5"
              style={{ cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* ZERO DATA OVERLAY MESSAGE */}
        {!hasData && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "#7AAAB4",
              gap: "6px",
            }}
          >
            <Activity size={24} color="#0099A6" style={{ opacity: 0.6 }} />
            <span style={{ fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif" }}>
              No session progress recorded yet. Complete a therapy session to track your pain trend curve.
            </span>
          </div>
        )}
      </div>

      {/* X-AXIS DATES ROW */}
      {hasData && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#7AAAB4",
            fontSize: "12.5px",
            fontFamily: "Space Mono, monospace",
            padding: "0 20px",
          }}
        >
          {dynamicChartPoints.map((pt, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                textAlign: i === 0 ? "left" : i === dynamicChartPoints.length - 1 ? "right" : "center",
              }}
            >
              {pt.date}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPainTrend;
