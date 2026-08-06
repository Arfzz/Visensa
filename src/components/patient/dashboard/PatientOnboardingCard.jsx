import React from "react";
import { Clock, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";

const PatientOnboardingCard = ({ patient, onOpenPractice }) => {
  const patientName = patient?.name || "Patient";
  const doctorName = patient?.doctor?.name || "your therapist";

  return (
    <div
      style={{
        background: "white",
        borderRadius: "24px",
        border: "1.5px solid #C4E8EC",
        padding: "36px",
        boxShadow: "0 8px 30px rgba(0, 153, 166, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        marginBottom: "10px",
      }}
    >
      {/* --- HEADER BLOCK --- */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "rgba(0, 153, 166, 0.1)",
            borderRadius: "18px",
            border: "1.5px solid rgba(0, 153, 166, 0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Clock size={28} color="#0099A6" />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "#0C2830",
                fontSize: "24px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
              }}
            >
              Welcome to Visensa, {patientName}!
            </span>

            <span
              style={{
                background: "rgba(75, 168, 130, 0.1)",
                border: "1px solid rgba(75, 168, 130, 0.3)",
                color: "#4BA882",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShieldCheck size={14} color="#4BA882" /> Daily Streak Protected
            </span>
          </div>

          <p
            style={{
              color: "#3A6870",
              fontSize: "15px",
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: "1.6",
              margin: 0,
              maxWidth: "680px",
            }}
          >
            Your clinical account is active. Dr. {doctorName} is currently reviewing your intake data to prescribe your custom rehabilitation schedule. Your exercises and analytics will unlock here automatically once your schedule begins.
          </p>
        </div>
      </div>

      {/* --- PRACTICE CTA BANNER --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#F0FAFB",
          padding: "20px 24px",
          borderRadius: "16px",
          border: "1px solid #C4E8EC",
          marginTop: "4px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Sparkles size={20} color="#0099A6" />
          <span
            style={{
              color: "#0C2830",
              fontSize: "15px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "600",
            }}
          >
            Want to warm up while waiting? Try interactive practice.
          </span>
        </div>

        <button
          onClick={onOpenPractice}
          type="button"
          style={{
            padding: "10px 20px",
            background: "#0099A6",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0, 153, 166, 0.2)",
          }}
        >
          <span>Open Practice</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PatientOnboardingCard;
