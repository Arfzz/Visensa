import { useEffect } from "react";
import { useVisionStore } from "../../store/zustand/VisionStore";
import { useHandStore } from "../../store/zustand/useHandStore";
import * as Kalidokit from "kalidokit";

// Object statis buat reset — dibuat sekali di luar, tidak di-recreate tiap frame
const RESET_POSE = Object.freeze({
  upper_arm:  { x: 0, y: 0, z: 0 },
  lower_arm:  { x: 0, y: 0, z: 0 },
  wrist:      { x: 0, y: 0, z: 0 },
  thumb_mcp:  { x: 0, y: 0, z: 0 }, thumb_pip:  { x: 0, y: 0, z: 0 }, thumb_dip:  { x: 0, y: 0, z: 0 },
  index_mcp:  { x: 0, y: 0, z: 0 }, index_pip:  { x: 0, y: 0, z: 0 }, index_dip:  { x: 0, y: 0, z: 0 },
  middle_mcp: { x: 0, y: 0, z: 0 }, middle_pip: { x: 0, y: 0, z: 0 }, middle_dip: { x: 0, y: 0, z: 0 },
  ring_mcp:   { x: 0, y: 0, z: 0 }, ring_pip:   { x: 0, y: 0, z: 0 }, ring_dip:   { x: 0, y: 0, z: 0 },
  pinky_mcp:  { x: 0, y: 0, z: 0 }, pinky_pip:  { x: 0, y: 0, z: 0 }, pinky_dip:  { x: 0, y: 0, z: 0 },
});

const ZERO = { x: 0, y: 0, z: 0 };

/**
 * Custom hook: jembatan imperatif antara MediaPipe landmarks → Kalidokit → HandStore.
 *
 * FIX #1: Mirror landmark.x sebelum Kalidokit.Hand.solve() agar sesuai
 *         dengan tampilan video yang sudah di-flip CSS (scaleX(-1)).
 *
 * FIX #2: posePrefix diubah dari "Left" → "Right" agar ambil lengan kanan
 *         yang konsisten dengan handPrefix dan komentar developer sebelumnya.
 *
 * FIX #3: Dead code reset pose diperbaiki — blok reset dipindah ke guard awal
 *         sehingga model 3D benar-benar reset saat tangan hilang dari kamera.
 *
 * FIX #4 ada di Robotic_prosthetic_arm.jsx — lower_arm tidak lagi meminjam wrist.
 */
