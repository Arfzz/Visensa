import React from "react";
import { AlertCircle, Calendar, Sparkles } from "lucide-react";

const UnassignedAlertBanner = ({ patient }) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(212, 168, 67, 0.1) 0%, rgba(0, 153, 166, 0.08) 100%)",
        border: "1.5px solid rgba(212, 168, 67, 0.3)",
        borderRadius: "20px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "24px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            background: "rgba(212, 168, 67, 0.15)",
            border: "1px solid rgba(212, 168, 67, 0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={22} color="#D4A843" strokeWidth={2.2} />
        </div>

        <div>
          <div
            style={{
              color: "#0C2830",
              fontSize: "17px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              marginBottom: "3px",
            }}
          >
            Unassigned Schedule — Action Required
          </div>
          <div
            style={{
              color: "#5B7B86",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: "1.4",
            }}
          >
            {patient?.name || "This patient"} has no active therapy schedule prescribed. Please configure the initial 8-exercise protocol below.
          </div>
        </div>
      </div>

      <div
        style={{
          background: "rgba(0, 153, 166, 0.12)",
          border: "1px solid rgba(0, 153, 166, 0.25)",
          borderRadius: "20px",
          padding: "6px 14px",
          color: "#0099A6",
          fontSize: "12.5px",
          fontFamily: "Space Mono, monospace",
          fontWeight: "700",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Sparkles size={14} />
        <span>Ready for Setup</span>
      </div>
    </div>
  );
};

export default UnassignedAlertBanner;
