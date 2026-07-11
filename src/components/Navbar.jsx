import { useState, useEffect } from 'react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <a href="#" className="navbar__logo" id="nav-logo">
          <svg
            className="navbar__logo-icon"
            width="24"
            height="30"
            viewBox="0 0 24 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 0L24 6V15C24 22.5 18.6 28.5 12 30C5.4 28.5 0 22.5 0 15V6L12 0Z"
              fill="#00C875"
            />
            <path
              d="M8 15L11 18L16 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="navbar__logo-text">VISENSA</span>
        </a>

        {/* Nav Links */}
        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <li><a href="#technology" className="navbar__link" id="nav-technology">Technology</a></li>
          <li><a href="#how-it-works" className="navbar__link" id="nav-how-it-works">How It Works</a></li>
          <li><a href="#for-clinicians" className="navbar__link" id="nav-for-clinicians">For Clinicians</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          <a href="#" className="navbar__signin" id="nav-signin">Sign in</a>
          <a href="#" className="navbar__cta btn-primary" id="nav-get-started">
            Get started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  )
}
