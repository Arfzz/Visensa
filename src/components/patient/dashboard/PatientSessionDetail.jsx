import React from "react";
import { ArrowLeft, Clock, Activity, Calendar, ShieldCheck } from "lucide-react";

const PatientSessionDetail = ({ session, onBack }) => {
  if (!session) return null;

  const durationMin = session.durationSeconds ? Math.round(session.durationSeconds / 60) : 12;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 48px)",
        paddingRight: "10px",
        overflowY: "auto",
      }}
      className="hide-scroll"
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            border: "1.5px solid #C4E8EC",
            background: "white",
            cursor: "pointer",
            color: "#4A5568",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1
            style={{
              color: "#0C2830",
              fontSize: "28px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              margin: "0 0 4px 0",
            }}
          >
            Session Details
          </h1>
          <div style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Grotesk, sans-serif" }}>
            {session.title}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "24px",
          border: "1.5px solid #C4E8EC",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* DATE */}
          <div style={{ padding: "20px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", marginBottom: "8px" }}>
              <Calendar size={18} />
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Date</span>
            </div>
            <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
              {session.date || session.title}
            </div>
          </div>

          {/* DURATION */}
          <div style={{ padding: "20px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", marginBottom: "8px" }}>
              <Clock size={18} />
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Duration</span>
            </div>
            <div style={{ color: "#0C2830", fontSize: "18px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
              {durationMin} Minutes
            </div>
          </div>

          {/* PAIN PROGRESSION */}
          <div style={{ padding: "20px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", marginBottom: "8px" }}>
              <Activity size={18} />
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Pain Progression</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#D4A843", fontSize: "18px", fontWeight: "700", fontFamily: "Space Mono, monospace" }}>
              <span>{session.oldPain ?? "—"}</span>
              <span style={{ color: "#7AAAB4" }}>→</span>
              <span>{session.newPain ?? "—"}</span>
            </div>
          </div>

          {/* STATUS */}
          <div style={{ padding: "20px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7AAAB4", marginBottom: "8px" }}>
              <ShieldCheck size={18} />
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Status</span>
            </div>
            <div>
              <span
                style={{
                  background: session.statusBg || "rgba(0, 153, 166, 0.10)",
                  border: `1px solid ${session.statusColor || "#0099A6"}30`,
                  color: session.statusColor || "#0099A6",
                  padding: "4px 14px",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: "700",
                }}
              >
                {session.status || "Completed"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSessionDetail;
