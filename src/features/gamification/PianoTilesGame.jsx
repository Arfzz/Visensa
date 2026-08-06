import React, { useEffect, useState, useRef } from "react";
import {
  Activity,
  Zap,
  Radio,
  CheckCircle2,
  Gauge,
  Flame,
  Pause,
  RotateCcw,
  Flag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePianoTilesGame, FINGER_LANE_MAP } from "./usePianoTilesGame";
import { usePianoTilesHandTrigger } from "./usePianoTilesHandTrigger";
import { useStreakPlaytimeTracker } from "./streak/useStreakPlaytimeTracker";
import { useStreakStore } from "./streak/useStreakStore";
import { PianoTilesCalibrationOverlay } from "./PianoTilesCalibrationOverlay";
import { useVisionStore } from "../../store/zustand/VisionStore";
import "./PianoTilesGame.css";

// --- DUAL-INPUT FALLBACK KEYBOARD MAPPING (BACKEND/TESTING ONLY - NO UI RENDERED) ---
const KEYBOARD_LANE_MAP = {
  "1": 0, a: 0, A: 0,
  "2": 1, s: 1, S: 1,
  "3": 2, d: 2, D: 2,
  "4": 3, f: 3, F: 3,
};

export const PianoTilesGame = ({
  bgmUrl = "/musics/fairytale.mp3",
  enableHandTracking = true,
  cooldownMs = 280,
  flexionThreshold = 1.45,
  showSensitivityHUD = false,
  overlayMode = false,
  onFinish,
  onGameStatusChange,
}) => {
  const {
    gameStatus,
    score,
    combo,
    maxCombo,
    stats,
    durationSeconds,
    activeLanePress,
    feedbackPopups,
    targetY,
    setOnFrameTick,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    endGame, 
    handleLaneHit,
  } = usePianoTilesGame(bgmUrl);

  const { currentStreak, todayActiveSeconds, dailyTargetSeconds } = useStreakStore();

  // --- NOTIFY PARENT COMPONENT OF STATUS CHANGES ---
  useEffect(() => {
    if (typeof onGameStatusChange === "function") {
      onGameStatusChange(gameStatus);
    }
  }, [gameStatus, onGameStatusChange]);

  // --- AUTOMATIC STREAK PLAYTIME TRACKER ---
  useStreakPlaytimeTracker(gameStatus === "playing");

  // --- REFS & MEASUREMENTS ---
  const tileDomRefs = useRef([]);
  const laneDomRefs = useRef([]);
  const stageRef = useRef(null);
  const stageHeightRef = useRef(480);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- MEDIAPIPE FLEXION TRIGGER HOOK ---
  const { activeTriggers, fingerRatios } = usePianoTilesHandTrigger({
    enabled: enableHandTracking && (gameStatus === "playing" || gameStatus === "idle"),
    cooldownMs,
    flexionThreshold,
    onLaneHit: handleLaneHit,
  });

  // --- DIRECT DOM MUTATION TICK (ONLY RENDER STRICTLY ACTIVE TILES) ---
  useEffect(() => {
    setOnFrameTick((pool) => {
      if (!pool) return;
      const activeTiles = pool.filter((t) => t.active && t.status === "active");
      const stageH = stageHeightRef.current;

      while (tileDomRefs.current.length < activeTiles.length) {
        if (stageRef.current) {
          const el = document.createElement("div");
          el.className = "piano-tile";
          const inner = document.createElement("div");
          inner.className = "piano-tile-finger-badge";
          el.appendChild(inner);
          stageRef.current.appendChild(el);
          tileDomRefs.current.push({ el, inner, activeId: null });
        } else {
          break;
        }
      }

      for (let i = 0; i < tileDomRefs.current.length; i++) {
        const poolItem = tileDomRefs.current[i];
        if (i < activeTiles.length) {
          const tile = activeTiles[i];
          const pixelY = (tile.y / 100) * stageH;
          const laneConfig = FINGER_LANE_MAP[tile.lane];

          poolItem.el.style.display = "flex";
          poolItem.el.style.left = `${tile.lane * 25}%`;
          poolItem.el.style.backgroundColor = laneConfig?.color || "#00B8B0";
          poolItem.el.style.transform = `translate3d(0, ${pixelY}px, 0)`;

          if (poolItem.activeId !== tile.id) {
            poolItem.inner.textContent = laneConfig?.fingerShort || "";
            poolItem.activeId = tile.id;
          }
        } else {
          poolItem.el.style.display = "none";
          poolItem.activeId = null;
        }
      }
    });
  }, [setOnFrameTick]);

  // --- CACHE STAGE HEIGHT & CLEANUP STAGE ON UNMOUNT ---
  useEffect(() => {
    const updateHeight = () => {
      if (stageRef.current) {
        stageHeightRef.current = stageRef.current.clientHeight || 480;
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      if (stageRef.current) {
        stageRef.current.querySelectorAll(".piano-tile").forEach((el) => el.remove());
      }
      tileDomRefs.current = [];
    };
  }, []);

  // --- KEYBOARD FALLBACK LISTENER (NO UI RENDERED) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus !== "playing") return;
      const lane = KEYBOARD_LANE_MAP[e.key];
      if (lane !== undefined) {
        handleLaneHit(lane);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStatus, handleLaneHit]);

  // --- SESSION FINISH CALLBACK ---
  useEffect(() => {
    if (gameStatus === "gameover" && onFinish) {
      onFinish(stats);
    }
  }, [gameStatus, stats, onFinish]);

  const handleExitAndSave = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const payload = {
      user_id: user?.id,
      duration_seconds: durationSeconds,
      score: score,
      max_combo: maxCombo,
      perfect_hits: stats.perfect,
      good_hits: stats.hit,
    };

    try {
      setIsSaving(true);
      console.log("Menyimpan data ke DB...", payload);
      
      const response = await fetch("http://localhost:3000/api/v1/minigame/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal nyimpen data ke DB!");
      }

      console.log("Data berhasil disimpan!");
      setShowSuccessModal(true); 

    } catch (err) {
      console.error("Waduh error bro:", err);
      alert("Gagal menyimpan data, tapi tetap kembali ke Dashboard.");
      if (stopCamera) stopCamera(); 
      navigate("/patient-dashboard", { replace: true });
    } finally {
      setIsSaving(false); 
    }
  };

  const handleFinalExit = () => {
    navigate("/patient-dashboard", { replace: true });
  };

  const targetGoalSecs = dailyTargetSeconds || 60;
  const currentSecs = todayActiveSeconds || 0;
  const warmUpProgress = Math.min(100, Math.round((currentSecs / targetGoalSecs) * 100));
  const remainingSecs = Math.max(0, targetGoalSecs - currentSecs);

  const navigate = useNavigate();
  const handleExitToDashboard = () => {
    navigate("/patient-dashboard");
  };
  return (
    <div className={`piano-cockpit-wrapper ${overlayMode ? "overlay-mode" : ""}`}>
      {/* --- COLUMN 1: LEFT PANEL (18% WIDTH) --- */}
      <div className="piano-side-panel left-panel">
        {/* CARD 1: FINGER FLEXION ACTIVITY METER */}
        <div className="piano-card">
          <div className="piano-card-header">
            <Activity size={16} color="#64748B" />
            <span>FINGER FLEXION</span>
          </div>
          <div className="piano-finger-bar-group">
            {FINGER_LANE_MAP.map((item, idx) => {
              const isPressed = activeLanePress[item.lane] || activeTriggers[item.lane];
              const ratio = fingerRatios[idx] || 0;
              const fillPercent = isPressed
                ? 100
                : Math.min(100, Math.max(0, Math.round((ratio / flexionThreshold) * 100)));

              return (
                <div key={item.lane} className="piano-finger-bar-item">
                  <div className="piano-finger-bar-label">
                    <span>{item.finger}</span>
                    <span style={{ color: item.color }}>{fillPercent}%</span>
                  </div>
                  <div className="piano-finger-bar-track">
                    <div
                      className="piano-finger-bar-fill"
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- COLUMN 2: CENTER PANEL (64% WIDTH) --- */}
      <div className="piano-center-panel">
        {/* INTEGRATED MED-TECH TOPBAR */}
        <div className="piano-integrated-header">
          {/* LEFT: SCORE */}
          <div className="piano-header-left">
            <div className="piano-score-group">
              <span className="piano-score-label">SCORE</span>
              <span className="piano-score-val-large">{score}</span>
            </div>
            {maxCombo > 0 && (
              <span className="piano-max-combo-pill">MAX COMBO: {maxCombo}</span>
            )}
          </div>

          {/* MIDDLE: 60S WARM-UP PROGRESS */}
          <div className="piano-warmup-container">
            <div className="piano-warmup-header">
              <span>60s Warm-Up Progress</span>
              <span className="piano-warmup-status">
                {remainingSecs > 0 ? `${remainingSecs}s left` : "Complete! ✨"}
              </span>
            </div>
            <div className="piano-warmup-track">
              <div
                className="piano-warmup-fill"
                style={{ width: `${warmUpProgress}%` }}
              />
            </div>
          </div>

          {/* RIGHT: STREAK (TOMBOL UDAH GUA CABUT DARI SINI) */}
          <div className="piano-header-right">
            <div className="piano-streak-pill">
              <Flame size={16} fill="#F59E0B" color="#F59E0B" />
              <span>{currentStreak} Days</span>
            </div>
          </div>
        </div>

        {/* 3D MIRROR THERAPY CANVAS ARENA */}
        <div className="piano-arena-container">
          <div className="piano-stage" ref={stageRef}>
            {/* 4 VERTICAL LANE COLUMNS & DIVIDERS */}
            <div className="piano-lanes-bg">
              {FINGER_LANE_MAP.map((item) => {
                const isPressed = activeLanePress[item.lane] || activeTriggers[item.lane];
                return (
                  <div
                    key={item.lane}
                    ref={(el) => (laneDomRefs.current[item.lane] = el)}
                    className={`piano-lane ${isPressed ? "active-press" : ""}`}
                  />
                );
              })}
            </div>

            {/* GLOWING HIT-ZONE LINE */}
            <div className="piano-hit-zone-line" />

            {feedbackPopups.map((popup) => (
              <div
                key={popup.id}
                className={`piano-feedback-popup ${popup.type.toLowerCase()}`}
                style={{
                  left: `${popup.lane * 25 + 12.5}%`,
                  top: `${targetY - 8}%`,
                }}
              >
                {popup.text}
              </div>
            ))}
          </div>

          {/* LARGE GLOWING FINGER TARGET PADS */}
          <div className="piano-target-pads-grid">
            {FINGER_LANE_MAP.map((item) => {
              const isPressed = activeLanePress[item.lane] || activeTriggers[item.lane];
              return (
                <div
                  key={item.lane}
                  className={`piano-target-pad-item ${isPressed ? "active" : ""}`}
                  style={{
                    color: isPressed ? "#FFFFFF" : item.color,
                    backgroundColor: isPressed ? item.color : `${item.color}14`,
                    borderColor: item.color,
                  }}
                >
                  {item.finger.toUpperCase()}
                </div>
              );
            })}
          </div>

          {/* CALIBRATION OVERLAY */}
          {gameStatus === "idle" && (
            <PianoTilesCalibrationOverlay
              enabled={gameStatus === "idle"}
              onCalibrationComplete={startGame}
            />
          )}

          {/* OVERLAY: PAUSED */}
          {gameStatus === "paused" && (
            <div className="piano-overlay">
              <div className="piano-overlay-card">
                <h2 className="piano-overlay-title">Game Paused</h2>
                <button className="piano-btn-primary" onClick={resumeGame}>
                  Resume Game
                </button>
                <button 
                  className="piano-btn-secondary" 
                  style={{ backgroundColor: '#FEE2E2', color: '#EF4444', borderColor: '#FCA5A5' }} 
                  onClick={endGame}
                >
                  Surrender / End Result
                </button>
                <button className="piano-btn-secondary" onClick={resetGame}>
                  Restart
                </button>
              </div>
            </div>
          )}

          {/* OVERLAY: GAMEOVER */}
          {gameStatus === "gameover" && (
            <div className="piano-overlay">
              <div className="piano-overlay-card">
                <h2 className="piano-overlay-title">Session Complete!</h2>
                <div className="piano-stats-grid">
                  
                  {/* TAMBAHIN KARTU DURASI DI SINI */}
                  <div className="piano-stat-card" style={{ gridColumn: 'span 2' }}>
                    <div className="piano-stat-label">Duration</div>
                    <div className="piano-stat-value">{durationSeconds}s</div>
                  </div>

                  <div className="piano-stat-card">
                    <div className="piano-stat-label">Final Score</div>
                    <div className="piano-stat-value main">{score}</div>
                  </div>
                  <div className="piano-stat-card">
                    <div className="piano-stat-label">Max Combo</div>
                    <div className="piano-stat-value">{maxCombo}</div>
                  </div>
                  <div className="piano-stat-card">
                    <div className="piano-stat-label">Perfect Hits</div>
                    <div className="piano-stat-value perfect">{stats.perfect}</div>
                  </div>
                  <div className="piano-stat-card">
                    <div className="piano-stat-label">Good Hits</div>
                    <div className="piano-stat-value good">{stats.hit}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
                  <button 
                    className="piano-btn-secondary" 
                    style={{ flex: 1, backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#6EE7B7', opacity: isSaving ? 0.7 : 1 }} 
                    onClick={handleExitAndSave}
                  >
                    Exit & Save Result
                  </button>
                  <button 
                    className="piano-btn-primary" 
                    style={{ flex: 1 }} 
                    onClick={startGame}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- COLUMN 3: RIGHT PANEL (18% WIDTH) --- */}
      <div className="piano-side-panel right-panel">
        {/* CARD 1: INVISIBLE AI SENSOR DIAGNOSTIC (NO CAMERA FEED) */}
        <div className="piano-card">
          <div className="piano-card-header">
            <Radio size={16} color="#64748B" />
            <span>SENSOR DIAGNOSTIC</span>
          </div>
          <div className="piano-status-list">
            <div className="piano-status-primary">
              <CheckCircle2 size={16} color="#059669" />
              <span>AI Hand-Tracking: Active</span>
            </div>
            <div className="piano-status-sub">
              <span>Hand: Right Hand (Mirror)</span>
              <span>Distance: Optimal</span>
            </div>
          </div>
        </div>

        {/* CARD 2: RHYTHM & SESSION TELEMETRY */}
        <div className="piano-card">
          <div className="piano-card-header">
            <Gauge size={16} color="#64748B" />
            <span>SESSION STATS</span>
          </div>
          <div className="piano-session-metrics-grid">
            <div className="piano-session-metric-item">
              <div className="piano-metric-val-sm">{maxCombo}</div>
              <div className="piano-metric-lbl-sm">Max Combo Chain</div>
            </div>
            <div className="piano-session-metric-item" style={{ marginTop: "4px" }}>
              <div className="piano-metric-lbl-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Track Progress</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')} / 1:40
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (durationSeconds / 100) * 100)}%`, height: '100%', background: '#00B8B0', transition: 'width 1s linear' }} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: GAME CONTROLS (CSS INLINE UDAH DIBERSIHIN) */}
        <div className="piano-card piano-controls-card">
          <div className="piano-card-header">
            <Activity size={16} color="#64748B" />
            <span>CONTROLS</span>
          </div>
          
          <div className="piano-controls-group">
            {gameStatus === "playing" ? (
              <>
                <button 
                  onClick={pauseGame} 
                  className="piano-action-btn piano-control-btn"
                >
                  <Pause size={16} />
                  <span>Pause Session</span>
                </button>
                <button 
                  onClick={endGame} 
                  className="piano-action-btn piano-control-btn surrender"
                >
                  <Flag size={16} />
                  <span>Surrender</span>
                </button>
              </>
            ) : gameStatus === "paused" ? (
              <button 
                onClick={resetGame} 
                className="piano-action-btn piano-exit-btn piano-control-btn"
              >
                <RotateCcw size={16} />
                <span>Exit Game</span>
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <div className="piano-controls-waiting" style={{ textAlign: "center" }}>
                  Waiting to start...
                </div>
                <button 
                  onClick={handleExitToDashboard} 
                  className="piano-action-btn piano-control-btn surrender"
                  style={{ width: "100%" }}
                >
                  <RotateCcw size={16} />
                  <span>Exit to Dashboard</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      {/* MODAL SUCCESS: MUNCUL KALO DATA BERHASIL DI-SAVE */}
          {showSuccessModal && (
            <div className="piano-overlay" style={{ zIndex: 100000 }}>
              <div className="piano-overlay-card" style={{ textAlign: 'center', padding: '36px 24px', maxWidth: '360px' }}>
                
                {/* Ikon Checklist Hijau */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    backgroundColor: '#ECFDF5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '4px solid #D1FAE5'
                  }}>
                    <CheckCircle2 size={36} color="#059669" />
                  </div>
                </div>
                
                <h2 className="piano-overlay-title" style={{ marginBottom: '8px', color: '#0C2830' }}>
                  Result Saved!
                </h2>
                
                <p style={{ color: '#3A6870', fontSize: '14px', marginBottom: '28px', fontFamily: 'Space Grotesk', lineHeight: '1.5' }}>
                  Your therapy session progress has been securely saved to your record. Great job!
                </p>
                
                <button 
                  className="piano-btn-primary" 
                  style={{ 
                    width: '100%', 
                    background: 'linear-gradient(135deg, #0099A6 0%, #007580 100%)',
                    boxShadow: '0px 4px 14px rgba(0, 153, 166, 0.25)',
                    padding: '14px'
                  }} 
                  onClick={handleFinalExit}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
    </div>
  );
};

export default PianoTilesGame;