import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'

import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import StatsBar from './components/StatsBar'
import FeaturesSection from './components/FeaturesSection'
import TrackingSection from './components/TrackingSection'
import HowItWorksSection from './components/HowItWorksSection'
import TestimonialSection from './components/TestimonialSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

import { useLenis } from './hooks/useLenis'
import { useScrollReveal } from './hooks/useGsapAnimations'

gsap.registerPlugin(ScrollTrigger)

function App() {
  // ── 1. Lenis smooth scroll ──────────────────────────────────────
  useLenis()

  // ── 2. Generic section reveals ─────────────────────────────────
  // Features cards
  useScrollReveal('.features__grid', '.feature-card', { stagger: 0.1 })
  // How it works steps
  useScrollReveal('.hiw__steps', '.hiw__step', { stagger: 0.15 })
  // Testimonial cards
  useScrollReveal('.testimonial__grid', '.testimonial-card', { stagger: 0.1 })
  // Footer columns
  useScrollReveal('.footer__grid', '.footer__col', { stagger: 0.08, duration: 0.55 })
  // CTA section
  useScrollReveal('.cta', '.cta__content > *', { stagger: 0.1, duration: 0.65 })
  // Stats bar items
  useScrollReveal('.stats-bar', '.stats-bar__item', { stagger: 0.08 })
  // Tracking content blocks
  useScrollReveal('.tracking__content', '.tracking__feature-item', { stagger: 0.1 })

  // ── 3. Respect prefers-reduced-motion ──────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      gsap.globalTimeline.timeScale(100) // instant for a11y
    }
  }, [])

  return (
    <>
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

export default App
