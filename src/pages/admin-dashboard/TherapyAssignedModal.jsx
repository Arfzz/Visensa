import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  X,
  User,
} from "lucide-react";

export const TherapyAssignedModal = ({
  isOpen,
  onClose,
  assignedData,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !assignedData) return null;

  const {
    patientName = "Margaret Lim",
    frequencyPerWeek = 3,
    restIntervalDays = 1,
    programDurationWeeks = 4,
    startDate = "Tomorrow",
    endDate = "In 4 Weeks",
    totalSessions = 12,
  } = assignedData;

  const handleNavigatePatientDashboard = () => {
    onClose();
    navigate("/patient-dashboard");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "white",
          borderRadius: "24px",
          padding: "32px 28px",
          boxShadow: "0px 24px 60px rgba(12, 40, 48, 0.25)",
          border: "1.5px solid #C4E8EC",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(0, 153, 166, 0.08)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "#7AAAB4",
            transition: "all 0.2s",
          }}
        >
          <X size={18} />
        </button>

        {/* HERO ICON */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(62,216,200,0.25) 0%, rgba(0,153,166,0.08) 100%)",
            border: "2px solid rgba(0, 153, 166, 0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "20px",
            boxShadow: "0 8px 24px rgba(0, 153, 166, 0.15)",
          }}
        >
          <ShieldCheck size={46} color="#0099A6" strokeWidth={2.2} />
        </div>

        {/* HEADER & TITLE */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              color: "#0099A6",
              fontSize: "12px",
              fontFamily: "Space Mono, monospace",
              fontWeight: "700",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Clinical Protocol Published
          </div>
          <div
            style={{
              color: "#0C2830",
              fontSize: "22px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "800",
              lineHeight: "1.25",
              marginBottom: "8px",
            }}
          >
            THERAPY PROTOCOL ASSIGNED
          </div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: "1.4",
            }}
          >
            Schedule successfully published to patient's clinical device.
          </div>
        </div>

        {/* CLINICAL SUMMARY CARD */}
        <div
          style={{
            width: "100%",
            background: "#F8FAFC",
            border: "1.5px solid #E2E8F0",
            borderRadius: "18px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* PATIENT */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: "10px",
            }}
          >
            <span
              style={{
                color: "#7AAAB4",
                fontSize: "12px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              PATIENT
            </span>
            <span
              style={{
                color: "#0C2830",
                fontSize: "15px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <User size={15} color="#0099A6" />
              {patientName}
            </span>
          </div>

          {/* FREQUENCY */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: "10px",
            }}
          >
            <span
              style={{
                color: "#7AAAB4",
                fontSize: "12px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              FREQUENCY
            </span>
            <span
              style={{
                color: "#0C2830",
                fontSize: "14px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "600",
              }}
            >
              {frequencyPerWeek}x a week • {restIntervalDays} Day Rest Interval
            </span>
          </div>

          {/* TOTAL DURATION */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: "10px",
            }}
          >
            <span
              style={{
                color: "#7AAAB4",
                fontSize: "12px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              TOTAL DURATION
            </span>
            <span
              style={{
                color: "#0C2830",
                fontSize: "14px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "600",
              }}
            >
              {programDurationWeeks} Weeks ({totalSessions} Sessions total)
            </span>
          </div>

          {/* EFFECTIVE DATE */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: "10px",
            }}
          >
            <span
              style={{
                color: "#7AAAB4",
                fontSize: "12px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              EFFECTIVE DATE
            </span>
            <span
              style={{
                color: "#0099A6",
                fontSize: "13.5px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              {startDate} — {endDate}
            </span>
          </div>

          {/* PROTOCOL */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#7AAAB4",
                fontSize: "12px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              PROTOCOL
            </span>
            <span
              style={{
                color: "#0099A6",
                fontSize: "13.5px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Activity size={15} color="#0099A6" />
              Visensa Fixed 8-Exercise Package
            </span>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #0099A6 0%, #007580 100%)",
              boxShadow: "0px 4px 18px rgba(0, 153, 166, 0.3)",
              borderRadius: "14px",
              border: "none",
              color: "white",
              fontSize: "15px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>Return to Monitoring</span>
          </button>

          <button
            onClick={handleNavigatePatientDashboard}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(0, 153, 166, 0.08)",
              border: "1.5px solid rgba(0, 153, 166, 0.25)",
              borderRadius: "14px",
              color: "#0099A6",
              fontSize: "14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>View Patient Dashboard</span>
            <ArrowRight size={16} color="#0099A6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapyAssignedModal;
