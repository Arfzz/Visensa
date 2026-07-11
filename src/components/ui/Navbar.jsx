import { useState, useEffect } from 'react'
import '../../styles/ui/Navbar.css'
import visensaLogo from '../../assets/visensa-logo.png'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    /* The <nav> is the full-width transparent strip fixed at the top */
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      {/* The pill pill is the inner element */}
      <div className="navbar__inner">

        {/* Logo */}
        <a href="#" className="navbar__logo" id="nav-logo" aria-label="VISENSA home">
          <img
            className="navbar__logo-icon"
            src={visensaLogo}
            alt="VISENSA logo"
            style={{ width: '22px', height: 'auto', display: 'block' }}
          />
          <span className="navbar__logo-text">VISENSA</span>
        </a>

        {/* Nav Links — centered via margin: 0 auto on the <ul> */}
        <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
          <li><a href="#technology" className="navbar__link" id="nav-technology">Technology</a></li>
          <li><a href="#how-it-works" className="navbar__link" id="nav-how-it-works">How It Works</a></li>
          <li><a href="#for-clinicians" className="navbar__link" id="nav-for-clinicians">For Clinicians</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          <a href="#" className="navbar__signin" id="nav-signin">Sign in</a>
          <a href="#" className="navbar__cta btn-primary" id="nav-get-started">
            Get started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          id="nav-hamburger"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
