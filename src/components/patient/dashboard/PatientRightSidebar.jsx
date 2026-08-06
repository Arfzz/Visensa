import React, { useRef } from "react";
import { Play, Lock } from "lucide-react";
import avatarHands from "../../../assets/avatar-hands.png";

const PatientRightSidebar = ({
  isCompletedReview = false,
  onStartSession,
  currentPain,
  initialPain,
  currentWeek = 1,
  completedSessions = 0,
  jointAccuracy,
  doctorName,
  nextReviewDate,
}) => {
  const sidebarRef = useRef(null);

  const painValDisplay = currentPain !== null && currentPain !== undefined && currentPain !== "—" && currentPain !== ""
    ? String(currentPain).replace("/10", "").trim()
    : "-";

  const startPainDisplay = initialPain !== null && initialPain !== undefined && initialPain !== "—" && initialPain !== ""
    ? initialPain
    : null;

  let painDiffSymbol = "=";
  let painSubtext = "baseline level";
  if (painValDisplay !== "-" && startPainDisplay !== null) {
    const diff = Number(painValDisplay) - Number(startPainDisplay);
    painDiffSymbol = diff > 0 ? "↑" : diff < 0 ? "↓" : "=";
    painSubtext = `${painDiffSymbol} from ${startPainDisplay}`;
  } else if (painValDisplay !== "-") {
    painSubtext = "baseline level";
  } else {
    painSubtext = "no data";
  }

  const accuracyDisplay = jointAccuracy !== null && jointAccuracy !== undefined ? jointAccuracy : 0;
  const docNameDisplay = doctorName ? (doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`) : "Clinical Team";
  const reviewDateDisplay = nextReviewDate || "Schedule Pending";

  return (
    <div
      ref={sidebarRef}
      data-lenis-prevent="true"
      onWheel={(e) => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop += e.deltaY;
        }
      }}
      className="right-panel hide-scroll"
      style={{
        width: "380px",
        minWidth: "360px",
        height: "100%",
        maxHeight: "100%",
        flex: "0 0 auto",
        background: "linear-gradient(160deg, #EBF5F7 0%, #F0F4F8 40%, #EEF5ED 100%)",
        borderRadius: "20px",
        border: "1.5px solid #C4CFEC",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowY: "auto",
        boxSizing: "border-box",
        minHeight: 0,
      }}
    >
      {/* --- TOP CTA BUTTON --- */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        {isCompletedReview ? (
          <button
            disabled
            type="button"
            style={{
              width: "100%",
              padding: "16px",
              background: "rgba(122, 170, 180, 0.25)",
              border: "1.5px solid #7AAAB4",
              borderRadius: "16px",
              color: "#4A5568",
              fontSize: "15px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              cursor: "not-allowed",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <Lock size={16} />
            <span>Program Completed (Pending Review)</span>
          </button>
        ) : (
          <button
            onClick={onStartSession}
            type="button"
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #C2EB30 0%, #9AC404 100%)",
              border: "none",
              borderRadius: "16px",
              color: "white",
              fontSize: "16px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(154, 196, 4, 0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <Play size={18} fill="white" color="white" />
            <span>Start today's session</span>
          </button>
        )}

        <div style={{ color: "#7AAAB4", fontSize: "13px", fontFamily: "Space Mono, monospace" }}>
          {isCompletedReview
            ? "Mandatory exercises paused · Play Minigames"
            : "8 exercises · ~12 min · Left hand"}
        </div>
      </div>

      {/* --- HAND GRAPHIC & FLOATING OVERLAY CARDS CANVAS --- */}
      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "240px",
            height: "240px",
            background: "radial-gradient(circle, rgba(59,184,176,0.15) 0%, rgba(255,255,255,0) 70%)",
            position: "absolute",
            zIndex: 1,
          }}
        />

        <img
          className="animate-float-img"
          src={avatarHands}
          alt="Hand overlay illustration"
          style={{
            width: "180px",
            position: "absolute",
            zIndex: 2,
            filter: "invert(52%) sepia(87%) saturate(1832%) hue-rotate(141deg) brightness(95%) contrast(101%)",
            opacity: 0.6,
          }}
        />

        {/* 1. JOINT ACCURACY CARD */}
        <div
          className="animate-float-1"
          style={{
            position: "absolute",
            top: "0%",
            right: "5%",
            background: "white",
            padding: "16px",
            borderRadius: "18px",
            boxShadow: "0 8px 24px rgba(59,184,176,0.15)",
            border: "1.5px solid rgba(59,184,176,0.2)",
            zIndex: 3,
          }}
        >
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "11px",
              fontFamily: "Space Mono, monospace",
              marginBottom: "8px",
              letterSpacing: "1px",
            }}
          >
            JOINT ACCURACY
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "6px" }}>
            <span
              style={{
                color: "#3ED8C8",
                fontSize: "30px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              {accuracyDisplay}
            </span>
            <span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono, monospace" }}>
              %
            </span>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0.5, 0.6, 0.7, 0.8, 1].map((opacity, idx) => (
              <div
                key={idx}
                style={{
                  width: "14px",
                  height: "8px",
                  background: "#3ED8C8",
                  borderRadius: "2px",
                  opacity,
                }}
              />
            ))}
          </div>
        </div>

        {/* 2. PAIN LEVEL CARD */}
        <div
          className="animate-float-2"
          style={{
            position: "absolute",
            top: "40%",
            left: "0%",
            background: "white",
            padding: "16px",
            borderRadius: "18px",
            boxShadow: "0 8px 24px rgba(200,112,74,0.12)",
            border: "1.5px solid rgba(200,112,74,0.2)",
            zIndex: 3,
          }}
        >
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "11px",
              fontFamily: "Space Mono, monospace",
              marginBottom: "8px",
              letterSpacing: "1px",
            }}
          >
            PAIN LEVEL
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "4px" }}>
            <span
              style={{
                color: "#0099A6",
                fontSize: "30px",
                fontFamily: "Space Mono, monospace",
                fontWeight: "700",
              }}
            >
              {painValDisplay}
            </span>
            <span style={{ color: "#7AAAB4", fontSize: "14px", fontFamily: "Space Mono, monospace" }}>
              /10
            </span>
          </div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {painSubtext}
          </div>
        </div>

        {/* 3. RECOVERY CARD */}
        <div
          className="animate-float-3"
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            background: "white",
            padding: "16px",
            borderRadius: "18px",
            boxShadow: "0 8px 24px rgba(75,168,130,0.1)",
            border: "1.5px solid rgba(75,168,130,0.2)",
            zIndex: 3,
          }}
        >
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "11px",
              fontFamily: "Space Mono, monospace",
              marginBottom: "8px",
              letterSpacing: "1px",
            }}
          >
            RECOVERY
          </div>
          <div
            style={{
              color: "#4BA882",
              fontSize: "22px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: "800",
              marginBottom: "2px",
            }}
          >
            Week {currentWeek}
          </div>
          <div style={{ color: "#7AAAB4", fontSize: "12.5px", fontFamily: "Space Grotesk, sans-serif" }}>
            {completedSessions} sessions done
          </div>
        </div>
      </div>

      {/* --- NEXT REVIEW CARD --- */}
      <div
        style={{
          background: "white",
          borderRadius: "18px",
          border: "1.5px solid #C4E8EC",
          padding: "20px",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            color: "#7AAAB4",
            fontSize: "11.5px",
            fontFamily: "Space Mono, monospace",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginBottom: "8px",
            fontWeight: "700",
          }}
        >
          NEXT REVIEW
        </div>
        <div
          style={{
            color: "#0C2830",
            fontSize: "18px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "800",
            marginBottom: "4px",
          }}
        >
          {reviewDateDisplay}
        </div>
        <div style={{ color: "#7AAAB4", fontSize: "13.5px", fontFamily: "Space Grotesk, sans-serif" }}>
          {docNameDisplay}
        </div>
      </div>
    </div>
  );
};

export default PatientRightSidebar;
