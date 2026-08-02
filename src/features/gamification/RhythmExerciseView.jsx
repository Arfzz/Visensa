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
      {/* ── LAYER 10 (z-10): TRANSPARENT 3D HAND CANVAS ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
        <RhythmHandCanvas />
        <LeftHandWarningModal />

        {/* Live Webcam & MediaPipe Vision Detector Overlay (Top-Right) */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "220px",
            zIndex: 100,
            pointerEvents: "auto",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
          }}
        >
          <VisionTracker showCanvas={true} enablePose={false} />
        </div>
      </div>

      {/* ── LAYER 30 (z-30): RHYTHM PIANO TILES GAME & START OVERLAY ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{ pointerEvents: "auto", width: "100%", maxWidth: "720px" }}
        >
          <PianoTilesGame
            bgmUrl="/musics/fairytale.mp3"
            enableHandTracking={true}
            cooldownMs={cooldownMs}
            flexionThreshold={flexionThreshold}
            showSensitivityHUD={showTuner}
            overlayMode={true}
          />
        </div>
      </div>
    </div>
  );
};

export default RhythmExerciseView;
