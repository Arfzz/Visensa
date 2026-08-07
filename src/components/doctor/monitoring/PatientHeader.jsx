import React from "react";
import { MessageSquare, Calendar } from "lucide-react";

const PatientHeader = ({ patient, activeTab, setActiveTab }) => {
  if (!patient) return null;

  const initials = patient.id || (patient.name ? patient.name.split(" ").map(n => n[0]).join("").substring(0, 2) : "P");
  const isNewPatient = Boolean(
    !patient.has_program &&
    (patient.patient_programs ? patient.patient_programs.length === 0 : true) &&
    patient.isNew !== false &&
    patient.status !== "Active"
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      {/* --- PATIENT IDENTITY BLOCK --- */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            background: "#1E3A44",
            color: "#3ED8C8",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "700",
            boxShadow: "0 4px 12px rgba(12, 40, 48, 0.12)",
          }}
        >
          {initials}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                color: "#0C2830",
                fontSize: "24px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "800",
              }}
            >
              {patient.name}
            </span>

            {isNewPatient ? (
              <span
                style={{
                  background: "rgba(0, 153, 166, 0.08)",
                  border: "1px solid rgba(0, 153, 166, 0.25)",
                  borderRadius: "20px",
                  padding: "3px 12px",
                  color: "#0099A6",
                  fontSize: "12.5px",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: "700",
                }}
              >
                Unassigned / New
              </span>
            ) : (
              <span
                style={{
                  background: "rgba(75, 168, 130, 0.1)",
                  border: "1px solid rgba(75, 168, 130, 0.25)",
                  borderRadius: "20px",
                  padding: "3px 12px",
                  color: "#4BA882",
                  fontSize: "12.5px",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: "700",
                }}
              >
                {patient.status || "Active"}
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              color: "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              flexWrap: "wrap",
            }}
          >
            <span>{patient.condition || "Stroke Recovery"}</span>
            <span>•</span>
            <span>{isNewPatient ? "Wk 1" : (patient.week || "Wk 1")}</span>
            <span>•</span>
            <span>{isNewPatient ? "0% compliance" : (patient.compliance ? `${patient.compliance}${patient.compliance.endsWith('%') ? '' : ' compliance'}` : "100% compliance")}</span>
            <span>•</span>
            <span style={{ fontFamily: "Space Mono, monospace" }}>
              Pain: {patient.pain && patient.pain !== "N/A" ? (patient.pain.toString().includes("/10") ? patient.pain : `${patient.pain}/10`) : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* --- VIEW SWITCH TAB BUTTONS --- */}
      {setActiveTab && (
        <div
          style={{
            display: "flex",
            background: "white",
            padding: "5px",
            borderRadius: "16px",
            border: "1.5px solid #C4E8EC",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.02)",
            opacity: isNewPatient ? 0.6 : 1,
            pointerEvents: isNewPatient ? "none" : "auto",
          }}
        >
          <button
            onClick={() => setActiveTab("Feedback")}
            style={{
              padding: "9px 18px",
              background: activeTab === "Feedback" ? "#F0FAFB" : "transparent",
              border: activeTab === "Feedback" ? "1px solid #C4E8EC" : "1px solid transparent",
              borderRadius: "12px",
              color: activeTab === "Feedback" ? "#0099A6" : "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: activeTab === "Feedback" ? "700" : "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <MessageSquare size={16} />
            <span>Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab("Plan")}
            style={{
              padding: "9px 18px",
              background: activeTab === "Plan" ? "#F0FAFB" : "transparent",
              border: activeTab === "Plan" ? "1px solid #C4E8EC" : "1px solid transparent",
              borderRadius: "12px",
              color: activeTab === "Plan" ? "#0099A6" : "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: activeTab === "Plan" ? "700" : "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <Calendar size={16} />
            <span>Therapy Plan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientHeader;
