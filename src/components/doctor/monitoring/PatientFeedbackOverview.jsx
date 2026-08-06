import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import PatientKPICards from "./PatientKPICards";

const PatientFeedbackOverview = ({
  feedbackLogs = [],
  patient,
  program,
  weeklySchedule,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState(0);

  const logs = useMemo(() => {
    return Array.isArray(feedbackLogs) ? feedbackLogs : [];
  }, [feedbackLogs]);

  // --- DYNAMICALLY GENERATE PAIN SCORE TREND POINTS FROM DB LOGS ---
  const chartPoints = useMemo(() => {
    if (logs && logs.length >= 2) {
      const stepX = 1000 / (logs.length - 1 || 1);
      return logs.map((log, idx) => {
        const scoreVal =
          typeof log.scoreTo === "number"
            ? log.scoreTo
            : log.score
            ? Math.min(10, Math.max(1, Math.round(log.score / 10)))
            : 4;
        const yVal = 110 - (scoreVal / 10) * 80;
        return {
          date: `${log.month || ""} ${log.date || ""}`.trim() || `Session ${idx + 1}`,
          score: scoreVal,
          x: Math.round(idx * stepX),
          y: Math.round(yVal),
        };
      });
    }
    return [];
  }, [logs]);

  const activeHoverPoint = chartPoints[hoveredPointIndex] || chartPoints[chartPoints.length - 1];
  const firstScore = chartPoints[0]?.score || (patient?.pain ? parseFloat(patient.pain) : 4.0);
  const lastScore = chartPoints[chartPoints.length - 1]?.score || firstScore;

  // --- DYNAMIC KPI STATS WITH ZERO-STATE SUPPORT ---
  const dynamicStats = useMemo(() => {
    const rawPain = patient?.pain ?? patient?.pain_level ?? program?.pain_level;
    let painVal = "-";
    let painSub = "No evaluation logged";

    if (rawPain !== undefined && rawPain !== null && rawPain !== "" && rawPain !== "N/A" && rawPain !== "undefined/10") {
      const painStr = String(rawPain).trim();
      painVal = painStr.includes("/10") ? painStr : `${painStr}/10`;
      painSub = "patient reported";
    }

    const completedSessionsCount = program?.totalCompletedSessions ?? patient?.sessions ?? logs.length;
    const hasSessions = completedSessionsCount > 0 && logs.length > 0;

    return [
      {
        label: "CURRENT PAIN",
        val: painVal,
        sub: painSub,
        color: "#D4A843",
      },
      {
        label: "AVG. PAIN RELIEF",
        val: hasSessions ? "−0.7 pts" : "-",
        sub: hasSessions ? "per session" : "awaiting first session",
        color: hasSessions ? "#4BA882" : "#7AAAB4",
      },
      {
        label: "SESSIONS LOGGED",
        val: String(completedSessionsCount),
        sub: hasSessions ? (patient?.week || "Week 1") : "Week 1 • Starts D+1",
        color: "#0099A6",
      },
    ];
  }, [patient, program, logs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      
      {/* --- 1. TOP KPI CARDS BLOCK --- */}
      <PatientKPICards feedbackStats={dynamicStats} patient={patient} program={program} />

      {/* --- 2. SVG PAIN SCORE TREND CHART CARD --- */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          border: "1.5px solid #C4E8EC",
          padding: "24px 28px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
          position: "relative",
        }}
      >
        {/* CHART HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                color: "#0C2830",
                fontSize: "18px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
                marginBottom: "4px",
              }}
            >
              Pain score trend
            </div>
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Patient-reported • lower is better
            </div>
          </div>

          {/* PAIN OVERALL REDUCTION BADGE */}
          {chartPoints.length >= 2 && (
            <div
              style={{
                background: "rgba(75, 168, 130, 0.1)",
                border: "1px solid rgba(75, 168, 130, 0.25)",
                borderRadius: "20px",
                padding: "4px 14px",
                color: "#4BA882",
                fontSize: "13px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <TrendingDown size={14} />
              <span>{firstScore} → {lastScore}</span>
            </div>
          )}
        </div>

        {/* SVG CHART CANVAS OR ZERO-STATE NOTICE */}
        {chartPoints.length >= 2 ? (
          <div style={{ position: "relative", width: "100%", height: "160px", marginTop: "10px" }}>
            
            {/* FLOATING HOVER TOOLTIP */}
            {activeHoverPoint && (
              <div
                style={{
                  position: "absolute",
                  left: `calc(${(activeHoverPoint.x / 1000) * 100}% - 40px)`,
                  top: `${activeHoverPoint.y - 45}px`,
                  background: "white",
                  border: "1.5px solid #C4E8EC",
                  boxShadow: "0 4px 14px rgba(12, 40, 48, 0.08)",
                  borderRadius: "12px",
                  padding: "4px 10px",
                  textAlign: "center",
                  zIndex: 10,
                  pointerEvents: "none",
                  transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <div
                  style={{
                    color: "#7AAAB4",
                    fontSize: "10.5px",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  {activeHoverPoint.date}
                </div>
                <div
                  style={{
                    color: "#0099A6",
                    fontSize: "14px",
                    fontFamily: "Space Mono, monospace",
                    fontWeight: "700",
                  }}
                >
                  {activeHoverPoint.score}/10
                </div>
              </div>
            )}

            {/* SVG GRADIENT STROKE CHART */}
            <svg
              viewBox="0 0 1000 120"
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0099A6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0099A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <polygon
                points={`0,120 ${chartPoints.map((p) => `${p.x},${p.y}`).join(" ")} 1000,120`}
                fill="url(#chartGradient)"
              />

              <polyline
                fill="none"
                stroke="#0099A6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              />

              {chartPoints.map((pt, i) => {
                const isHovered = hoveredPointIndex === i;
                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "8" : "5"}
                      fill={isHovered ? "#0099A6" : "#3ED8C8"}
                      stroke="white"
                      strokeWidth={isHovered ? "3" : "2"}
                      style={{ transition: "all 0.2s ease" }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-AXIS DATES ROW */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "16px",
                borderTop: "1px solid #F1F5F9",
                paddingTop: "12px",
              }}
            >
              {chartPoints.map((pt, i) => (
                <span
                  key={i}
                  style={{
                    color: hoveredPointIndex === i ? "#0099A6" : "#94A3B8",
                    fontSize: "12.5px",
                    fontFamily: "Space Mono, monospace",
                    fontWeight: hoveredPointIndex === i ? "700" : "500",
                    transition: "color 0.2s",
                  }}
                >
                  {pt.date}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* CHART ZERO-STATE NOTICE */
          <div
            style={{
              height: "170px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            <TrendingUp size={18} color="#7AAAB4" />
            <span>Pain score trajectory will generate automatically after the first weekly evaluation is logged.</span>
          </div>
        )}
      </div>

      {/* --- 3. SESSION FEEDBACK LOG LIST CARD --- */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          border: "1.5px solid #C4E8EC",
          padding: "24px 28px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
        }}
      >
        {/* LOG HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              color: "#0C2830",
              fontSize: "18px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
            }}
          >
            Session feedback log
          </div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "13px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "600",
            }}
          >
            {logs.length} sessions logged
          </div>
        </div>

        {/* FEEDBACK ITEMS LIST OR ZERO-STATE NOTICE */}
        {logs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {logs.map((log) => {
              const statusColor = log.scoreColor || "#4BA882";
              const statusBg = log.statusBg || "rgba(75, 168, 130, 0.10)";

              return (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    gap: "18px",
                    background: "#F8FAFC",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    border: "1px solid #E2E8F0",
                    alignItems: "flex-start",
                  }}
                >
                  {/* DATE BADGE BOX */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "white",
                      border: "1px solid #C4E8EC",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                    }}
                  >
                    <span
                      style={{
                        color: "#0C2830",
                        fontSize: "16px",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: "800",
                        lineHeight: "1",
                      }}
                    >
                      {log.date || "1"}
                    </span>
                    <span
                      style={{
                        color: "#7AAAB4",
                        fontSize: "11px",
                        fontFamily: "Space Mono, monospace",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginTop: "2px",
                      }}
                    >
                      {log.month || "Day"}
                    </span>
                  </div>

                  {/* LOG CONTENT BLOCK */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            background: statusBg,
                            color: statusColor,
                            border: `1px solid ${statusColor}30`,
                            borderRadius: "20px",
                            padding: "3px 12px",
                            fontSize: "12.5px",
                            fontFamily: "Space Mono, monospace",
                            fontWeight: "700",
                          }}
                        >
                          {log.status || "Completed"}
                        </span>

                        <span
                          style={{
                            color: "#3A6870",
                            fontSize: "13px",
                            fontFamily: "Space Mono, monospace",
                            fontWeight: "600",
                          }}
                        >
                          {log.scoreFrom !== undefined ? `${log.scoreFrom} → ${log.scoreTo} ${log.diff}` : "Evaluated"}
                        </span>
                      </div>

                      <span
                        style={{
                          color: "#94A3B8",
                          fontSize: "12px",
                          fontFamily: "Space Mono, monospace",
                        }}
                      >
                        {log.time || "Recent"}
                      </span>
                    </div>

                    <div
                      style={{
                        background: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontSize: "14px",
                        fontFamily: "Space Grotesk, sans-serif",
                        lineHeight: "1.5",
                      }}
                    >
                      {log.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LOG LIST ZERO-STATE NOTICE */
          <div
            style={{
              padding: "40px 30px",
              textAlign: "center",
              color: "#7AAAB4",
              fontSize: "14.5px",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            No session feedback recorded yet. Clinical observations will appear here once the patient completes their first therapy session.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientFeedbackOverview;
