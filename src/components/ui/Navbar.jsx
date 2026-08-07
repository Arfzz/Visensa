import { useState, useEffect, useRef } from "react";
import "../../styles/ui/Navbar.css";
import visensaLogo from "../../assets/visensa-logo.png";
import { Link } from "react-router-dom";

const menuItems = [
  { id: "hero", label: "Home", href: "#hero" },
  { id: "features", label: "Features", href: "#features" },
  { id: "testimonial", label: "Results", href: "#testimonial" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isClickScrolling = useRef(false);
  const clickTimerRef = useRef(null);

  // ── User state from localStorage ─────────────────────────────────
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) { }
    } else {
      setUser(null);
    }
  }, []);

  const formatName = (fullName, email) => {
    if (!fullName) {
      if (email) return email.split('@')[0];
      return "User";
    }
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1][0]}`;
  };

  // ── Scroll state (for subtle shadow bump) ──────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── IntersectionObserver for active section ─────────────────────────
  useEffect(() => {
    const handler = (entries) => {
      if (isClickScrolling.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    };

    const observer = new IntersectionObserver(handler, {
      root: null,
      rootMargin: "-20% 0px -50% 0px",
      threshold: 0.1,
    });

    menuItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  function handleNavClick(id) {
    setActiveSection(id);
    setMenuOpen(false);
    isClickScrolling.current = true;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  }

  return (
    <header
      className={`navbar${scrolled ? " navbar--scrolled" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className="navbar__inner">
        {/* ── Logo ──────────────────────────────────────────────── */}
        <a
          href="#hero"
          className="navbar__logo"
          id="nav-logo"
          aria-label="VISENSA home"
          onClick={() => handleNavClick("hero")}
        >
          <img
            className="navbar__logo-icon"
            src={visensaLogo}
            alt="VISENSA logo"
          />
          <span className="navbar__logo-text">VISENSA</span>
        </a>

        <div className="navbar__divider" aria-hidden="true" />

        {/* ── Nav Links ─────────────────────────────────────────── */}
        <ul
          className={`navbar__links${menuOpen ? " navbar__links--open" : ""}`}
        >
          {menuItems.map(({ id, label, href }) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <a
                  href={href}
                  id={`nav-${id}`}
                  className={`navbar__link${isActive ? " navbar__link--active" : ""}`}
                  onClick={() => handleNavClick(id)}
                >
                  {/* sliding active pill (CSS-driven, no Framer Motion) */}
                  {isActive && (
                    <span className="navbar__link-pill" aria-hidden="true" />
                  )}
                  <span className="navbar__link-text">{label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="navbar__actions">
          {user ? (
            <>
              <Link
                to={user.role === 'doctor' ? "/admin-dashboard" : "/patient-dashboard"}
                className="navbar__signin"
                id="nav-user-name"
                style={{ textDecoration: "none" }}
              >
                {formatName(user.name, user.email)}
              </Link>
              <Link
                to={user.role === 'doctor' ? "/admin-dashboard" : "/patient-dashboard"}
                className="navbar__cta btn-primary"
                id="nav-start-session"
                style={{ textDecoration: "none" }}
              >
                Dashboard
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7H12M12 7L8 3M12 7L8 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar__cta btn-primary"
                id="nav-signin"
                style={{ textDecoration: "none" }}
              >
                Sign In
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7H12M12 7L8 3M12 7L8 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ──────────────────────────────────── */}
        <button
          className={`navbar__hamburger${menuOpen ? " navbar__hamburger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          id="nav-hamburger"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
    </header>
  );
}
