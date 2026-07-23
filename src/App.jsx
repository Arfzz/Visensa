import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { Model } from "./models/Robotic_prosthetic_arm";
import { MockTester } from "./components/MockTester";
import { VisensaCanvas } from "./components/VisensaCanvas";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useVisionStore } from './store/zustand/VisionStore'
import VisionTracker from './components/VisionTracker'
import { useKalidokitBridge } from './services/kalidokit/useKalidokitBridge'

export default function App() {
  useKalidokitBridge();
  const { isCalibrated, calibrationProgress, calibrationWarning } = useVisionStore();

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <VisensaCanvas />

      {/* Modern overlay container for real-time webcam tracking and calibration HUD */}
      <div style={{
        position: "absolute",
        top: "24px",
        right: "24px",
        width: "240px",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <VisionTracker showCanvas={true} />

        <div style={{
          padding: "16px",
          background: "rgba(20, 20, 20, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          color: "#f5f5f5",
          fontSize: "12px",
          fontFamily: "'Outfit', 'Inter', sans-serif",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "8px" }}>
            <span style={{ fontWeight: 600 }}>Tracking Status</span>
            <span style={{
              fontWeight: "bold",
              color: isCalibrated ? "#10b981" : "#f59e0b",
              marginLeft: "auto"
            }}>
              {isCalibrated ? "Calibrated" : "Calibrating"}
            </span>
          </div>

          {!isCalibrated && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                <span>Calibration progress</span>
                <span>{Math.round(calibrationProgress)}%</span>
              </div>
              <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  width: `${calibrationProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
                  transition: "width 0.1s linear"
                }} />
              </div>
            </div>
          )}

          {calibrationWarning && (
            <div style={{
              marginTop: "8px",
              color: "#ef4444",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              ⚠️ Keep hand visible in frame!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}