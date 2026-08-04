import { useState, useEffect, useCallback, useMemo } from "react";
import { Flame, Activity, Clock, X, Trophy } from "lucide-react";
import { useStreakStore } from "../streak/useStreakStore";
import SevenDayTrackerCard from "./SevenDayTrackerCard";
import PersonalBestCard from "./PersonalBestCard";
import MinigameCard from "./MinigameCard";

export const InteractivePracticeHub = () => {
  // --- STORE DATA & ACTIONS ---
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const todayActiveSeconds = useStreakStore((state) => state.todayActiveSeconds);
  const dailyTargetSeconds = useStreakStore((state) => state.dailyTargetSeconds);
  const addActivePlaytime = useStreakStore((state) => state.addActivePlaytime);

  // --- GAME SESSION MODAL STATE ---
  const [activeGameId, setActiveGameId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTimer, setGameTimer] = useState(60);
  const [activeLane, setActiveLane] = useState(0);

  // --- MINIGAMES LIST CONFIGURATION ---
  const minigames = useMemo(
    () => [
      {
        id: "rhythm_piano_tiles",
        title: "Rhythm Piano Tiles",
        description: "Interactive 1-minute warm-up exercise for 4-finger rhythm and reflexes.",
        tags: ["4-Finger Flexion", "Reflex Modality"],
        durationLabel: "1 Min",
        targetSeconds: 60,
      },
    ],
    []
  );

  // --- WARM-UP GAME SIMULATION LOOP ---
  useEffect(() => {
    let interval = null;
    if (isSessionActive && gameTimer > 0) {
      interval = setInterval(() => {
        setGameTimer((prev) => prev - 1);
        setActiveLane(Math.floor(Math.random() * 4));
        addActivePlaytime(1);
      }, 1000);
    } else if (gameTimer === 0) {
      setIsSessionActive(false);
      setActiveGameId(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, gameTimer, addActivePlaytime]);

  // --- START GAME SESSION ---
  const handleStartGame = useCallback((gameId) => {
    setActiveGameId(gameId);
    setGameScore(0);
    setGameTimer(60);
    setIsSessionActive(true);
  }, []);

  // --- TILE HIT HANDLER ---
  const handleTileTap = useCallback((laneIndex) => {
    if (laneIndex === activeLane) {
      setGameScore((prev) => prev + 10);
      setActiveLane(Math.floor(Math.random() * 4));
    }
  }, [activeLane]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", boxSizing: "border-box" }}>
      
      {/* ========================================== */}
      {/* ZONA 1: CLINICAL HEADER & STREAK STATUS    */}
      {/* ========================================== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "white",
          padding: "24px 28px",
          borderRadius: "20px",
          border: "1.5px solid #C4E8EC",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(0, 153, 166, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={20} color="#0099A6" strokeWidth={2.5} />
            </div>
            <div style={{ color: "#0C2830", fontSize: "32px", fontWeight: "800", fontFamily: "Space Grotesk, sans-serif" }}>
              Interactive Practice
            </div>
          </div>
          <div style={{ color: "#7AAAB4", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif" }}>
            Train reaction time, rhythm, and 4-finger coordination through interactive practice sessions.
          </div>
        </div>

        {/* STREAK STATUS PILL-BADGE */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1.5px solid rgba(245, 158, 11, 0.3)",
            color: "#D97706",
            padding: "8px 18px",
            borderRadius: "100px",
            fontSize: "15px",
            fontFamily: "Space Mono, monospace",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <Flame size={18} color="#D97706" fill="rgba(217, 119, 6, 0.2)" />
          <span>{currentStreak} Days Streak</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* ZONA 2: PROGRESS & STAT CARDS (MOVED UP)   */}
      {/* ========================================== */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", flexShrink: 0 }}>
        <SevenDayTrackerCard />
        <PersonalBestCard />
      </div>

      {/* ========================================== */}
      {/* ZONA 3: MINIGAMES LIST SECTION             */}
      {/* ========================================== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
        <div style={{ color: "#0C2830", fontSize: "20px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
          Interactive Practice Modalities
        </div>

        {/* VERTICAL STACK OF REUSABLE MINIGAME CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {minigames.map((game) => (
            <MinigameCard
              key={game.id}
              title={game.title}
              description={game.description}
              tags={game.tags}
              durationLabel={game.durationLabel}
              targetSeconds={game.targetSeconds}
              todayActiveSeconds={todayActiveSeconds}
              dailyTargetSeconds={dailyTargetSeconds}
              onStart={() => handleStartGame(game.id)}
            />
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* RHYTHM PIANO TILES CANVAS MODAL            */}
      {/* ========================================== */}
      {isSessionActive && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "#151E2C",
              borderRadius: "24px",
              border: "1.5px solid #0099A6",
              width: "100%",
              maxWidth: "520px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              color: "white",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {/* MODAL HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#0099A6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: "700" }}>Rhythm Piano Tiles</div>
                  <div style={{ color: "#7AAAB4", fontSize: "13px" }}>4-Finger Reflex Warm-Up</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSessionActive(false);
                  setActiveGameId(null);
                }}
                style={{ background: "transparent", border: "none", color: "#7AAAB4", cursor: "pointer", padding: "4px" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* MODAL HUD STATS */}
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "12px 20px", borderRadius: "14px", fontFamily: "Space Mono, monospace", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="#3ED8C8" />
                <span>Timer: <strong style={{ color: "#3ED8C8" }}>{gameTimer}s</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={16} color="#D4A843" />
                <span>Score: <strong style={{ color: "#D4A843" }}>{gameScore}</strong></span>
              </div>
            </div>

            {/* GAME TILES CANVAS (4 LANES) */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", padding: "20px 0" }}>
              {[0, 1, 2, 3].map((lane) => {
                const isActive = lane === activeLane;
                return (
                  <button
                    key={lane}
                    onClick={() => handleTileTap(lane)}
                    style={{
                      width: "80px",
                      height: "180px",
                      borderRadius: "16px",
                      background: isActive ? "linear-gradient(180deg, #3ED8C8 0%, #0099A6 100%)" : "rgba(255,255,255,0.05)",
                      border: isActive ? "2px solid #C8F135" : "1.5px solid rgba(255,255,255,0.1)",
                      boxShadow: isActive ? "0 0 20px rgba(62, 216, 200, 0.5)" : "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontFamily: "Space Mono, monospace", fontWeight: "700", color: isActive ? "#1A2332" : "#7AAAB4" }}>
                      Finger {lane + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* MODAL FOOTER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
              <span style={{ color: "#7AAAB4", fontSize: "13px" }}>
                Tap the highlighted lane to train your reflex!
              </span>
              <button
                onClick={() => {
                  setIsSessionActive(false);
                  setActiveGameId(null);
                }}
                style={{ padding: "10px 20px", background: "white", border: "none", borderRadius: "12px", color: "#1A2332", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InteractivePracticeHub;
