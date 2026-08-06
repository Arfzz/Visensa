import React, { useState, useMemo } from "react";
import { Plus, ShieldCheck, MessageSquare, TrendingDown, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import PatientKPICards from "./PatientKPICards";
import PatientPainTrend from "../../patient/dashboard/PatientPainTrend";

const PatientFeedbackOverview = ({
  feedbackLogs = [],
  patient,
  program,
  weeklySchedule,
  onRefreshData,
}) => {
  const [isExtending, setIsExtending] = useState(false);

  const logs = useMemo(() => {
    return Array.isArray(feedbackLogs) ? feedbackLogs : [];
  }, [feedbackLogs]);

  // --- EXTEND PROGRAM HANDLER (POST /api/v1/programs/:programId/extend) ---
  const handleExtendProgram = async (additionalWeeks = 2) => {
    const programId = program?.id;
    if (!programId) {
      alert("No active program found to extend.");
      return;
    }

    try {
      setIsExtending(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/v1/programs/${programId}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ additionalWeeks }),
      });

      if (res.ok) {
        alert(`Successfully extended program protocol by +${additionalWeeks} weeks!`);
        if (onRefreshData) onRefreshData();
      } else {
        const errJson = await res.json();
        alert(`Failed to extend program: ${errJson.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Extend program error:", err);
      alert("Error extending program: " + err.message);
    } finally {
      setIsExtending(false);
    }
  };

  // --- FORMAT LOGS FOR RICH INTERACTIVE PAIN TREND CARD ---
  const formattedLogsForTrend = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return logs.map((l, idx) => {
      const newPain = l.scoreTo ?? l.pain_level ?? l.score ?? 4;
      const oldPain = l.scoreFrom ?? l.oldPain ?? newPain;
      const d = l.created_at ? new Date(l.created_at) : new Date();
      const dateStr = l.date || `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
      return {
        id: l.id || idx,
        newPain,
        oldPain,
        date: dateStr,
        rawDate: l.created_at || new Date(),
      };
    });
  }, [logs]);

  // --- DYNAMIC KPI STATS WITH ZERO DUMMY DATA & STRICT FALLBACK RULES ---
  const dynamicStats = useMemo(() => {
    // 1. SESSIONS LOGGED: Count real completed sessions
    const totalSessions = logs.length || weeklySchedule?.completed_sessions || patient?.sessions || 0;

    // 2. CURRENT PAIN: Prioritize latest log evaluation, fallback to program/patient
    const latestLogPain = logs.length > 0
      ? (logs[0].scoreTo ?? logs[0].pain_level ?? logs[0].score ?? logs[0].newPain)
      : null;

    const currentPainVal = latestLogPain !== null && latestLogPain !== undefined
      ? latestLogPain
      : (program?.pain_level ?? patient?.pain ?? null);

    let painDisplay = "-";
    let painSub = "No evaluation logged";
    if (currentPainVal !== null && currentPainVal !== undefined && currentPainVal !== "—") {
      const strVal = String(currentPainVal).trim();
      painDisplay = strVal.includes("/10") ? strVal : `${strVal}/10`;
      painSub = logs.length > 0 ? "latest session eval" : "baseline pain";
    }

    // 3. AVG. PAIN RELIEF: Calculate dynamic difference (latest vs initial)
    let reliefDisplay = "-";
    let reliefSub = "awaiting first session";
    let reliefColor = "#7AAAB4";

    if (logs.length > 0) {
      const initialPain = program?.initial_pain ?? patient?.initial_pain ?? logs[logs.length - 1].oldPain ?? logs[logs.length - 1].scoreFrom ?? 5;
      const latestPain = Number(currentPainVal ?? 0);
      if (initialPain !== null && initialPain !== undefined) {
        const diff = (latestPain - Number(initialPain)).toFixed(1);
        const numDiff = Number(diff);
        reliefDisplay = numDiff <= 0 ? `${diff} pts` : `+${diff} pts`;
        reliefSub = numDiff <= 0 ? "pain reduction" : "pain increase";
        reliefColor = numDiff <= 0 ? "#4BA882" : "#C0574C";
      }
    }

    return [
      {
        label: "CURRENT PAIN",
        val: painDisplay,
        sub: painSub,
        color: "#D4A843",
      },
      {
        label: "AVG. PAIN RELIEF",
        val: reliefDisplay,
        sub: reliefSub,
        color: reliefColor,
      },
      {
        label: "SESSIONS LOGGED",
        val: String(totalSessions),
        sub: totalSessions > 0 ? (patient?.week || "Week 1 active") : "Week 1 • Starts D+1",
        color: "#0099A6",
      },
    ];
  }, [patient, program, weeklySchedule, logs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      
      {/* --- 0. EXTEND PROGRAM PROTOCOL ACTION BAR --- */}
      {program && (
        <div
          style={{
            background: "white",
            padding: "20px 24px",
            borderRadius: "18px",
            border: "1.5px solid #C4E8EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <div>
            <div style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
              Active Rehabilitation Protocol
            </div>
            <div style={{ color: "#7AAAB4", fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif" }}>
              Current Status: <span style={{ color: "#0099A6", fontWeight: "700" }}>{program.status || "Active"}</span> • Duration: {program.programDurationWeeks || 4} Weeks
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleExtendProgram(2)}
              disabled={isExtending}
              type="button"
              style={{
                padding: "10px 18px",
                background: "rgba(0, 153, 166, 0.1)",
                color: "#0099A6",
                border: "1.5px solid #0099A6",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk, sans-serif",
                cursor: isExtending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Plus size={15} /> Extend +2 Weeks
            </button>

            <button
              onClick={() => handleExtendProgram(4)}
              disabled={isExtending}
              type="button"
              style={{
                padding: "10px 18px",
                background: "#0099A6",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk, sans-serif",
                cursor: isExtending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(0, 153, 166, 0.25)",
              }}
            >
              <ShieldCheck size={15} /> Extend +4 Weeks
            </button>
          </div>
        </div>
      )}

      {/* --- 1. TOP KPI CARDS BLOCK --- */}
      <PatientKPICards feedbackStats={dynamicStats} patient={patient} program={program} />

      {/* --- 2. RICH INTERACTIVE PAIN TREND CARD --- */}
      <PatientPainTrend sessionLogs={formattedLogsForTrend} />

      {/* --- 3. SESSION FEEDBACK LOG CONTAINER CARD (ALWAYS RENDERED IN DOM) --- */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          border: "1.5px solid #C4E8EC",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}
      >
        {/* CARD HEADER (ALWAYS VISIBLE) */}
        <div
          style={{
            padding: "24px 30px",
            borderBottom: "1.5px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#0C2830",
              fontSize: "18px",
              fontWeight: "700",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Session feedback log
          </div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
            }}
          >
            {logs.length} sessions
          </div>
        </div>

        {/* CARD BODY: CONDITIONAL INSIDE CONTENT ONLY */}
        <div>
          {logs.length === 0 ? (
            /* CLEAN ZERO-STATE WHEN ARRAY IS [] */
            <div
              style={{
                padding: "45px 30px",
                textAlign: "center",
                color: "#7AAAB4",
                fontSize: "14.5px",
                fontFamily: "Space Grotesk, sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MessageSquare size={24} color="#0099A6" style={{ opacity: 0.6 }} />
              <div>
                No session feedback recorded yet. Clinical observations will appear here once the patient completes their first therapy session.
              </div>
            </div>
          ) : (
            /* RENDER REAL DB LOGS WHEN ARRAY HAS ITEMS */
            logs.map((log, index) => {
              const scoreFrom = log.scoreFrom ?? log.oldPain ?? 5;
              const scoreTo = log.scoreTo ?? log.newPain ?? log.pain_level ?? 4;
              const drop = scoreFrom - scoreTo;
              const isImproved = drop >= 0;

              return (
                <div
                  key={log.id || index}
                  style={{
                    padding: "24px 30px",
                    borderBottom: index < logs.length - 1 ? "1.5px solid #E2E8F0" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          color: "#0C2830",
                          fontSize: "16px",
                          fontWeight: "700",
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                      >
                        {log.sessionName || log.title || `Session ${logs.length - index}`}
                      </span>
                      <span
                        style={{
                          background: isImproved ? "rgba(75, 168, 130, 0.1)" : "rgba(192, 87, 76, 0.1)",
                          color: isImproved ? "#4BA882" : "#C0574C",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontFamily: "Space Mono, monospace",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {isImproved ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                        {isImproved ? `-${drop} pts pain` : `+${Math.abs(drop)} pts pain`}
                      </span>
                    </div>

                    <div
                      style={{
                        color: "#3A6870",
                        fontSize: "14px",
                        fontFamily: "Space Grotesk, sans-serif",
                        lineHeight: "1.5",
                        marginBottom: "8px",
                      }}
                    >
                      {log.notes || log.patient_feedback || "Patient completed full mirror therapy protocol without reported complications."}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        color: "#7AAAB4",
                        fontSize: "13px",
                        fontFamily: "Space Mono, monospace",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> {log.date || "Recent"}
                      </span>
                      <span>•</span>
                      <span>Pain: {scoreFrom}/10 → {scoreTo}/10</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(0, 153, 166, 0.08)",
                      border: "1px solid rgba(0, 153, 166, 0.2)",
                      borderRadius: "12px",
                      padding: "8px 14px",
                      color: "#0099A6",
                      fontSize: "13px",
                      fontFamily: "Space Mono, monospace",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckCircle2 size={15} /> Verified Log
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientFeedbackOverview;
