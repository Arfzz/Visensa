import React, { useState } from "react";
import { Activity, Bell, ChevronRight, CheckCircle2, Flame, Settings } from "lucide-react";

const PatientTopHeader = ({
  fullName,
  programStatus,
  notifications = [],
  currentStreak = 0,
  onOpenPractice,
  onMarkAllRead,
}) => {
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", flexShrink: 0 }}>
      {/* --- TOP GREETING & NOTIFICATION BAR --- */}
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
        <div>
          <div
            style={{
              color: "#1A2332",
              fontSize: "32px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              marginBottom: "2px",
            }}
          >
            Good morning, {fullName || "Patient"}
          </div>
          <div
            style={{
              color: "#9AABB8",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "500",
            }}
          >
            Ready for your next therapy session?
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
          {/* PROGRAM STATE PILL */}
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1px solid rgba(0, 153, 166, 0.3)",
              background: "rgba(0, 153, 166, 0.08)",
              color: "#0099A6",
              fontSize: "12.5px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Activity size={14} color="#0099A6" />
            <span>State: {programStatus || "Active"}</span>
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

            {/* NOTIFICATION PANEL DROPDOWN */}
            {showNotif && (
              <div
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  width: "360px",
                  background: "white",
                  boxShadow: "0px 12px 40px rgba(12, 40, 48, 0.12)",
                  borderRadius: "20px",
                  border: "1.5px solid #C4E8EC",
                  zIndex: 100,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1.5px solid #C4E8EC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#0C2830", fontSize: "16px", fontWeight: "700" }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          background: "#F97316",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontFamily: "Space Mono, monospace",
                          fontWeight: "700",
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0099A6",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: "14px 18px",
                          borderBottom: "1px solid #F1F5F9",
                          background: notif.unread ? "rgba(0, 153, 166, 0.03)" : "white",
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: notif.bg || "rgba(0, 153, 166, 0.1)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Activity size={18} color={notif.color || "#0099A6"} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#0C2830", fontSize: "13.5px", fontWeight: "700", marginBottom: "2px" }}>
                            {notif.title}
                          </div>
                          <div style={{ color: "#7AAAB4", fontSize: "12.5px", lineHeight: "1.4", marginBottom: "4px" }}>
                            {notif.desc}
                          </div>
                          <div style={{ color: "#94A3B8", fontSize: "11px", fontFamily: "Space Mono, monospace" }}>
                            {notif.time}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "24px", textAlign: "center", color: "#7AAAB4", fontSize: "13.5px" }}>
                      No new notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- INTERACTIVE PRACTICE WARM-UP BANNER --- */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          border: "1.5px solid #C4E8EC",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "rgba(0, 153, 166, 0.1)",
              border: "1px solid rgba(0, 153, 166, 0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Activity size={20} color="#0099A6" />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  color: "#0C2830",
                  fontSize: "15px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: "700",
                }}
              >
                Interactive Practice
              </span>
              <span style={{ color: "#7AAAB4", fontSize: "14px" }}>•</span>
              <span style={{ color: "#7AAAB4", fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif" }}>
                4-finger reflex warm-up
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* STREAK BADGE */}
          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: "20px",
              padding: "4px 12px",
              color: "#D97706",
              fontSize: "12px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Flame size={14} color="#D97706" />
            <span>{currentStreak} Days</span>
          </div>

          {/* GOAL COMPLETED BADGE */}
          <div
            style={{
              background: "rgba(75, 168, 130, 0.08)",
              border: "1px solid rgba(75, 168, 130, 0.25)",
              borderRadius: "20px",
              padding: "4px 12px",
              color: "#4BA882",
              fontSize: "12px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CheckCircle2 size={14} color="#4BA882" />
            <span>Goal Completed</span>
          </div>

          {/* OPEN PRACTICE OUTLINE BUTTON */}
          <button
            onClick={onOpenPractice}
            type="button"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1.5px solid #0099A6",
              borderRadius: "12px",
              color: "#0099A6",
              fontSize: "13.5px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <span>Open Practice</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientTopHeader;
