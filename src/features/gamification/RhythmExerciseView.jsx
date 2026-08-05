import React, { useState } from "react";
import { RhythmHandCanvas } from "./RhythmHandCanvas";
import VisionTracker from "../../components/VisionTracker";
import { LeftHandWarningModal } from "../../components/LeftHandWarningModal";
import { PianoTilesGame } from "./PianoTilesGame";

export const RhythmExerciseView = () => {
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
      {/* ── WRAPPER TANGAN & MODAL  ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        
        {/* TANGAN 3D  */}
        <div style={{ position: "absolute", inset: 0, zIndex: 50 }}>
          <RhythmHandCanvas visible={gameStatus === "playing"} />
        </div>

        {/* MODAL WARNING */}
        <div style={{ position: "relative", zIndex: 99999, pointerEvents: "auto" }}>
          <LeftHandWarningModal />
        </div>

        {/* Headless Vision Tracker */}
        {gameStatus !== "gameover" && (
          <div style={{ display: "none" }}>
            <VisionTracker showCanvas={false} enablePose={false} numHands={1} />
          </div>
        )}
      </div>

      {/* ── WRAPPER GAME UI ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
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