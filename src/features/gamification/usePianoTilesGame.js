import { useState, useRef, useCallback, useEffect } from 'react';
import { useVisionStore } from '../../store/zustand/VisionStore';

// --- CONSTANTS & CONFIGURATION ---
const LANE_COUNT = 4;
const DEFAULT_BPM = 60;
const SPAWN_INTERVAL_MS = 2400; // 2400ms per tile (reduced spawn frequency for smooth performance)
const FALL_DURATION_MS = 3692.3; // Calibrated: y=0% to y=65% takes exactly 2400ms
const TILE_POOL_SIZE = 12; // Static pool size to eliminate Garbage Collection allocations

// --- CALIBRATED FINGERTIPS HIT LINE (y=65%) ---
const TARGET_Y = 65;
const HIT_WINDOW_MIN = 53;
const HIT_WINDOW_MAX = 77;
const PERFECT_WINDOW_MIN = 61;
const PERFECT_WINDOW_MAX = 69;

// --- 30 FPS GLOBAL THROTTLING CONFIGURATION ---
const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS; // ~33.33ms per frame

// Lane frequency mapping for Web Audio API (C Major chord: C5, E5, G5, C6)
const LANE_FREQUENCIES = [523.25, 659.25, 783.99, 1046.50];

// Mirrored Finger Mapping (Left to Right on Screen)
export const FINGER_LANE_MAP = [
  { lane: 0, finger: 'Pinky', keyPrimary: '1', keySecondary: 'a', color: '#7C3AED' },  // Far Left (Lane 0)
  { lane: 1, finger: 'Ring', keyPrimary: '2', keySecondary: 's', color: '#059669' },   // Mid Left (Lane 1)
  { lane: 2, finger: 'Middle', keyPrimary: '3', keySecondary: 'd', color: '#2563EB' }, // Mid Right (Lane 2)
  { lane: 3, finger: 'Index', keyPrimary: '4', keySecondary: 'f', color: '#00B8B0' },  // Far Right (Lane 3)
];

