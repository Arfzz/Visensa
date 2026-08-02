import React, { useEffect, useMemo } from "react";
import { usePianoTilesGame, FINGER_LANE_MAP } from "./usePianoTilesGame";
import "./PianoTilesGame.css";

// --- TEMPORARY KEYBOARD MAPPING (FOR TESTING & SANDBOX MODE) ---
// Key 1 or A -> Index Finger (Lane 0)
// Key 2 or S -> Middle Finger (Lane 1)
// Key 3 or D -> Ring Finger (Lane 2)
// Key 4 or F -> Pinky Finger (Lane 3)
const KEY_TO_LANE = {
  1: 0,
  a: 0,
  A: 0,
  2: 1,
  s: 1,
  S: 1,
  3: 2,
  d: 2,
  D: 2,
  4: 3,
  f: 3,
  F: 3,
};

export const PianoTilesGame = ({
  bgmUrl = "/musics/fairytale.mp3",
  onFinish,
}) => {
  const {
    gameStatus,
    score,
    combo,
    maxCombo,
    stats,
    tiles,
    activeLanePress,
    feedbackPopups,
    targetY,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    handleLaneHit,
  } = usePianoTilesGame(bgmUrl);

  // --- TEMPORARY KEYBOARD EVENT LISTENER (STANDALONE TESTING MODE) ---
  // Note: Remove or disable this event listener when integrating with MediaPipe hand tracking.
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const handleKeyDown = (e) => {
      if (e.repeat) return; // Prevent key repeat spamming
      const lane = KEY_TO_LANE[e.key];
      if (lane !== undefined) {
        e.preventDefault();
        handleLaneHit(lane);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStatus, handleLaneHit]);

  // Total notes played for accuracy calculation
  const accuracyPercent = useMemo(() => {
    const totalHits = stats.perfect + stats.hit;
    const totalNotes = totalHits + stats.miss;
    if (totalNotes === 0) return 100;
    return Math.round((totalHits / totalNotes) * 100);
  }, [stats]);

  return (
    <div className="piano-game-container">
      {/* --- HUD HEADER --- */}
      <div className="piano-hud-header">
        <div className="piano-title-group">
          <span className="piano-title">Rhythm Piano Tiles</span>
          <div className="piano-bpm-badge">
            <span className="piano-bpm-dot" />
            <span>75 BPM</span>
          </div>
        </div>

        <div className="piano-stats-row">
          <div className="piano-stat-item">
            <span className="piano-stat-label">Score</span>
            <span className="piano-stat-value">{score}</span>
          </div>
          <div className="piano-stat-item">
            <span className="piano-stat-label">Combo</span>
            <span
              className={`piano-stat-value ${combo > 3 ? "combo-highlight" : ""}`}
            >
              {combo}x
            </span>
          </div>
          <div className="piano-stat-item">
            <span className="piano-stat-label">Accuracy</span>
            <span className="piano-stat-value">{accuracyPercent}%</span>
          </div>
        </div>
      </div>

      {/* --- GAME STAGE & 4 LANES --- */}
      <div className="piano-stage">
        {/* Hit Target Line */}
        <div className="piano-target-line" style={{ top: `${targetY}%` }} />

        {/* Floating Feedback Popups */}
        {feedbackPopups.map((popup) => (
          <div
            key={popup.id}
            className={`piano-feedback-popup ${popup.type}`}
            style={{
              left: `${(popup.lane + 0.5) * 25}%`,
              top: `${targetY - 5}%`,
            }}
          >
            {popup.text}
          </div>
        ))}

        {/* Render Lanes */}
        {FINGER_LANE_MAP.map((laneConfig) => {
          const isPressed = activeLanePress[laneConfig.lane];
          return (
            <div
              key={laneConfig.lane}
              className={`piano-lane ${isPressed ? "active-press" : ""}`}
              onClick={() => handleLaneHit(laneConfig.lane)}
            >
              {/* Render tiles inside this lane */}
              {tiles
                .filter((tile) => tile.lane === laneConfig.lane)
                .map((tile) => (
                  <div
                    key={tile.id}
                    className={`piano-tile ${tile.status}`}
                    style={{
                      top: `${tile.y}%`,
                      backgroundColor: laneConfig.color,
                    }}
                  >
                    <div className="piano-tile-inner" />
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* --- FINGER GUIDES & KEYBOARD CONTROLS FOOTER --- */}
      <div className="piano-lane-footer">
        {FINGER_LANE_MAP.map((laneConfig) => {
          const isPressed = activeLanePress[laneConfig.lane];
          return (
            <div
              key={laneConfig.lane}
              className="piano-lane-guide"
              onClick={() => handleLaneHit(laneConfig.lane)}
            >
              <div
                className={`piano-key-badge ${isPressed ? "pressed" : ""}`}
                style={{
                  borderColor: isPressed ? laneConfig.color : undefined,
                  color: laneConfig.color,
                }}
              >
                {laneConfig.keyPrimary}
              </div>
              <span className="piano-finger-name">{laneConfig.finger}</span>
            </div>
          );
        })}
      </div>

      {/* --- OVERLAY: START SCREEN --- */}
      {gameStatus === "idle" && (
        <div className="piano-overlay">
          <div className="piano-overlay-card">
            <h2 className="piano-overlay-title">Rhythm Piano Tiles</h2>
            <p className="piano-overlay-subtitle">
              Task-Oriented Motor Rehabilitation with Rhythmic Auditory
              Stimulation (RAS). Tap the tiles when they reach the target line!
            </p>

            <div className="piano-key-guide-box">
              {FINGER_LANE_MAP.map((item) => (
                <div key={item.lane} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: item.color,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    [{item.keyPrimary}] / [{item.keySecondary.toUpperCase()}]
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#475569",
                      fontWeight: 600,
                    }}
                  >
                    {item.finger}
                  </div>
                </div>
              ))}
            </div>

            <button className="piano-btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* --- OVERLAY: PAUSED SCREEN --- */}
      {gameStatus === "paused" && (
        <div className="piano-overlay">
          <div className="piano-overlay-card">
            <h2 className="piano-overlay-title">Game Paused</h2>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="piano-btn-primary" onClick={resumeGame}>
                Resume
              </button>
              <button className="piano-btn-secondary" onClick={resetGame}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
