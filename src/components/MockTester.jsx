import React, { useState } from "react";
import { useHandStore } from "../store/zustand/useHandStore";

/**
 * Floating glassmorphism testing panel to simulate real-time CV pipeline stream.
 * Provides custom gestures to trigger the frame loop rotations imperatively.
 */
export function MockTester() {
  const [activePose, setActivePose] = useState("Rest");

  // Pre-cached poses mapping rotations to avoid garbage collection inside UI interactions
  const poses = {
    Rest: {
      wrist: { x: 0, y: 0, z: 0 },
      thumb_mcp: { x: 0, y: 0, z: 0 },
      thumb_pip: { x: 0, y: 0, z: 0 },
      thumb_dip: { x: 0, y: 0, z: 0 },
      index_mcp: { x: 0, y: 0, z: 0 },
      index_pip: { x: 0, y: 0, z: 0 },
      index_dip: { x: 0, y: 0, z: 0 },
      middle_mcp: { x: 0, y: 0, z: 0 },
      middle_pip: { x: 0, y: 0, z: 0 },
      middle_dip: { x: 0, y: 0, z: 0 },
      ring_mcp: { x: 0, y: 0, z: 0 },
      ring_pip: { x: 0, y: 0, z: 0 },
      ring_dip: { x: 0, y: 0, z: 0 },
      pinky_mcp: { x: 0, y: 0, z: 0 },
      pinky_pip: { x: 0, y: 0, z: 0 },
      pinky_dip: { x: 0, y: 0, z: 0 },
    },
    Fist: {
      wrist: { x: 0, y: 0, z: 0 },
      thumb_mcp: { x: 0.1, y: 0.1, z: 0.1 },
      thumb_pip: { x: 0.3, y: 0, z: 0 },
      thumb_dip: { x: 0.3, y: 0, z: 0 },
      index_mcp: { x: 1.2, y: 0, z: 0 },
      index_pip: { x: 1.3, y: 0, z: 0 },
      index_dip: { x: 0.8, y: 0, z: 0 },
      middle_mcp: { x: 1.2, y: 0, z: 0 },
      middle_pip: { x: 1.3, y: 0, z: 0 },
      middle_dip: { x: 0.8, y: 0, z: 0 },
      ring_mcp: { x: 1.2, y: 0, z: 0 },
      ring_pip: { x: 1.3, y: 0, z: 0 },
      ring_dip: { x: 0.8, y: 0, z: 0 },
      pinky_mcp: { x: 1.2, y: 0, z: 0 },
      pinky_pip: { x: 1.3, y: 0, z: 0 },
      pinky_dip: { x: 0.8, y: 0, z: 0 },
    },
    Point: {
      wrist: { x: 0.3, y: -0.2, z: 0 },
      thumb_mcp: { x: 0.4, y: 0.2, z: 0 },
      thumb_pip: { x: 0.5, y: 0, z: 0 },
      thumb_dip: { x: 0.3, y: 0, z: 0 },
      index_mcp: { x: 0, y: 0, z: 0 },
      index_pip: { x: 0, y: 0, z: 0 },
      index_dip: { x: 0, y: 0, z: 0 },
      middle_mcp: { x: 1.2, y: 0, z: 0 },
      middle_pip: { x: 1.3, y: 0, z: 0 },
      middle_dip: { x: 0.8, y: 0, z: 0 },
      ring_mcp: { x: 1.2, y: 0, z: 0 },
      ring_pip: { x: 1.3, y: 0, z: 0 },
      ring_dip: { x: 0.8, y: 0, z: 0 },
      pinky_mcp: { x: 1.2, y: 0, z: 0 },
      pinky_pip: { x: 1.3, y: 0, z: 0 },
      pinky_dip: { x: 0.8, y: 0, z: 0 },
    },
    Pinch: {
      wrist: { x: 0.2, y: -0.1, z: 0 },
      thumb_mcp: { x: -0.2, y: 0.6, z: 0.2 },
      thumb_pip: { x: 0.8, y: 0, z: 0 },
      thumb_dip: { x: 0.6, y: 0, z: 0 },
      index_mcp: { x: 0.8, y: 0, z: 0.1 },
      index_pip: { x: 1.0, y: 0, z: 0 },
      index_dip: { x: 0.8, y: 0, z: 0 },
      middle_mcp: { x: 0, y: 0, z: 0 },
      middle_pip: { x: 0, y: 0, z: 0 },
      middle_dip: { x: 0, y: 0, z: 0 },
      ring_mcp: { x: 0, y: 0, z: 0 },
      ring_pip: { x: 0, y: 0, z: 0 },
      ring_dip: { x: 0, y: 0, z: 0 },
      pinky_mcp: { x: 0, y: 0, z: 0 },
      pinky_pip: { x: 0, y: 0, z: 0 },
      pinky_dip: { x: 0, y: 0, z: 0 },
    },
  };

  const handlePoseChange = (name) => {
    setActivePose(name);
    // Write directly into the Zustand store state imperatively (non-reactively)
    useHandStore.getState().setHandPose(poses[name]);
    console.log("MockTester - Zustand State after update:", useHandStore.getState().handPose);
  };

  return (
    <div style={{
      position: "absolute",
      bottom: "24px",
      left: "24px",
      zIndex: 100,
      background: "rgba(20, 20, 20, 0.7)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "16px",
      padding: "24px",
      color: "#f5f5f5",
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      width: "280px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <div style={{
          width: "8px",
          height: "8px",
          backgroundColor: "#10b981",
          borderRadius: "50%",
          boxShadow: "0 0 10px #10b981"
        }} />
        <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", color: "#10b981" }}>
          Pipeline Active
        </span>
      </div>
      <h3 style={{
        margin: "0 0 4px 0",
        fontSize: "18px",
        fontWeight: 600,
        color: "#ffffff"
      }}>
        Mirror Box Controller
      </h3>
      <p style={{
        margin: "0 0 20px 0",
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.5)",
        lineHeight: "1.5"
      }}>
        Trigger transient mock poses to verify 60fps bone updates.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {Object.keys(poses).map((poseName) => {
          const isSelected = activePose === poseName;
          return (
            <button
              key={poseName}
              onClick={() => handlePoseChange(poseName)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: isSelected
                  ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                  : "rgba(255, 255, 255, 0.04)",
                color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              }}
            >
              <span>
                {poseName === "Rest" && "🍃 Rest Position"}
                {poseName === "Fist" && "✊ Closed Fist"}
                {poseName === "Point" && "👉 Pointing Index"}
                {poseName === "Pinch" && "👌 Precision Pinch"}
              </span>
              {isSelected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