export function usePianoTilesGame(bgmUrl = '/musics/fairytale.mp3') {
  // --- UI REACT STATE (ONLY FOR DISCRETE SCORE/COMBO UPDATES) ---
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle' | 'playing' | 'paused' | 'gameover'
  const [isTrackingLost, setIsTrackingLost] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfect: 0, hit: 0, miss: 0 });
  const [activeLanePress, setActiveLanePress] = useState([false, false, false, false]);
  const [feedbackPopups, setFeedbackPopups] = useState([]);

  // --- REFS FOR TRACKING LOSS MONITORING & AUDIO ---
  const lastHandTimeRef = useRef(performance.now());
  const handStableStartRef = useRef(0);
  const autoPausedByTrackingRef = useRef(false);

  // --- STATIC ZERO-GC OBJECT POOL (PRE-ALLOCATED 12 TILES) ---
  const tilePoolRef = useRef(
    Array.from({ length: TILE_POOL_SIZE }, (_, i) => ({
      id: i,
      lane: 0,
      y: 0,
      active: false,
      status: 'inactive', // 'active' | 'hit' | 'missed' | 'inactive'
    }))
  );

  // --- REFS FOR ANTI-REPEAT SPAWN TRACKING & GAME LOOP ---
  const lastSpawnedLaneRef = useRef(-1);
  const sameLaneCountRef = useRef(0);
  const animFrameIdRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const bgmRef = useRef(null);
  const audioCtxRef = useRef(null);
  const frameTickCallbackRef = useRef(null);

  // --- REGISTER DIRECT DOM TICK CALLBACK ---
  const setOnFrameTick = useCallback((callback) => {
    frameTickCallbackRef.current = callback;
  }, []);

  // --- AUDIO SYNTHESIZER ---
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (!bgmRef.current && bgmUrl) {
      bgmRef.current = new Audio(bgmUrl);
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.4;
    }
  }, [bgmUrl]);

  const playHitTone = useCallback((laneIndex, isPerfect) => {
    if (!audioCtxRef.current) return;

    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = LANE_FREQUENCIES[laneIndex] || 523.25;
      osc.type = isPerfect ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Non-blocking Web Audio fallback
    }
  }, []);

  const playMissTone = useCallback(() => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Non-blocking Web Audio fallback
    }
  }, []);

  // --- ZERO-GC STRICT SINGLE-TILE SPAWN ENGINE ---
  const spawnTile = useCallback(() => {
    const pool = tilePoolRef.current;
    // Find the first available inactive tile from the static pool
    const inactiveTile = pool.find((t) => !t.active);
    if (!inactiveTile) return; // Pool full safeguard

    // Select STRICTLY 1 random lane from [0, 1, 2, 3]
    let selectedLane = Math.floor(Math.random() * LANE_COUNT);

    // Prevent selecting the same lane more than 2 times in a row
    if (selectedLane === lastSpawnedLaneRef.current) {
      sameLaneCountRef.current += 1;
      if (sameLaneCountRef.current >= 2) {
        selectedLane = (selectedLane + 1 + Math.floor(Math.random() * (LANE_COUNT - 1))) % LANE_COUNT;
        sameLaneCountRef.current = 1;
      }
    } else {
      sameLaneCountRef.current = 1;
    }

    lastSpawnedLaneRef.current = selectedLane;

    // Activate EXACTLY ONE tile on selectedLane
    inactiveTile.lane = selectedLane;
    inactiveTile.y = 0;
    inactiveTile.active = true;
    inactiveTile.status = 'active';
  }, []);

  // --- FEEDBACK POPUPS ---
  const triggerFeedback = useCallback((lane, text, type) => {
    const popupId = Date.now() + Math.random();
    setFeedbackPopups((prev) => [...prev.slice(-5), { id: popupId, lane, text, type }]);
    setTimeout(() => {
      setFeedbackPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 800);
  }, []);

  // --- STRICT ISOLATED LANE HIT DETECTION HANDLER ---
  const handleLaneHit = useCallback((laneIndex) => {
    if (gameStatus !== 'playing') return;

    setActiveLanePress((prev) => {
      const next = [...prev];
      next[laneIndex] = true;
      return next;
    });
    setTimeout(() => {
      setActiveLanePress((prev) => {
        const next = [...prev];
        next[laneIndex] = false;
        return next;
      });
    }, 120);

    // STRICT COLLISION: Search active tiles ONLY in target laneIndex
    const pool = tilePoolRef.current;
    let targetTile = null;

    for (let i = 0; i < TILE_POOL_SIZE; i++) {
      const t = pool[i];
      if (
        t.active &&
        t.status === 'active' &&
        t.lane === laneIndex && // MANDATORY STRICT LANE ISOLATION
        t.y >= HIT_WINDOW_MIN &&
        t.y <= HIT_WINDOW_MAX
      ) {
        targetTile = t;
        break;
      }
    }

    if (!targetTile) return; // Ignore miss clicks on empty lanes

    const isPerfect = targetTile.y >= PERFECT_WINDOW_MIN && targetTile.y <= PERFECT_WINDOW_MAX;

    // Deactivate ONLY targetTile in target laneIndex
    targetTile.status = 'hit';
    targetTile.active = false;

    playHitTone(laneIndex, isPerfect);

    const pts = isPerfect ? 15 : 10;
    triggerFeedback(laneIndex, isPerfect ? 'PERFECT!' : 'HIT!', isPerfect ? 'perfect' : 'hit');

    setScore((prev) => prev + pts);
    setCombo((prev) => {
      const nextCombo = prev + 1;
      setMaxCombo((currentMax) => Math.max(currentMax, nextCombo));
      return nextCombo;
    });
    setStats((prev) => ({
      ...prev,
      perfect: prev.perfect + (isPerfect ? 1 : 0),
      hit: prev.hit + (isPerfect ? 0 : 1),
    }));
  }, [gameStatus, playHitTone, triggerFeedback]);

  // --- 30 FPS ZERO-GC GAME LOOP (DIRECT DOM MUTATION TICK) ---
  const gameLoop = useCallback((timestamp) => {
    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
      lastSpawnTimeRef.current = timestamp;
    }

    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed < FRAME_INTERVAL_MS) {
      return;
    }

    lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL_MS);

    // Spawning tiles based on 75 BPM timer interval (exact 1600ms per 2 beats, zero-drift)
    if (timestamp - lastSpawnTimeRef.current >= SPAWN_INTERVAL_MS) {
      spawnTile();
      if (timestamp - lastSpawnTimeRef.current > SPAWN_INTERVAL_MS * 1.5) {
        lastSpawnTimeRef.current = timestamp;
      } else {
        lastSpawnTimeRef.current += SPAWN_INTERVAL_MS;
      }
    }

    // Move tiles down with zero memory allocations
    const speedPerMs = 100 / FALL_DURATION_MS;
    const pool = tilePoolRef.current;

    for (let i = 0; i < TILE_POOL_SIZE; i++) {
      const tile = pool[i];
      if (tile.active && tile.status === 'active') {
        tile.y += speedPerMs * elapsed;

        if (tile.y > HIT_WINDOW_MAX) {
          tile.status = 'missed';
          tile.active = false;
          setCombo(0);
          setStats((prev) => ({ ...prev, miss: prev.miss + 1 }));
          triggerFeedback(tile.lane, 'MISS', 'miss');
          playMissTone();
        }
      }
    }

    // Bypass React Reconciler: Mutate DOM directly via callback
    if (typeof frameTickCallbackRef.current === 'function') {
      frameTickCallbackRef.current(pool);
    }
  }, [spawnTile, triggerFeedback, playMissTone]);

  // --- CONTROLS ---
  const startGame = useCallback(() => {
    initAudio();

    // Reset pool state
    tilePoolRef.current.forEach((t) => {
      t.active = false;
      t.status = 'inactive';
      t.y = 0;
    });

    lastFrameTimeRef.current = 0;
    lastSpawnTimeRef.current = 0;

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setStats({ perfect: 0, hit: 0, miss: 0 });
    setFeedbackPopups([]);

    autoPausedByTrackingRef.current = false;
    setIsTrackingLost(false);

    if (bgmRef.current) {
      bgmRef.current.currentTime = 0;
      bgmRef.current.play().catch(() => {});
    }

    setGameStatus('playing');
  }, [initAudio]);

  const pauseGame = useCallback(() => {
    if (bgmRef.current) bgmRef.current.pause();
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    setGameStatus('paused');
  }, []);

  const resumeGame = useCallback(() => {
    if (bgmRef.current) bgmRef.current.play().catch(() => {});
    lastFrameTimeRef.current = 0;
    lastSpawnTimeRef.current = 0;
    setGameStatus('playing');
  }, []);

  const resetGame = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

    tilePoolRef.current.forEach((t) => {
      t.active = false;
      t.status = 'inactive';
      t.y = 0;
    });

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setStats({ perfect: 0, hit: 0, miss: 0 });
    setGameStatus('idle');
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing') {
      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    } else if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameStatus, gameLoop]);

  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  return {
    gameStatus,
    isTrackingLost,
    score,
    combo,
    maxCombo,
    stats,
    activeLanePress,
    feedbackPopups,
    targetY: TARGET_Y,
    tilePoolRef,
    setOnFrameTick,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    handleLaneHit,
  };
}
