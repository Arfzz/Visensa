import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Preloader from './components/ui/Preloader'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'

// Import Komponen Halaman Utama (Landing Page)
import Navbar from './components/ui/Navbar'
import HeroSection from './components/sections/HeroSection'
import StatsBar from './components/ui/StatsBar'
import FeaturesSection from './components/sections/FeaturesSection'
import TrackingSection from './components/sections/TrackingSection'
import HowItWorksSection from './components/sections/HowItWorksSection'
import TestimonialSection from './components/sections/TestimonialSection'
import CTASection from './components/sections/CTASection'
import Footer from './components/ui/Footer'

// Import Komponen Halaman Login Kamu
import Login from './pages/login/Login'

import { useLenis } from './hooks/useLenis'
import { useScrollReveal } from './hooks/useGsapAnimations'

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
  )
}

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
      </Routes>
    </Router>
  )
}

export default App