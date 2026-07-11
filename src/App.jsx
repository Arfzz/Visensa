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

function App() {
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
