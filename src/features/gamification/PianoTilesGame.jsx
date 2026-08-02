import React, { useEffect, useMemo, useRef } from "react";
import { usePianoTilesGame, FINGER_LANE_MAP } from "./usePianoTilesGame";
import { usePianoTilesHandTrigger } from "./usePianoTilesHandTrigger";
import "./PianoTilesGame.css";

// --- DUAL-INPUT FALLBACK KEYBOARD MAPPING (MIRRORED DISPLAY) ---
// Key 1 or A -> Pinky Finger (Far Left — Lane 0)
// Key 2 or S -> Ring Finger (Mid Left — Lane 1)
// Key 3 or D -> Middle Finger (Mid Right — Lane 2)
// Key 4 or F -> Index Finger (Far Right — Lane 3)
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

// --- MEMOIZED HUD HEADER (PREVENTS RE-RENDERING ON TICK) ---
const PianoHUDHeader = React.memo(({ score, combo, accuracyPercent }) => {
  return (
    <div className="piano-hud-header">
      <div className="piano-title-group">
        <span className="piano-title">Rhythm Piano Tiles</span>
        <div className="piano-bpm-badge">
          <span className="piano-bpm-dot" />
          <span>60 BPM</span>
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
  );
});

// --- MEMOIZED FINGER GUIDES FOOTER ---
const FingerGuidesFooter = React.memo(
  ({ activeLanePress, activeTriggers, onLaneHit }) => {
    return (
      <div className="piano-lane-footer">
        {FINGER_LANE_MAP.map((laneConfig) => {
          const isPressed =
            activeLanePress[laneConfig.lane] || activeTriggers[laneConfig.lane];
          return (
            <div
              key={laneConfig.lane}
              className="piano-lane-guide"
              onClick={() => onLaneHit(laneConfig.lane)}
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
    );
  },
);

// --- MEMOIZED SENSITIVITY BAR ---
const SensitivityBar = React.memo(({ fingerRatios, activeTriggers }) => {
  return (
    <div className="piano-sensitivity-bar">
      {FINGER_LANE_MAP.map((item) => (
        <div key={item.lane} className="piano-sens-item">
          <span style={{ color: item.color, fontWeight: 700 }}>
            {item.finger}:
          </span>
          <span>{fingerRatios[item.lane]}</span>
          <span
            className={`piano-sens-dot ${activeTriggers[item.lane] ? "active" : ""}`}
            style={{
              backgroundColor: activeTriggers[item.lane]
                ? item.color
                : "#CBD5E1",
            }}
          />
        </div>
      ))}
    </div>
  );
});

export const PianoTilesGame = ({
  bgmUrl = "/musics/fairytale.mp3",
  enableHandTracking = true,
  cooldownMs = 280,
  flexionThreshold = 1.45,
  showSensitivityHUD = false,
  overlayMode = false,
  onFinish,
}) => {
  const {
    gameStatus,
    isTrackingLost,
    score,
    combo,
    stats,
    activeLanePress,
    feedbackPopups,
    targetY,
    setOnFrameTick,
    startGame,
    resumeGame,
    resetGame,
    handleLaneHit,
  } = usePianoTilesGame(bgmUrl);

  // --- REFS & CACHED MEASUREMENTS (ELIMINATES REFLOW THRASHING) ---
  const tileDomRefs = useRef([]);
  const laneDomRefs = useRef([]);
  const stageRef = useRef(null);
  const stageHeightRef = useRef(480);

  // Cache stage height once on mount and update on resize (Zero layout thrashing)
  useEffect(() => {
    const updateStageHeight = () => {
      if (stageRef.current) {
        stageHeightRef.current = stageRef.current.clientHeight || 480;
      }
    };

    updateStageHeight();
    const resizeObserver = new ResizeObserver(updateStageHeight);
    if (stageRef.current) {
      resizeObserver.observe(stageRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // --- DIRECT DOM MUTATION TICK (ZERO RE-RENDER & ANTICIPATION GLOW) ---
  useEffect(() => {
    setOnFrameTick((pool) => {
      const stageHeight = stageHeightRef.current;
      const anticipatingLanes = [false, false, false, false];

      for (let i = 0; i < pool.length; i++) {
        const tile = pool[i];
        const node = tileDomRefs.current[i];
        if (!node) continue;

        if (tile.active) {
          const pixelY = (tile.y / 100) * stageHeight;
          const laneColor = FINGER_LANE_MAP[tile.lane]?.color || "#00B8B0";

          node.style.display = "block";
          node.style.transform = `translate3d(0, ${pixelY}px, 0)`;
          node.style.left = `${tile.lane * 25 + 2}%`;
          node.style.backgroundColor = laneColor;

          // Track anticipation glow when tile passes y > 58%
          if (tile.status === "active" && tile.y >= 58 && tile.y <= 72) {
            anticipatingLanes[tile.lane] = true;
          }
        } else {
          node.style.display = "none";
        }
      }

      // Direct DOM mutation for Lane Anticipation Glow (Zero React re-render)
      for (let l = 0; l < 4; l++) {
        const laneNode = laneDomRefs.current[l];
        if (laneNode) {
          if (anticipatingLanes[l]) {
            laneNode.classList.add("anticipating");
          } else {
            laneNode.classList.remove("anticipating");
          }
        }
      }
    });
  }, [setOnFrameTick]);

  // --- MEDIAPIPE HAND TRACKING TRIGGER HOOK ---
  const { fingerRatios, activeTriggers } = usePianoTilesHandTrigger({
    onLaneHit: handleLaneHit,
    enabled: enableHandTracking && gameStatus === "playing" && !isTrackingLost,
    cooldownMs,
    flexionThreshold,
  });

  // --- DUAL-INPUT KEYBOARD FALLBACK LISTENER ---
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
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

  const accuracyPercent = useMemo(() => {
    const totalHits = stats.perfect + stats.hit;
    const totalNotes = totalHits + stats.miss;
    if (totalNotes === 0) return 100;
    return Math.round((totalHits / totalNotes) * 100);
  }, [stats]);

  return (
    <div
      className={`piano-game-container ${overlayMode ? "overlay-mode" : ""}`}
    >
      {/* --- HUD HEADER (MEMOIZED SUBCOMPONENT) --- */}
      <PianoHUDHeader
        score={score}
        combo={combo}
        accuracyPercent={accuracyPercent}
      />

      {/* --- REAL-TIME SENSITIVITY MONITORING HUD --- */}
      {showSensitivityHUD && (
        <SensitivityBar
          fingerRatios={fingerRatios}
          activeTriggers={activeTriggers}
        />
      )}

      {/* --- GAME STAGE & STATICALLY MOUNTED POOL NODES --- */}
      <div className="piano-stage" ref={stageRef}>
        <div className="piano-target-line" style={{ top: `${targetY}%` }} />

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

        {/* 4 Visual Lanes */}
        {FINGER_LANE_MAP.map((laneConfig) => {
          const isPressed =
            activeLanePress[laneConfig.lane] || activeTriggers[laneConfig.lane];
          return (
            <div
              key={laneConfig.lane}
              ref={(el) => (laneDomRefs.current[laneConfig.lane] = el)}
              className={`piano-lane ${isPressed ? "active-press" : ""}`}
              onClick={() => handleLaneHit(laneConfig.lane)}
            />
          );
        })}

        {/* STATICALLY MOUNTED 12 POOL NODES (DIRECT DOM MUTATION - ZERO REACT RE-RENDER) */}
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            ref={(el) => (tileDomRefs.current[index] = el)}
            className="piano-tile"
            style={{
              display: "none",
              position: "absolute",
              top: 0,
            }}
          >
            <div className="piano-tile-inner" />
          </div>
        ))}
      </div>

      {/* --- FINGER GUIDES FOOTER (MEMOIZED SUBCOMPONENT) --- */}
      <FingerGuidesFooter
        activeLanePress={activeLanePress}
        activeTriggers={activeTriggers}
        onLaneHit={handleLaneHit}
      />

      {/* --- OVERLAY: START SCREEN --- */}
      {gameStatus === "idle" && (
        <div className="piano-overlay">
          <div className="piano-overlay-card">
            <h2 className="piano-overlay-title">Rhythm Piano Tiles</h2>
            <p className="piano-overlay-subtitle">
              Task-Oriented Motor Rehabilitation with MediaPipe Hand Flexion
              &amp; 65 BPM Rhythmic Auditory Stimulation. Flex your fingers or
              press keys [1-4 / A-F] to hit falling tiles!
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
