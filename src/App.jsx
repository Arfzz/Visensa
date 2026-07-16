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

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import SessionIntro from "./pages/intro/SessionIntro";
import Camera from "./pages/camera/Camera";
import SessionComplete from "./pages/session-complete/SessionComplete";

import LoginDoctor from './pages/login/LoginDoctor';
import Dashboard from "./pages/admin-dashboard/Dashboard";

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

function App() {
  // Aktifkan hook animasi bawaan jika ada
  // useLenis();
  // useScrollReveal();

  return (
    <Router>
      <Routes>
        {/* Jalur ke Landing Page (Halaman Utama) */}
        <Route path="/" element={<LandingPage />} />

        {/* Jalur ke Halaman Login Kamu */}
        <Route path="/login" element={<Login />} />

        {/* Jalur ke Halaman Register Baru */}
        <Route path="/register" element={<Register />} />

        {/* Jalur ke Halaman Intro */}
        <Route path="/intro" element={<SessionIntro />} />

        {/* Jalur ke Halaman Kamera */}
        <Route path="/camera" element={<Camera />} />

        {/* Jalur ke Halaman Sesi Selesai */}
        <Route path="/session-complete" element={<SessionComplete />} />

        {/* Jalur ke Halaman Login Dokter */}
        <Route path="/login-doctor" element={<LoginDoctor />} />

        {/* Jalur ke Halaman Dashboard Admin */}
        <Route path="/admin-dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
} // <--- Kurung kurawal penutup fungsi App harus di sini!

export default App;
