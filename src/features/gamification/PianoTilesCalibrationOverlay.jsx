import React, { useState, useEffect, useRef } from "react";
import { Hand, CheckCircle2, Timer, Sparkles } from "lucide-react";
import { useHi5GestureDetector } from "./useHi5GestureDetector";

const HOLD_DURATION_MS = 2000;
const REST_COUNTDOWN_SEC = 3;

export const PianoTilesCalibrationOverlay = ({ onCalibrationComplete, enabled = true }) => {
  // State Machine: "WAITING_HI5" | "CALIBRATING_HI5" | "GET_READY_REST"
  const [stage, setStage] = useState("WAITING_HI5");
  const [progressPercent, setProgressPercent] = useState(0);
  const [restCountdown, setRestCountdown] = useState(REST_COUNTDOWN_SEC);

  const holdStartTimeRef = useRef(null);
  const animFrameRef = useRef(null);

  // Detector active ONLY during WAITING_HI5 and CALIBRATING_HI5
  const isDetectorActive = enabled && (stage === "WAITING_HI5" || stage === "CALIBRATING_HI5");
  const { isHi5Detected, isHandVisible } = useHi5GestureDetector({ enabled: isDetectorActive });

  // --- STAGE 1 & 2: HI-5 HOLD DETECTOR & 2S PROGRESS LOOP ---
  useEffect(() => {
    if (!enabled) return;

    if (stage === "WAITING_HI5" && isHi5Detected) {
      setStage("CALIBRATING_HI5");
      holdStartTimeRef.current = performance.now();
    } else if (stage === "CALIBRATING_HI5") {
      if (!isHi5Detected) {
        // Safety Guard: Reset if hand dropped or fist closed
        setStage("WAITING_HI5");
        setProgressPercent(0);
        holdStartTimeRef.current = null;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        return;
      }

      const updateProgress = () => {
        if (!holdStartTimeRef.current) return;
        const elapsed = performance.now() - holdStartTimeRef.current;
        const percent = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));

        setProgressPercent(percent);

        if (elapsed >= HOLD_DURATION_MS) {
          setStage("GET_READY_REST");
          setProgressPercent(100);
          holdStartTimeRef.current = null;
        } else {
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stage, isHi5Detected, enabled]);

  // --- STAGE 3: 3-SECOND ERGONOMIC REST COUNTDOWN (NO HAND REQUIRED) ---
  useEffect(() => {
    if (stage !== "GET_READY_REST") return;

    setRestCountdown(REST_COUNTDOWN_SEC);

    const intervalId = setInterval(() => {
      setRestCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (typeof onCalibrationComplete === "function") {
            onCalibrationComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [stage, onCalibrationComplete]);

  if (!enabled) return null;

  // SVG Circular Progress Calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(248, 250, 252, 0.94)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        textAlign: "center",
        userSelect: "none",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "#FFFFFF",
          border: "2px solid #C4E8EC",
          borderRadius: "24px",
          padding: "36px 32px",
          boxShadow: "0 20px 60px rgba(12, 40, 48, 0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* TOP STATUS BADGE */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "100px",
            backgroundColor:
              stage === "GET_READY_REST"
                ? "rgba(75, 168, 130, 0.12)"
                : "rgba(0, 153, 166, 0.1)",
            border:
              stage === "GET_READY_REST"
                ? "1.5px solid rgba(75, 168, 130, 0.3)"
                : "1.5px solid rgba(0, 153, 166, 0.3)",
            color: stage === "GET_READY_REST" ? "#4BA882" : "#0099A6",
            fontSize: "13px",
            fontFamily: "'Space Mono', monospace",
            fontWeight: "700",
          }}
        >
          {stage === "GET_READY_REST" ? (
            <>
              <CheckCircle2 size={16} color="#4BA882" />
              <span>Calibration Complete</span>
            </>
          ) : (
            <>
              <Sparkles size={16} color="#0099A6" />
              <span>Zero-Touch Gesture Calibration</span>
            </>
          )}
        </div>

        {/* --- STAGE 1 & 2: WAITING / CALIBRATING HI-5 CIRCULAR PROGRESS --- */}
        {(stage === "WAITING_HI5" || stage === "CALIBRATING_HI5") && (
          <div style={{ position: "relative", width: "120px", height: "120px", margin: "10px 0" }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              {/* Background Circle Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth="8"
              />
              {/* Animated Fill Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={stage === "CALIBRATING_HI5" ? "#00B8B0" : "#CBD5E1"}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.08s linear" }}
              />
            </svg>

            {/* Center Hand Icon */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor:
                    stage === "CALIBRATING_HI5"
                      ? "rgba(0, 184, 176, 0.12)"
                      : "rgba(15, 23, 42, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  transform: stage === "CALIBRATING_HI5" ? "scale(1.1)" : "scale(1)",
                }}
              >
                <Hand
                  size={32}
                  color={stage === "CALIBRATING_HI5" ? "#0099A6" : "#64748B"}
                  strokeWidth={2.2}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STAGE 3: GET READY REST COUNTDOWN DISPLAY --- */}
        {stage === "GET_READY_REST" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                backgroundColor: "rgba(75, 168, 130, 0.12)",
                border: "3px solid #4BA882",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(75, 168, 130, 0.25)",
              }}
            >
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: "800",
                  fontFamily: "'Space Mono', monospace",
                  color: "#0C2830",
                }}
              >
                {restCountdown}
              </span>
            </div>
          </div>
        )}

        {/* INSTRUCTION COPY */}
        <div>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "20px",
              fontWeight: "800",
              color: "#0C2830",
            }}
          >
            {stage === "WAITING_HI5" && "Show Open Palm Pose"}
            {stage === "CALIBRATING_HI5" && "Hold Position..."}
            {stage === "GET_READY_REST" && "Rest Your Hand"}
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "14.5px",
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            {stage === "WAITING_HI5" &&
              "Raise your hand to the camera and show an Open Palm (Hi-5) pose with 5 extended fingers to begin."}
            {stage === "CALIBRATING_HI5" &&
              "Keep your open palm steady for 2 seconds to calibrate motion sensors."}
            {stage === "GET_READY_REST" &&
              "Sensor calibrated! Rest your arm comfortably. First note falls in 3 seconds..."}
          </p>
        </div>

        {/* FOOTER HELPER INFO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#F8FAFC",
            padding: "8px 16px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            fontSize: "12.5px",
            color: "#64748B",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <Timer size={15} color="#0099A6" />
          <span>
            {stage === "WAITING_HI5" && (isHandVisible ? "Hand Detected — Show Open Palm" : "Waiting for Hand Detection")}
            {stage === "CALIBRATING_HI5" && `Calibrating Sensor (${progressPercent}%)`}
            {stage === "GET_READY_REST" && "No Hand Required — Take a Brief Rest"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PianoTilesCalibrationOverlay;
