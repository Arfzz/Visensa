import React from "react";
import { PianoTilesGame } from "./PianoTilesGame";

export const PianoTilesSandbox = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#F1F5F9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "#0F172A",
            margin: "0 0 8px 0",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          Gamification Sandbox: Piano Tiles
        </h1>
        <p
          style={{
            color: "#475569",
            margin: 0,
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Standalone testing environment for Task-Oriented Training &amp; 75 BPM
          Rhythmic Auditory Stimulation.
        </p>
      </div>

      <PianoTilesGame bgmUrl="/musics/fairytale.mp3" />
    </div>
  );
};

export default PianoTilesSandbox;
