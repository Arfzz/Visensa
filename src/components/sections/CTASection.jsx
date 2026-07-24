import { useNavigate } from "react-router-dom";
import "../../styles/sections/CTASection.css";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="cta" id="cta">
      <div className="cta__inner container">
        <p className="mono-label cta__mono-label">Ready when you are</p>
        <h2 className="cta__heading">
          Begin your recovery today.
          <span className="cta__heading-accent">No appointment needed.</span>
        </h2>
        <p className="cta__sub">
          First session free. Setup in under 4 minutes. No account required.
        </p>
        <a href="#" className="cta__btn" id="cta-start-free-session">
          Start my free session
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10H16M16 10L11 5M16 10L11 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <p className="cta__clinician">
          Are you a clinician?{" "}
          <a
            onClick={() => navigate("/login-doctor")} // Mengarah ke Login Dokter, BUKAN langsung ke dashboard
            id="cta-clinician-link"
            style={{ cursor: "pointer", textDecoration: "underline" }}
          >
            Set up VISENSA for your patients →
          </a>
        </p>
      </div>
    </section>
  );
}
