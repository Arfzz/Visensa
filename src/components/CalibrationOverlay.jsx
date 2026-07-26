import React, { useState, useEffect } from "react";
import { useVisionStore } from "../store/zustand/VisionStore";

// Inline keyframes to eliminate external CSS dependencies while maintaining clean animation
const KEYFRAME_STYLES = `
@keyframes calibrationPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.98); }
}
@keyframes calibrationFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export function CalibrationOverlay() {
  // --- STATE SELECTORS ---
  const calibrationProgress = useVisionStore((state) => state.calibrationProgress);
  const isCalibrated = useVisionStore((state) => state.isCalibrated);
  const calibrationWarning = useVisionStore((state) => state.calibrationWarning);

  // --- INTERNAL VISIBILITY STATE ---
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // --- CALIBRATION COMPLETION TIMING ---
  // Hold success state for 1.5s before initiating fade transition to prevent abrupt unmounting
  useEffect(() => {
    if (!isCalibrated) return;

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [isCalibrated]);

  if (!isVisible) return null;

  // --- DERIVED UI VARIABLES ---
  const clampedProgress = Math.min(Math.max(calibrationProgress, 0), 100);
  const accentColor = calibrationWarning ? "#dc2626" : "var(--color-primary)";

  // SVG Ring dimensions
  const svgRadius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * svgRadius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <>
      <style>{KEYFRAME_STYLES}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 100,
          backgroundColor: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          opacity: isFadingOut ? 0 : 1,
          transition: "opacity 0.3s ease-out",
          pointerEvents: isFadingOut ? "none" : "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "var(--color-surface)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            animation: "calibrationFadeIn 0.4s ease-out forwards",
          }}
        >
          {/* --- PROGRESS SVG RING --- */}
          <div style={{ position: "relative", width: "128px", height: "128px", marginBottom: "24px" }}>
            <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="64"
                cy="64"
                r={svgRadius}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="64"
                cy="64"
                r={svgRadius}
                fill="none"
                stroke={accentColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out",
                }}
              />
            </svg>

            {/* Inner Percentage Display */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isCalibrated ? (
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: "700",
                    fontFamily: "var(--font-sans)",
                    color: accentColor,
                    letterSpacing: "-0.5px",
                    transition: "color 0.3s ease-out",
                  }}
                >
                  {Math.round(clampedProgress)}%
                </span>
              )}
            </div>
          </div>

          {/* --- TEXT MESSAGES & WARNING HANDLING --- */}
          {isCalibrated ? (
            <div>
              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Calibration Complete!
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Initializing 3D mirror workspace...
              </p>
            </div>
          ) : calibrationWarning ? (
            <div
              style={{
                animation: "calibrationPulse 2s infinite ease-in-out",
              }}
            >
              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#dc2626",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Keep hand centered in camera view
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Ensure all fingers and palm are clearly visible within the frame.
              </p>
            </div>
          ) : (
            <div>
              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Hand Sensor Calibration
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-sans)",
                  lineHeight: "1.5",
                }}
              >
                Position your palm facing the camera to begin initial scanning.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CalibrationOverlay;
