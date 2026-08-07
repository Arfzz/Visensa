import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Preloader from "./components/ui/Preloader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./App.css";

// Import Komponen Halaman Utama (Landing Page)
import Navbar from "./components/ui/Navbar";
import HeroSection from "./components/sections/HeroSection";
import StatsBar from "./components/ui/StatsBar";
import FeaturesSection from "./components/sections/FeaturesSection";
import TrackingSection from "./components/sections/TrackingSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import TestimonialSection from "./components/sections/TestimonialSection";
import CTASection from "./components/sections/CTASection";
import Footer from "./components/ui/Footer";

// R3F 3D Tracking Imports (from feature/r3f)
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { Model } from "./models/Robotic_prosthetic_arm";
import { MockTester } from "./components/MockTester";
import { VisensaCanvas } from "./components/VisensaCanvas";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import { useVisionStore } from "./store/zustand/VisionStore";
import VisionTracker from "./components/VisionTracker";
import { useKalidokitBridge } from "./services/kalidokit/useKalidokitBridge";
import LeftHandWarningModal from "./components/LeftHandWarningModal";

// Import Pages Pasien
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import SessionIntro from "./pages/intro/SessionIntro";
import Camera from "./pages/camera/Camera";
import SessionComplete from "./pages/session-complete/SessionComplete";
import PatientDashboard from "./pages/patient-dashboard/PatientDashboard";
import StreakSandbox from "./features/gamification/streak/StreakSandbox";

// Import Pages Dokter/Admin
import LoginDoctor from "./pages/login/LoginDoctor";
import RegisterDoctor from "./pages/register/RegisterDoctor";
import Dashboard from "./pages/admin-dashboard/Dashboard";
import PianoTilesSandbox from "./features/gamification/PianoTilesSandbox";
import AdminOverview from "./pages/admin-dashboard/AdminOverview";

// Import Hooks
import ProtectedRoute from "./utils/ProtectedRoute";
import { useLenis } from "./hooks/useLenis";
import { useScrollReveal } from "./hooks/useGsapAnimations";

// Komponen Pembungkus Landing Page agar rapi
const LandingPage = () => {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <TrackingSection />
        <HowItWorksSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};

// Komponen R3F 3D Hand Tracking View (from feature/r3f)
const Tracking3DView = () => {
  useKalidokitBridge();
  const { isCalibrated, calibrationProgress, calibrationWarning } =
    useVisionStore();

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <VisensaCanvas />
      <LeftHandWarningModal />

      {/* Modern overlay container for real-time webcam tracking and calibration HUD */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          width: "240px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <VisionTracker showCanvas={true} />

        <div
          style={{
            padding: "16px",
            background: "rgba(20, 20, 20, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            color: "#f5f5f5",
            fontSize: "12px",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span style={{ fontWeight: 600 }}>Tracking Status</span>
            <span
              style={{
                fontWeight: "bold",
                color: isCalibrated ? "#10b981" : "#f59e0b",
                marginLeft: "auto",
              }}
            >
              {isCalibrated ? "Calibrated" : "Calibrating"}
            </span>
          </div>

          {!isCalibrated && (
            <div style={{ marginTop: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <span>Calibration progress</span>
                <span>{Math.round(calibrationProgress)}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${calibrationProgress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            </div>
          )}

          {calibrationWarning && (
            <div
              style={{
                marginTop: "8px",
                color: "#ef4444",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ⚠️ Keep hand visible in frame!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  // Aktifkan hook animasi bawaan jika ada
  useLenis();
  useScrollReveal();

  return (
    <Router>
      <Routes>
        {/* ========================================== */}
        {/* PUBLIC ROUTES (Bebas diakses tanpa login)  */}
        {/* ========================================== */}
        <Route path="/" element={<LandingPage />} />

        {/* Jalur ke Gamification Sandbox - Rhythm Piano Tiles */}
        <Route path="/piano-tiles" element={<PianoTilesSandbox />} />
        <Route path="/game-test" element={<PianoTilesSandbox />} />

        {/* Jalur ke Sandbox Streak Mini-Games */}
        <Route path="/streak-test" element={<StreakSandbox />} />
        <Route path="/streak-sandbox" element={<StreakSandbox />} />

        {/* Jalur ke 3D Hand Tracking View */}
        <Route path="/tracking-3d" element={<Tracking3DView />} />

        {/* Jalur ke Halaman Login Kamu */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login-doctor" element={<LoginDoctor />} />
        <Route path="/register-doctor" element={<RegisterDoctor />} />
        {/* ========================================== */}
        {/* PROTECTED ROUTES KHUSUS PASIEN             */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route path="/intro" element={<SessionIntro />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/session-complete" element={<SessionComplete />} />
          <Route path="/tracking-3d" element={<Tracking3DView />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/interactive-practice" element={<PatientDashboard initialTab="Interactive Practice" />} />
        </Route>

        {/* ========================================== */}
        {/* PROTECTED ROUTES KHUSUS DOKTER             */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/dashboard" element={<AdminOverview />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