export function useKalidokitBridge() {
  useEffect(() => {
    let lastSolveTime = 0;
    let lastLogTime   = 0;

    // Kalidokit solve di-throttle 30x/detik, cukup untuk persepsi visual halus
    const THROTTLE_MS = 1000 / 30;

    const unsubscribe = useVisionStore.subscribe((state) => {
      const now = performance.now();
      if (now - lastSolveTime < THROTTLE_MS) return;
      lastSolveTime = now;

      const { handLandmarks, poseLandmarks, poseWorldLandmarks } = state;

      // ── FIX #3: Guard yang benar ────────────────────────────────────
      // Jika benar-benar tidak ada data sama sekali → reset model & stop
      if (!handLandmarks && (!poseLandmarks || !poseWorldLandmarks)) {
        useHandStore.getState().setHandPose(RESET_POSE);
        return;
      }

      try {
        let handSolved = null;
        let poseSolved = null;

        // ── 1. Solve Rotasi Jari & Pergelangan ─────────────────────────
        if (handLandmarks) {
          // Tangan kanan: pakai landmark asli tanpa mirror
          handSolved = Kalidokit.Hand.solve(handLandmarks, "Right");
        }

        // ── 2. Solve Rotasi Bahu & Siku ────────────────────────────────
        if (poseLandmarks && poseWorldLandmarks) {
          poseSolved = Kalidokit.Pose.solve(
            poseWorldLandmarks,
            poseLandmarks,
            { runtime: "mediapipe", video: null }
          );
        }

        // Data tangan kanan langsung cocok untuk J_Bip_R_* tanpa inversi
        const handPrefix = "Right";

        // Hitung rotasi upper arm & lower arm dari world landmark kanan
        // Indeks MediaPipe: 12=right shoulder, 14=right elbow, 16=right wrist
        let upperArmRot = ZERO;
        let lowerArmRot = ZERO;

        if (poseWorldLandmarks) {
          const shoulder = poseWorldLandmarks[12];
          const elbow    = poseWorldLandmarks[14];
          const wrist    = poseWorldLandmarks[16];

          if (shoulder && elbow && wrist) {
            // Vektor arah lengan atas (shoulder → elbow)
            const ux = elbow.x - shoulder.x;
            const uy = elbow.y - shoulder.y;
            const uz = elbow.z - shoulder.z;

            // rotX = elevasi (naik/turun): atan2 dari komponen Y vs XZ
            const uxzLen = Math.sqrt(ux * ux + uz * uz);
            const elevAngle = Math.atan2(-uy, uxzLen); // negatif karena Y ke bawah

            // rotZ = swing depan/belakang: 0 saat T-pose, positif saat maju
            // atan2(-uz, ux): T-pose → atan2(0, positive) = 0 ✅
            //                  maju → atan2(positive, ~0) = positive ✅ (uz < 0 saat maju)
            const abdAngle = Math.atan2(-uz, ux);

            upperArmRot = { x: elevAngle, y: 0, z: abdAngle };

            // Lengan bawah: sudut siku dari vektor (elbow→wrist) relatif (shoulder→elbow)
            const lx = wrist.x - elbow.x;
            const ly = wrist.y - elbow.y;
            const lz = wrist.z - elbow.z;
            const len = Math.sqrt(lx*lx + ly*ly + lz*lz);
            if (len > 0.001) {
              const elbowAngle = Math.atan2(
                Math.sqrt(ly*ly + lz*lz),
                lx
              );
              lowerArmRot = { x: elbowAngle * 0.8, y: 0, z: 0 };
            }
          }
        }

        const pose = {
          upper_arm: upperArmRot,
          lower_arm: lowerArmRot,

          // Pergelangan & jari dari Hand — jika tangan hilang tapi pose ada,
          // jari di-reset ke netral (tidak membeku)
          wrist:      handSolved?.[`${handPrefix}Wrist`]               ?? ZERO,
          thumb_mcp:  handSolved?.[`${handPrefix}ThumbProximal`]       ?? ZERO,
          thumb_pip:  handSolved?.[`${handPrefix}ThumbIntermediate`]   ?? ZERO,
          thumb_dip:  handSolved?.[`${handPrefix}ThumbDistal`]         ?? ZERO,
          index_mcp:  handSolved?.[`${handPrefix}IndexProximal`]       ?? ZERO,
          index_pip:  handSolved?.[`${handPrefix}IndexIntermediate`]   ?? ZERO,
          index_dip:  handSolved?.[`${handPrefix}IndexDistal`]         ?? ZERO,
          middle_mcp: handSolved?.[`${handPrefix}MiddleProximal`]      ?? ZERO,
          middle_pip: handSolved?.[`${handPrefix}MiddleIntermediate`]  ?? ZERO,
          middle_dip: handSolved?.[`${handPrefix}MiddleDistal`]        ?? ZERO,
          ring_mcp:   handSolved?.[`${handPrefix}RingProximal`]        ?? ZERO,
          ring_pip:   handSolved?.[`${handPrefix}RingIntermediate`]    ?? ZERO,
          ring_dip:   handSolved?.[`${handPrefix}RingDistal`]          ?? ZERO,
          pinky_mcp:  handSolved?.[`${handPrefix}LittleProximal`]      ?? ZERO,
          pinky_pip:  handSolved?.[`${handPrefix}LittleIntermediate`]  ?? ZERO,
          pinky_dip:  handSolved?.[`${handPrefix}LittleDistal`]        ?? ZERO,
        };

        useHandStore.getState().setHandPose(pose);

        // Throttled debug log (1x/detik)
        if (now - lastLogTime > 1000) {
          console.log("[Bridge] handSolved keys:", handSolved ? Object.keys(handSolved) : "null");
          console.log("[Bridge] handSolved sample (wrist):", handSolved?.RightWrist, "| index_mcp:", handSolved?.RightIndexProximal);
          console.log("[Bridge] pose sent to store:", {
            wrist: pose.wrist,
            index_mcp: pose.index_mcp,
            lower_arm: pose.lower_arm,
          });
          lastLogTime = now;
        }

      } catch (error) {
        if (now - lastLogTime > 2000) {
          console.error("[Kalidokit Bridge] Kinematics solver error:", error);
          lastLogTime = now;
        }
      }
    });

    return unsubscribe;
  }, []);
}