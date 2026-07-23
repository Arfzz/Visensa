// --- ONE EURO FILTER ---
// Ref: Casiez et al. 2012 — "1€ Filter: A Simple Speed-based Low-pass Filter
// for Noisy Input in Interactive Systems"
//
// minCutoff: minimum cutoff frequency (Hz). Lower = smoother at rest, but laggier.
// beta: speed coefficient. Higher = faster adaptation to quick movement.
// dCutoff: cutoff frequency for derivative (Hz). Usually left at 1.0.
//
// Chosen defaults:
//   minCutoff = 0.8  — aggressive smoothing for sub-centimeter jitter at rest.
//                       MediaPipe world landmarks have ~5-15mm noise at idle;
//                       0.8 Hz cutoff damps this without perceptible lag.
//   beta = 0.4       — moderate speed ramp. At typical arm-raise velocity
//                       (~0.3 m/s), adaptive cutoff reaches ~8 Hz within 2 frames,
//                       keeping latency < 1 frame at 12 FPS pose rate.
//   dCutoff = 1.0    — standard value; smooths the derivative estimate itself.

const DEFAULT_MIN_CUTOFF = 0.8;
const DEFAULT_BETA = 0.4;
const DEFAULT_D_CUTOFF = 1.0;

function smoothingFactor(te, cutoff) {
  const r = 2 * Math.PI * cutoff * te;
  return r / (r + 1);
}

function exponentialSmoothing(a, x, xPrev) {
  return a * x + (1 - a) * xPrev;
}

class OneEuroFilterScalar {
  constructor(minCutoff = DEFAULT_MIN_CUTOFF, beta = DEFAULT_BETA, dCutoff = DEFAULT_D_CUTOFF) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xPrev = 0;
    this.dxPrev = 0;
    this.tPrev = 0;
    this.initialized = false;
  }

  filter(x, t) {
    if (!this.initialized) {
      this.xPrev = x;
      this.dxPrev = 0;
      this.tPrev = t;
      this.initialized = true;
      return x;
    }

    const te = t - this.tPrev;
    if (te <= 0) return this.xPrev;

    const aD = smoothingFactor(te, this.dCutoff);
    const dx = (x - this.xPrev) / te;
    const dxSmoothed = exponentialSmoothing(aD, dx, this.dxPrev);

    const cutoff = this.minCutoff + this.beta * Math.abs(dxSmoothed);
    const a = smoothingFactor(te, cutoff);
    const xFiltered = exponentialSmoothing(a, x, this.xPrev);

    this.xPrev = xFiltered;
    this.dxPrev = dxSmoothed;
    this.tPrev = t;

    return xFiltered;
  }

  reset() {
    this.initialized = false;
  }
}

// --- 3D LANDMARK FILTER (x, y, z per joint) ---

export class OneEuroFilter3D {
  constructor(minCutoff = DEFAULT_MIN_CUTOFF, beta = DEFAULT_BETA, dCutoff = DEFAULT_D_CUTOFF) {
    this.fx = new OneEuroFilterScalar(minCutoff, beta, dCutoff);
    this.fy = new OneEuroFilterScalar(minCutoff, beta, dCutoff);
    this.fz = new OneEuroFilterScalar(minCutoff, beta, dCutoff);
  }

  filter(landmark, timestamp) {
    return {
      x: this.fx.filter(landmark.x, timestamp),
      y: this.fy.filter(landmark.y, timestamp),
      z: this.fz.filter(landmark.z, timestamp),
    };
  }

  reset() {
    this.fx.reset();
    this.fy.reset();
    this.fz.reset();
  }
}

// --- PRE-ALLOCATED FILTER BANK FOR POSE LANDMARKS ---
// Indices 12 (shoulder), 14 (elbow), 16 (wrist) — both screen and world space

const FILTERED_POSE_INDICES = [12, 14, 16];

export function createPoseFilterBank(minCutoff = DEFAULT_MIN_CUTOFF, beta = DEFAULT_BETA) {
  const screen = {};
  const world = {};
  for (const idx of FILTERED_POSE_INDICES) {
    screen[idx] = new OneEuroFilter3D(minCutoff, beta);
    world[idx]  = new OneEuroFilter3D(minCutoff, beta);
  }
  return { screen, world, indices: FILTERED_POSE_INDICES };
}

export function filterPoseLandmarks(bank, screenLandmarks, worldLandmarks, timestamp) {
  const filteredScreen = [...screenLandmarks];
  const filteredWorld  = [...worldLandmarks];

  for (const idx of bank.indices) {
    if (screenLandmarks[idx]) {
      filteredScreen[idx] = bank.screen[idx].filter(screenLandmarks[idx], timestamp);
    }
    if (worldLandmarks[idx]) {
      filteredWorld[idx] = bank.world[idx].filter(worldLandmarks[idx], timestamp);
    }
  }

  return { filteredScreen, filteredWorld };
}
