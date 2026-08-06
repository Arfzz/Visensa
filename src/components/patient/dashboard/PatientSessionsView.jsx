import React, { useState } from "react";
import { Bell, ChevronRight, ArrowRight } from "lucide-react";

const filterOptions = ["All sessions", "Excellent", "Good", "Fair", "Poor"];

const PatientSessionsView = ({
  sessionLogs = [],
  onSelectSession,
  notifications = [],
  onMarkAllRead,
}) => {
  const [activeFilter, setActiveFilter] = useState("All sessions");
  const [showNotif, setShowNotif] = useState(false);

  const filteredLogs = activeFilter === "All sessions"
    ? sessionLogs
    : sessionLogs.filter((s) => s.status === activeFilter);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        paddingRight: "10px",
        boxSizing: "border-box",
      }}
    >
      {/* --- HEADER ROW --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              color: "#0C2830",
              fontSize: "32px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              margin: "0 0 4px 0",
            }}
          >
            All sessions
          </h1>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "500",
            }}
          >
            Tap any row to view detailed analysis.
          </div>
        </div>

        {/* BELL NOTIFICATION BUTTON */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            type="button"
            style={{
              width: "42px",
              height: "42px",
              background: "white",
              borderRadius: "14px",
              boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              border: showNotif ? "1.5px solid #0099A6" : "1.5px solid #C4E8EC",
              transition: "all 0.2s ease",
            }}
          >
            <Bell size={20} color="#4A5568" />
            {unreadCount > 0 && (
              <div
                style={{
                  width: "9px",
                  height: "9px",
                  background: "#F97316",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "9px",
                  right: "10px",
                  border: "2px solid white",
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* --- FILTER PILLS & COUNT ROW --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                type="button"
                style={{
                  padding: "8px 20px",
                  borderRadius: "24px",
                  border: isActive ? "1.5px solid #0099A6" : "1px solid #E2E8F0",
                  background: isActive ? "rgba(0, 153, 166, 0.08)" : "white",
                  color: isActive ? "#0099A6" : "#7AAAB4",
                  fontSize: "14px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: isActive ? "700" : "500",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 2px 8px rgba(0,153,166,0.15)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div
          style={{
            color: "#7AAAB4",
            fontSize: "14px",
            fontFamily: "Space Mono, monospace",
            fontWeight: "500",
          }}
        >
          {filteredLogs.length} sessions
        </div>
      </div>

      {/* --- MAIN SESSIONS CONTENT BODY --- */}
      <div style={{ flex: 1, minHeight: "350px" }}>
        {filteredLogs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredLogs.map((session, index) => {
              const isToday = session.isToday;
              const durationMin = session.durationSeconds ? Math.round(session.durationSeconds / 60) : 12;

              return (
                <div
                  key={session.id || index}
                  onClick={() => onSelectSession && onSelectSession(session)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "20px 24px",
                    borderRadius: "18px",
                    background: "white",
                    border: "1.5px solid #C4E8EC",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* DOT INDICATOR */}
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: isToday ? "#0099A6" : "#E2E8F0",
                      marginRight: "20px",
                      flexShrink: 0,
                    }}
                  />

                  {/* SESSION DETAILS */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "4px",
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
                        {session.title || session.date || "Therapy Session"}
                      </span>

                      <span
                        style={{
                          background: session.statusBg || "rgba(0, 153, 166, 0.10)",
                          border: `1px solid ${session.statusColor || "#0099A6"}30`,
                          color: session.statusColor || "#0099A6",
                          padding: "3px 12px",
                          borderRadius: "16px",
                          fontSize: "12.5px",
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
                            fontSize: "12.5px",
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
                        fontSize: "13.5px",
                        fontFamily: "Space Mono, monospace",
                      }}
                    >
                      {durationMin} min session
                    </div>
                  </div>

                  {/* PAIN TRANSITION & CHEVRON */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "Space Mono, monospace",
                        fontWeight: "700",
                      }}
                    >
                      <span style={{ color: "#D4A843", fontSize: "16px" }}>
                        {session.oldPain ?? "—"}
                      </span>
                      <ArrowRight size={14} color="#7AAAB4" />
                      <span style={{ color: "#D4A843", fontSize: "16px" }}>
                        {session.newPain ?? "—"}
                      </span>
                    </div>

                    <ChevronRight size={20} color="#7AAAB4" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              minHeight: "300px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#7AAAB4",
                fontSize: "14.5px",
                fontFamily: "Space Mono, monospace",
                lineHeight: "1.6",
                maxWidth: "500px",
              }}
            >
              No sessions recorded yet. Complete a therapy session to see your history here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSessionsView;
