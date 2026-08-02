import { useState, useRef, useCallback, useEffect } from 'react';

// --- CONSTANTS & CONFIGURATION ---
const LANE_COUNT = 4;
const DEFAULT_BPM = 75;
const SPAWN_INTERVAL_MS = 1600; // 60000 / 75 * 2 beats = exactly 1600ms (zero-drift)
const FALL_DURATION_MS = 2000; // Calibrated: y=0% to y=80% takes exactly 1600ms (2 beats)

// Hit line sits at y=80%. Tolerance window is 72% to 88%
const TARGET_Y = 80;
const HIT_WINDOW_MIN = 72;
const HIT_WINDOW_MAX = 88;
const PERFECT_WINDOW_MIN = 77;
const PERFECT_WINDOW_MAX = 83;

// Lane frequency mapping for Web Audio API (C Major chord: C5, E5, G5, C6)
const LANE_FREQUENCIES = [523.25, 659.25, 783.99, 1046.50];

export const FINGER_LANE_MAP = [
  { lane: 0, finger: 'Index', keyPrimary: '1', keySecondary: 'a', color: '#00B8B0' }, // Clinical Teal
  { lane: 1, finger: 'Middle', keyPrimary: '2', keySecondary: 's', color: '#2563EB' }, // Medical Blue
  { lane: 2, finger: 'Ring', keyPrimary: '3', keySecondary: 'd', color: '#059669' }, // Clinical Emerald
  { lane: 3, finger: 'Pinky', keyPrimary: '4', keySecondary: 'f', color: '#7C3AED' }, // Clinical Violet
];

export function usePianoTilesGame(bgmUrl = '/musics/fairytale.mp3') {
  // --- UI REACT STATE ---
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle' | 'playing' | 'paused' | 'gameover'
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfect: 0, hit: 0, miss: 0 });
  const [tiles, setTiles] = useState([]);
  const [activeLanePress, setActiveLanePress] = useState([false, false, false, false]);
  const [feedbackPopups, setFeedbackPopups] = useState([]);

  // --- REFS FOR HIGH-FREQUENCY ANIMATION LOOP ---
  const tilesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const tileIdCounterRef = useRef(1);
  const bgmRef = useRef(null);
  const audioCtxRef = useRef(null);

  // --- AUDIO SYNTHESIZER ---
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
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

      // Softened gain envelope for gentle chime SFX
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore web audio context issues on un-muted user interaction
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
      // Non-blocking fallback
    }
  }, []);

  // --- SPAWN LOGIC ---
  const spawnTile = useCallback((timestamp) => {
    const randomLane = Math.floor(Math.random() * LANE_COUNT);
    const newTile = {
      id: tileIdCounterRef.current++,
      lane: randomLane,
      y: 0,
      spawnTimestamp: timestamp,
      status: 'active',
    };
    tilesRef.current.push(newTile);
  }, []);

  // --- TRIGGER FEEDBACK POPUP ---
  const triggerFeedback = useCallback((lane, text, type) => {
    const popupId = Date.now() + Math.random();
    setFeedbackPopups((prev) => [...prev.slice(-5), { id: popupId, lane, text, type }]);
    setTimeout(() => {
      setFeedbackPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 800);
  }, []);

  // --- LANE HIT ACTION ---
  const handleLaneHit = useCallback((laneIndex) => {
    if (gameStatus !== 'playing') return;

    // Visual lane flash activation
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

    // Find closest active tile in target lane within hit window
    const targetTileIndex = tilesRef.current.findIndex((tile) => (
      tile.lane === laneIndex &&
      tile.status === 'active' &&
      tile.y >= HIT_WINDOW_MIN &&
      tile.y <= HIT_WINDOW_MAX
    ));

    if (targetTileIndex === -1) {
      // Empty lane tap or mistimed press
      return;
    }

    const hitTile = tilesRef.current[targetTileIndex];
    const isPerfect = hitTile.y >= PERFECT_WINDOW_MIN && hitTile.y <= PERFECT_WINDOW_MAX;

    hitTile.status = 'hit';
    playHitTone(laneIndex, isPerfect);

    const pts = isPerfect ? 15 : 10;
    const feedbackText = isPerfect ? 'PERFECT!' : 'HIT!';
    const feedbackType = isPerfect ? 'perfect' : 'hit';

    triggerFeedback(laneIndex, feedbackText, feedbackType);

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

  // --- GAME LOOP ---
  const gameLoop = useCallback((timestamp) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
      lastSpawnTimeRef.current = timestamp;
    }

    const delta = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    // Spawning tiles based on 75 BPM timer interval (exact 1600ms per 2 beats, zero-drift step)
    if (timestamp - lastSpawnTimeRef.current >= SPAWN_INTERVAL_MS) {
      spawnTile(timestamp);
      lastSpawnTimeRef.current += SPAWN_INTERVAL_MS;
    }

    // Move tiles down
    const speedPerMs = 100 / FALL_DURATION_MS;
    const nextTiles = [];

    for (let i = 0; i < tilesRef.current.length; i++) {
      const tile = tilesRef.current[i];
      if (tile.status === 'active') {
        tile.y += speedPerMs * delta;

        // Auto miss detection when passing bottom tolerance boundary
        if (tile.y > HIT_WINDOW_MAX) {
          tile.status = 'missed';
          setCombo(0);
          setStats((prev) => ({ ...prev, miss: prev.miss + 1 }));
          triggerFeedback(tile.lane, 'MISS', 'miss');
          playMissTone();
        } else {
          nextTiles.push(tile);
        }
      } else if (tile.status === 'hit' && tile.y < 100) {
        // Retain hit visual brief fade
        tile.y += speedPerMs * delta * 0.5;
        if (tile.y < 95) nextTiles.push(tile);
      }
    }

    tilesRef.current = nextTiles;
    setTiles([...nextTiles]);

    animFrameIdRef.current = requestAnimationFrame(gameLoop);
  }, [spawnTile, triggerFeedback, playMissTone]);

  // --- CONTROLS ---
  const startGame = useCallback(() => {
    initAudio();

    if (bgmRef.current) {
      bgmRef.current.currentTime = 0;
      bgmRef.current.play().catch(() => {});
    }

    tilesRef.current = [];
    tileIdCounterRef.current = 1;
    lastFrameTimeRef.current = 0;
    lastSpawnTimeRef.current = 0;

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setStats({ perfect: 0, hit: 0, miss: 0 });
    setTiles([]);
    setFeedbackPopups([]);
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
    setGameStatus('playing');
  }, []);

  const resetGame = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

    tilesRef.current = [];
    setTiles([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setStats({ perfect: 0, hit: 0, miss: 0 });
    setGameStatus('idle');
  }, []);

  // Sync animation frame loop with game playing state
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

  // Cleanup audio on unmount
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
    score,
    combo,
    maxCombo,
    stats,
    tiles,
    activeLanePress,
    feedbackPopups,
    targetY: TARGET_Y,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    handleLaneHit,
  };
}
