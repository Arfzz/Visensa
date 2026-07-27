import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVisionStore } from "../store/zustand/VisionStore";
import { useExerciseStore, EXERCISES_LIST } from "../store/zustand/useExerciseStore";
import { useExerciseTracker } from "../hooks/useExerciseTracker";

export function ExerciseHUD() {
  const navigate = useNavigate();

  // Execute kinematics tracking hook
  useExerciseTracker();

  // --- STATE SELECTORS ---
  const isCalibrated = useVisionStore((state) => state.isCalibrated);

  const activeExerciseId = useExerciseStore((state) => state.activeExerciseId);
  const repCount = useExerciseStore((state) => state.repCount);
  const targetReps = useExerciseStore((state) => state.targetReps);
  const phase = useExerciseStore((state) => state.phase);
  const isCompleted = useExerciseStore((state) => state.isCompleted);
  const elapsedTime = useExerciseStore((state) => state.elapsedTime);
  const isTimerRunning = useExerciseStore((state) => state.isTimerRunning);

  const tickTimer = useExerciseStore((state) => state.tickTimer);
  const nextExercise = useExerciseStore((state) => state.nextExercise);
  const endSession = useExerciseStore((state) => state.endSession);

  // Current exercise metadata
  const currentExercise =
    EXERCISES_LIST.find((e) => e.id === activeExerciseId) || EXERCISES_LIST[0];

  // --- STOPWATCH TICKING LOGIC ---
  useEffect(() => {
    if (!isCalibrated || !isTimerRunning || isCompleted) return;

    const timer = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, [isCalibrated, isTimerRunning, isCompleted, tickTimer]);

  // --- AUTO-NEXT & ROUTING SESSION COMPLETE LOGIC ---
  useEffect(() => {
    if (!isCompleted) return;

    // Handle end-session redirect if Exercise 8 completed
    if (activeExerciseId >= EXERCISES_LIST.length) {
      endSession();
      const redirectTimer = setTimeout(() => {
        navigate("/session-complete");
      }, 2500);
      return () => clearTimeout(redirectTimer);
    }

    // Normal auto-next for exercises 1 to 7
    const transitionTimer = setTimeout(() => {
      nextExercise();
    }, 3000);

    return () => clearTimeout(transitionTimer);
  }, [isCompleted, activeExerciseId, nextExercise, endSession, navigate]);

  if (!isCalibrated) return null;

  // --- DERIVED UI VALUES ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getInstructionText = () => {
    if (isCompleted) {
      return activeExerciseId >= EXERCISES_LIST.length
        ? "Session Complete! Redirecting to session summary..."
        : "Exercise Completed! Loading next exercise...";
    }

    if (activeExerciseId === 8) {
      switch (phase) {
        case "WAITING_REST":
          return "Keep your hand in a relaxed position";
        case "HOLDING_REST":
          return "Hold relaxed position... (10 seconds)";
        case "COMPLETED":
          return "Session Complete!";
        default:
          return "Keep your hand in a relaxed position";
      }
    }

    if (activeExerciseId === 7) {
      return phase === "WAITING_LIFT"
        ? "Make a fist, then lift only your index finger"
        : "Lower your index finger back to a fist";
    }

    if (activeExerciseId === 6) {
      switch (phase) {
        case "WAITING_OPEN":
          return "Open your hand wide and hold position";
        case "HOLDING":
          return "Hold open position... (3 seconds)";
        case "WAITING_RELAX":
          return "Relax your hand briefly";
        default:
          return "Open your hand wide and hold position";
      }
    }

    if (activeExerciseId === 5) {
      switch (phase) {
        case "WAITING_INDEX_TAP":
          return "Tap with your Index finger";
        case "WAITING_MIDDLE_TAP":
          return "Tap with your Middle finger";
        case "WAITING_RING_TAP":
          return "Tap with your Ring finger";
        case "WAITING_PINKY_TAP":
          return "Tap with your Pinky finger";
        default:
          return "Tap fingers sequentially";
      }
    }

    if (activeExerciseId === 4) {
      return phase === "WAITING_LEFT"
        ? "Wave or tilt your wrist to the left"
        : "Wave or tilt your wrist to the right";
    }

    if (activeExerciseId === 3) {
      return phase === "WAITING_PINCH"
        ? "Pinch thumb and index tips together (like holding a coin)"
        : "Release index finger and thumb back outward";
    }

    if (activeExerciseId === 2) {
      return phase === "WAITING_UP"
        ? "Bend wrist upward (Stop gesture)"
        : "Flex wrist downward";
    }

    return phase === "WAITING_OPEN"
      ? "Open your hand wide"
      : "Form a gentle fist";
  };

  const instructionText = getInstructionText();
  const progressPercent = Math.min((repCount / targetReps) * 100, 100);

  return (
    <div
      style={{
        position: "absolute",
        top: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        width: "90%",
        maxWidth: "480px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* --- HEADER ROW WITH FLEXBOX ALIGNMENT --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Left Column: Exercise Identifier & Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              display: "block",
            }}
          >
            EXERCISE {activeExerciseId} / {EXERCISES_LIST.length}
          </span>
          <h4
            style={{
              margin: "2px 0 0 0",
              fontSize: "16px",
              fontWeight: "600",
              fontFamily: "var(--font-sans)",
              color: "var(--color-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentExercise.title}
          </h4>
        </div>

        {/* Right Flex Group: Stopwatch Pill & Reps Counter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Stopwatch Elapsed Time Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "6px 10px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "var(--font-mono)",
                color: "var(--color-text)",
              }}
            >
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Rep Counter Badge */}
          <div
            style={{
              backgroundColor: isCompleted ? "var(--color-primary-light)" : "var(--color-bg)",
              border: `1px solid ${isCompleted ? "var(--color-primary)" : "var(--color-border)"}`,
              borderRadius: "10px",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.3s ease",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "var(--font-sans)",
                color: "var(--color-primary)",
              }}
            >
              {repCount}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "500",
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-muted)",
              }}
            >
              / {targetReps}
            </span>
          </div>
        </div>
      </div>

      {/* --- PROGRESS BAR --- */}
      <div
        style={{
          width: "100%",
          height: "6px",
          backgroundColor: "var(--color-bg)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            backgroundColor: "var(--color-primary)",
            borderRadius: "3px",
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      {/* --- DYNAMIC INSTRUCTION FOOTER --- */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--color-primary)",
            boxShadow: isCompleted ? "0 0 8px var(--color-primary)" : "none",
          }}
        />
        <span
          style={{
            fontSize: "13px",
            fontWeight: isCompleted ? "700" : "500",
            fontFamily: "var(--font-sans)",
            color: isCompleted ? "var(--color-primary)" : "var(--color-text-muted)",
            transition: "color 0.3s ease",
          }}
        >
          {instructionText}
        </span>
      </div>
    </div>
  );
}

export default ExerciseHUD;
