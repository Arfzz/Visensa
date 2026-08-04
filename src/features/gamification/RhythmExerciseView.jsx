import React, { useState } from "react";
import { RhythmHandCanvas } from "./RhythmHandCanvas";
import VisionTracker from "../../components/VisionTracker";
import { LeftHandWarningModal } from "../../components/LeftHandWarningModal";
import { PianoTilesGame } from "./PianoTilesGame";

export const RhythmExerciseView = () => {
  // Standalone finger-only tracking (wrist root statically frozen in space)
  const [cooldownMs, setCooldownMs] = useState(280);
  const [flexionThreshold, setFlexionThreshold] = useState(1.45);
  const [showTuner, setShowTuner] = useState(true);
  const [gameStatus, setGameStatus] = useState("idle");

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* ── LAYER 10 (z-10): TRANSPARENT 3D HAND CANVAS & DEBUGGER OVERLAY ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none" }}>
        {/* Hide 3D Hand Canvas during calibration/countdown; mount only when gameStatus === 'playing' */}
        <RhythmHandCanvas visible={gameStatus === "playing"} />
        <LeftHandWarningModal />

        {/* Headless MediaPipe Vision Detector (No Camera Feed Rendered) */}
        <div style={{ display: "none" }}>
          <VisionTracker showCanvas={false} enablePose={false} numHands={1} />
        </div>
      </div>

      {/* ── LAYER 20 (z-20): RHYTHM PIANO TILES GAME & START OVERLAY ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{ pointerEvents: "auto", width: "100%", maxWidth: "1280px" }}
        >
          <PianoTilesGame
            bgmUrl="/musics/fairytale.mp3"
            enableHandTracking={true}
            cooldownMs={cooldownMs}
            flexionThreshold={flexionThreshold}
            showSensitivityHUD={showTuner}
            overlayMode={true}
            onGameStatusChange={setGameStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default RhythmExerciseView;
