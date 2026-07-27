import React from "react";
import { Link } from "react-router-dom";
import "../../styles/ui/Footer.css";
import visensaLogo from "../../assets/visensa-logo.png";

const EXERCISE_MODULES = [
  { name: "Open & close — gentle", id: "ex-1" },
  { name: "Wrist flexion/extension", id: "ex-2" },
  { name: "Pinch grip — coin", id: "ex-3" },
  { name: "Wrist deviation — floating", id: "ex-4" },
  { name: "Finger tap sequence", id: "ex-5" },
  { name: "Static open hold", id: "ex-6" },
  { name: "Single finger lift", id: "ex-7" },
  { name: "Fist hold", id: "ex-8" },
];

const PLATFORM_NAV = [
  { name: "Home Page", path: "/" },
  { name: "Start Therapy Session", path: "/intro" },
  { name: "Camera & 3D Tracking", path: "/camera" },
  { name: "Patient Dashboard", path: "/admin-dashboard" },
  { name: "Doctor Portal", path: "/login-doctor" },
];

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top container">
        {/* Brand Column */}
        <div className="footer__brand">
          <div className="footer__logo">
            <img
              src={visensaLogo}
              alt="VISENSA Logo"
              style={{ width: "24px", height: "auto" }}
            />
            <h2>VISENSA</h2>
          </div>
          <p className="footer__brand-desc">
            Empowering neurorehabilitation through accessible digital therapy.
            Visensa helps patients perform interactive mirror therapy anytime
            using only a web browser and a standard webcam.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="footer__col">
          <h4 className="footer__col-heading">Platform Navigation</h4>
          <ul className="footer__links">
            {PLATFORM_NAV.map((item) => (
              <li key={item.name}>
                <Link to={item.path} className="footer__link">
                  › {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Exercise Modules Quick List */}
        <div className="footer__col">
          <h4 className="footer__col-heading">
            Therapy Modules (8 Kinematics)
          </h4>
          <ul className="footer__links footer__links--compact">
            {EXERCISE_MODULES.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link to="/intro" className="footer__link">
                  • {item.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/intro" className="footer__link footer__link--accent">
                +3 Stability Modules
              </Link>
            </li>
          </ul>
        </div>

        {/* Medical & Clinical Disclaimer Box */}
        <div className="footer__disclaimer-box">
          <div className="footer__disclaimer-header">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4BA882"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Clinical &amp; Safety Guidelines</span>
          </div>
          <p className="footer__disclaimer-text">
            Visensa is designed as a precision digital therapeutic tool for
            motor rehabilitation. Use under the guidance of a physical medicine
            and rehabilitation specialist (PM&amp;R).
          </p>
          <div className="footer__action-row">
            <Link to="/intro" className="footer__cta-btn">
              Start Session Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner container">
          <div className="footer__copyright">
            <img
              src={visensaLogo}
              alt="VISENSA Logo"
              style={{ width: "20px", height: "auto" }}
            />
            <span>
              © 2026 VISENSA REHABILITATION PLATFORM • ALL RIGHTS RESERVED
            </span>
          </div>

          <div className="footer__status-badge">
            <span className="footer__status-dot" />
            <span>Camera &amp; AI Kinematics Engine Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
