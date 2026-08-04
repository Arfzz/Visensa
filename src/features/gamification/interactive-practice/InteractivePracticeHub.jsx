import { useState, useCallback, useMemo } from "react";
import { Flame, Activity, X } from "lucide-react";
import { useStreakStore } from "../streak/useStreakStore";
import SevenDayTrackerCard from "./SevenDayTrackerCard";
import PersonalBestCard from "./PersonalBestCard";
import MinigameCard from "./MinigameCard";
import { PianoTilesGame } from "../PianoTilesGame";
import StreakCelebrationModal from "../streak/StreakCelebrationModal";

export const InteractivePracticeHub = () => {
  // --- STORE DATA & ACTIONS ---
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const todayActiveSeconds = useStreakStore(
    (state) => state.todayActiveSeconds,
  );
  const dailyTargetSeconds = useStreakStore(
    (state) => state.dailyTargetSeconds,
  );

  // --- GAME SESSION MODAL STATE ---
  const [activeGameId, setActiveGameId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // --- MINIGAMES LIST CONFIGURATION ---
  const minigames = useMemo(
    () => [
      {
        id: "rhythm_piano_tiles",
        title: "Rhythm Piano Tiles",
        description:
          "Interactive 1-minute warm-up exercise for 4-finger rhythm and reflexes.",
        tags: ["4-Finger Flexion", "Reflex Modality"],
        durationLabel: "1 Min",
        targetSeconds: 60,
      },
    ],
    [],
  );

  // --- START GAME SESSION ---
  const handleStartGame = useCallback((gameId) => {
    setActiveGameId(gameId);
    setIsSessionActive(true);
  }, []);

  // --- CLOSE GAME SESSION ---
  const handleCloseSession = useCallback(() => {
    setIsSessionActive(false);
    setActiveGameId(null);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
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
            <div
              style={{
                color: "#0C2830",
                fontSize: "32px",
                fontWeight: "800",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Interactive Practice
            </div>
          </div>
          <div
            style={{
              color: "#7AAAB4",
              fontSize: "15px",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Train reaction time, rhythm, and 4-finger coordination through
            interactive practice sessions.
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
      {/* ZONA 2: PROGRESS & STAT CARDS              */}
      {/* ========================================== */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        <SevenDayTrackerCard />
        <PersonalBestCard />
      </div>

      {/* ========================================== */}
      {/* ZONA 3: MINIGAMES LIST SECTION             */}
      {/* ========================================== */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: "#0C2830",
            fontSize: "20px",
            fontWeight: "700",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
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
      {/* REAL RHYTHM PIANO TILES INTERACTIVE MODAL  */}
      {/* ========================================== */}
      {isSessionActive && activeGameId === "rhythm_piano_tiles" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(8px)",
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
              maxWidth: "900px",
              maxHeight: "94vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              color: "white",
              fontFamily: "Space Grotesk, sans-serif",
              position: "relative",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1.5px solid rgba(255,255,255,0.1)",
                paddingBottom: "12px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#0099A6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Activity size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: "700" }}>
                    Rhythm Piano Tiles
                  </div>
                  <div style={{ color: "#7AAAB4", fontSize: "13px" }}>
                    4-Finger Reflex Warm-Up (Live Tracked)
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseSession}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#7AAAB4",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* REAL PIANO TILES GAME ENGINE */}
            <div style={{ width: "100%", minHeight: "660px" }}>
              <PianoTilesGame
                bgmUrl="/musics/fairytale.mp3"
                enableHandTracking={true}
                overlayMode={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* DEFERRED STREAK CELEBRATION MODAL (ONLY VISIBLE OUTSIDE ACTIVE GAMEPLAY) */}
      {!isSessionActive && <StreakCelebrationModal />}
    </div>
  );
};

export default InteractivePracticeHub;
