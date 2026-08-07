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
