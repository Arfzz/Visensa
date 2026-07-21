import { useEffect } from "react";
import { useVisionStore } from "../../store/zustand/VisionStore";
import { useHandStore } from "../../store/zustand/useHandStore";
import * as Kalidokit from "kalidokit";

/**
 * Custom hook acting as an imperative bridge between MediaPipe landmarks and R3F bone poses.
 * Subscribes to the VisionStore, solves the kinematic rotations via Kalidokit, and writes
 * directly to useHandStore's handPose.
 */
export function useKalidokitBridge() {
  useEffect(() => {
    let lastSolveTime = 0; 
    let lastLogTime = 0;
    
    // Rem cakram: Maksimal 30 perhitungan per detik biar CPU aman
    const THROTTLE_MS = 1000 / 30; 

    const unsubscribe = useVisionStore.subscribe((state) => {
      const now = performance.now();
      
      // Bypass kalau belum lewat 33ms dari hitungan terakhir
      if (now - lastSolveTime < THROTTLE_MS) return; 
      lastSolveTime = now;

      // Tarik koordinat mentah dari Zustand
      const handLandmarks = state.handLandmarks;
      const poseLandmarks = state.poseLandmarks;
      const poseWorldLandmarks = state.poseWorldLandmarks;

      // Kalau kamera ga nangkep jari dan ga nangkep badan sama sekali, cuekin
      if (!handLandmarks && (!poseLandmarks || !poseWorldLandmarks)) return;

      try {
        let handSolved = null;
        let poseSolved = null;

        // 1. Solve Rotasi Jari & Pergelangan
        if (handLandmarks) {
          // UBAH INI JADI "Right"
          handSolved = Kalidokit.Hand.solve(handLandmarks, "Right");
        }

        // 2. Solve Rotasi Bahu & Siku
        if (poseLandmarks && poseWorldLandmarks) {
          poseSolved = Kalidokit.Pose.solve(
            poseWorldLandmarks, 
            poseLandmarks, 
            { runtime: "mediapipe", video: null }
          );
        }

        if (!handLandmarks && (!poseLandmarks || !poseWorldLandmarks)) {
        // Bikin dummy object isi 0 semua buat ngereset pose
        const resetPose = {
          lower_arm: { x: 0, y: 0, z: 0 },
          wrist: { x: 0, y: 0, z: 0 },
          thumb_mcp: { x: 0, y: 0, z: 0 }, thumb_pip: { x: 0, y: 0, z: 0 }, thumb_dip: { x: 0, y: 0, z: 0 },
          index_mcp: { x: 0, y: 0, z: 0 }, index_pip: { x: 0, y: 0, z: 0 }, index_dip: { x: 0, y: 0, z: 0 },
          middle_mcp: { x: 0, y: 0, z: 0 }, middle_pip: { x: 0, y: 0, z: 0 }, middle_dip: { x: 0, y: 0, z: 0 },
          ring_mcp: { x: 0, y: 0, z: 0 }, ring_pip: { x: 0, y: 0, z: 0 }, ring_dip: { x: 0, y: 0, z: 0 },
          pinky_mcp: { x: 0, y: 0, z: 0 }, pinky_pip: { x: 0, y: 0, z: 0 }, pinky_dip: { x: 0, y: 0, z: 0 },
        };
        useHandStore.getState().setHandPose(resetPose);
        return; // Baru abis direset, kita stop eksekusi di bawahnya
      }

        // 3. UBAH PREFIXNYA JADI "Right" BIAR NGAMBIL DATA LENGAN KANAN LU
        const handPrefix = "Right";
        const posePrefix = "Left";
        // 3. Jahit hasil dua AI jadi satu object pose utuh
        const pose = {
          // --- INJEKSI LENGAN DARI POSE ---
          lower_arm: poseSolved ? poseSolved[`${posePrefix}LowerArm`] : { x: 0, y: 0, z: 0 },
          
          // --- DATA JARI DARI HAND ---
          wrist: handSolved ? handSolved[`${handPrefix}Wrist`] : { x: 0, y: 0, z: 0 },
          thumb_mcp: handSolved ? handSolved[`${handPrefix}ThumbProximal`] : { x: 0, y: 0, z: 0 },
          thumb_pip: handSolved ? handSolved[`${handPrefix}ThumbIntermediate`] : { x: 0, y: 0, z: 0 },
          thumb_dip: handSolved ? handSolved[`${handPrefix}ThumbDistal`] : { x: 0, y: 0, z: 0 },
          index_mcp: handSolved ? handSolved[`${handPrefix}IndexProximal`] : { x: 0, y: 0, z: 0 },
          index_pip: handSolved ? handSolved[`${handPrefix}IndexIntermediate`] : { x: 0, y: 0, z: 0 },
          index_dip: handSolved ? handSolved[`${handPrefix}IndexDistal`] : { x: 0, y: 0, z: 0 },
          middle_mcp: handSolved ? handSolved[`${handPrefix}MiddleProximal`] : { x: 0, y: 0, z: 0 },
          middle_pip: handSolved ? handSolved[`${handPrefix}MiddleIntermediate`] : { x: 0, y: 0, z: 0 },
          middle_dip: handSolved ? handSolved[`${handPrefix}MiddleDistal`] : { x: 0, y: 0, z: 0 },
          ring_mcp: handSolved ? handSolved[`${handPrefix}RingProximal`] : { x: 0, y: 0, z: 0 },
          ring_pip: handSolved ? handSolved[`${handPrefix}RingIntermediate`] : { x: 0, y: 0, z: 0 },
          ring_dip: handSolved ? handSolved[`${handPrefix}RingDistal`] : { x: 0, y: 0, z: 0 },
          pinky_mcp: handSolved ? handSolved[`${handPrefix}LittleProximal`] : { x: 0, y: 0, z: 0 },
          pinky_pip: handSolved ? handSolved[`${handPrefix}LittleIntermediate`] : { x: 0, y: 0, z: 0 },
          pinky_dip: handSolved ? handSolved[`${handPrefix}LittleDistal`] : { x: 0, y: 0, z: 0 },
        };

        // Lempar ke store R3F
        useHandStore.getState().setHandPose(pose);

        // Throttled logging (1-second intervals) biar ga nyepam
        if (now - lastLogTime > 1000) {
          // console.log(`[Kalidokit Bridge] Solved Combined Pose:`, pose);
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