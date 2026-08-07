import React, { useState } from "react";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";

const filterOptions = ["All sessions", "Excellent", "Good", "Fair", "Poor"];

const PatientRecentSessions = ({ sessionLogs = [] }) => {
  const [activeFilter, setActiveFilter] = useState("All sessions");

  const filteredLogs = activeFilter === "All sessions"
    ? sessionLogs
    : sessionLogs.filter((s) => s.status === activeFilter);

  const displayLogs = filteredLogs.slice(0, 4);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        border: "1.5px solid #C4E8EC",
        padding: "24px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        flexShrink: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* --- CARD HEADER & FILTER PILLS --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
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
          Recent sessions
        </div>

        {/* FILTER PILLS */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                type="button"
                style={{
                  padding: "4px 12px",
                  borderRadius: "14px",
                  border: isActive ? "1.5px solid #0099A6" : "1px solid #E2E8F0",
                  background: isActive ? "rgba(0, 153, 166, 0.1)" : "#F8FAFC",
                  color: isActive ? "#0099A6" : "#7AAAB4",
                  fontSize: "12px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: isActive ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- SESSIONS LIST --- */}
      {displayLogs.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayLogs.map((session, index) => {
            const isToday = session.isToday;
            const durationMin = session.durationSeconds ? Math.round(session.durationSeconds / 60) : 12;

            return (
              <div
                key={session.id || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  background: session.boxBg || (isToday ? "rgba(0, 153, 166, 0.04)" : "#F8FAFC"),
                  border: "1px solid #E2E8F0",
                }}
              >
                {/* DOT INDICATOR */}
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isToday ? "#0099A6" : "#E2E8F0",
                    marginRight: "16px",
                    flexShrink: 0,
                  }}
                />

                {/* DATE & STATUS */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: "#0C2830",
                        fontSize: "15px",
                        fontWeight: "600",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      {session.date || session.title || "Recent Session"}
                    </span>

                    <span
                      style={{
                        background: session.statusBg || "rgba(0, 153, 166, 0.10)",
                        border: `1px solid ${session.statusColor || "#0099A6"}30`,
                        color: session.statusColor || "#0099A6",
                        padding: "2px 10px",
                        borderRadius: "14px",
                        fontSize: "12px",
                        fontFamily: "Space Mono, monospace",
                        fontWeight: "700",
                      }}
                    >
                      {session.status || "Completed"}
                    </span>

                    {isToday && (
                      <span
                        style={{
                          color: "#0099A6",
                          fontSize: "12px",
                          fontFamily: "Space Mono, monospace",
                          fontWeight: "700",
                        }}
                      >
                        today
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      color: "#7AAAB4",
                      fontSize: "13px",
                      fontFamily: "Space Mono, monospace",
                    }}
                  >
                    {durationMin} min session
                  </div>
                </div>

                {/* PAIN TRANSITION (OLD PAIN -> NEW PAIN) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "Space Mono, monospace",
                    fontWeight: "700",
                  }}
                >
                  <span style={{ color: "#D4A843", fontSize: "15px" }}>
                    {session.oldPain ?? "—"}
                  </span>
                  <ArrowRight size={14} color="#7AAAB4" />
                  <span style={{ color: "#D4A843", fontSize: "15px" }}>
                    {session.newPain ?? "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            color: "#7AAAB4",
            fontSize: "14px",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          No recent therapy sessions logged yet.
        </div>
      )}
    </div>
  );
};

export default PatientRecentSessions;
