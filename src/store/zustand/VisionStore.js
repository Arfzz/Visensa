import { create } from 'zustand'

export const useVisionStore = create((set) => ({
  isModelReady: false,
  isCalibrated: false,
  calibrationProgress: 0, // 0 sampai 100
  handLandmarks: null,    // Koordinat titik tangan buat dilempar ke 3D
  handedness: 'Left',    // Sisi tangan (Left/Right)
  calibrationWarning: false,
    
  setCalibrationWarning: (status) => set({ calibrationWarning: status }),
  setModelReady: (status) => set({ isModelReady: status }),
  setCalibrationProgress: (progress) => set({ calibrationProgress: progress }),
  setCalibrated: (status) => set({ isCalibrated: status }),
  setLandmarks: (data) => set({ handLandmarks: data }),
  setHandedness: (side) => set({ handedness: side }),
  
}))