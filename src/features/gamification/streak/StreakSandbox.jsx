import React from "react";
import StreakTopbarWidget from "./StreakTopbarWidget";
import StreakLobbyBanner from "./StreakLobbyBanner";
import StreakDevControls from "./StreakDevControls";
import StreakCelebrationModal from "./StreakCelebrationModal";
import visensaLogo from "../../../assets/visensa-logo.png";
import { Link } from "react-router-dom";

export const StreakSandbox = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#F0F2F5",
        fontFamily: "'Space Grotesk', sans-serif",
        boxSizing: "border-box",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        position: "relative",
      }}
    >
      {/* --- CELEBRATION OVERLAY MODAL --- */}
      <StreakCelebrationModal />

      {/* --- TOP NAVBAR --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #C4E8EC",
          borderRadius: "20px",
          padding: "16px 24px",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={visensaLogo} alt="VISENSA Logo" style={{ width: "26px", height: "auto" }} />
          <span
            style={{
              color: "#0C2830",
              fontSize: "22px",
              fontWeight: "800",
              letterSpacing: "1px",
            }}
          >
            VISENSA
          </span>
          <span
            style={{
              backgroundColor: "rgba(0, 153, 166, 0.08)",
              border: "1px solid #C4E8EC",
              color: "#0099A6",
              padding: "4px 10px",
              borderRadius: "100px",
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              fontWeight: "700",
            }}
          >
            Mini-Games Sandbox
          </span>
        </div>

        {/* STREAK TOPBAR WIDGET */}
        <StreakTopbarWidget />
      </div>

      {/* --- PAGE HEADER TITLE --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ color: "#0C2830", fontSize: "32px", fontWeight: "700", margin: "0 0 4px 0" }}>
            Gamification Daily Streak Sandbox
          </h1>
          <p style={{ color: "#7AAAB4", fontSize: "15px", margin: 0 }}>
            Isolated test suite for mini-games timer triggers, date rollover, freeze protection, and celebration modal.
          </p>
        </div>

        <Link
          to="/patient-dashboard"
          style={{
            color: "#0099A6",
            fontSize: "15px",
            fontWeight: "600",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>Open Patient Dashboard →</span>
        </Link>
      </div>

      {/* --- STREAK LOBBY BANNER --- */}
      <StreakLobbyBanner />

      {/* --- DEV CONTROLS & SIMULATION PANEL --- */}
      <StreakDevControls />
    </div>
  );
};

export default StreakSandbox;
