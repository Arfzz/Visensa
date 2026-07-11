import './FeaturesSection.css'
import SpotlightCard from './SpotlightCard'

export default function FeaturesSection() {
  return (
    <section className="features" id="technology">
      <div className="features__container container">
        {/* Header */}
        <div className="features__header">
          <p className="features__mono-label mono-label">WHAT MAKES VISENSA DIFFERENT</p>
          <h2 className="features__heading">
            Proven therapy.<br />Made for home.
          </h2>
        </div>

        {/* Grid */}
        <div className="features__grid">
          {/* Card 1 — AI Hand Tracking (large, dark) */}
          <SpotlightCard className="feature-card feature-card--dark feature-card--top-left" spotlightColor="rgba(0, 184, 176, 0.18)">
            <div className="feature-card__content">
              <div className="feature-card__mono-label mono-label">
                REAL-TIME HAND TRACKING
              </div>
              <h3 className="feature-card__heading">
                AI sees 21 hand joints.<br />You focus on healing.
              </h3>
              <p className="feature-card__desc">
                MediaPipe hand tracking runs<br />
                entirely in your browser — zero<br />
                data leaves your device.
              </p>
            </div>
            <div className="feature-card__hands">
              <FeatureHandViz />
            </div>
          </SpotlightCard>

          {/* Card 2 — Zero Hardware */}
          <SpotlightCard className="feature-card feature-card--white feature-card--top-right" spotlightColor="rgba(0, 184, 176, 0.09)">
            <div className="feature-card__icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="12" rx="2" fill="#d1e0e8" stroke="#1d2d35" strokeWidth="1.5" />
                <path d="M2 18h20" stroke="#1d2d35" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="10" r="2" fill="#1d2d35" />
              </svg>
            </div>
            <h3 className="feature-card__heading-sm">Zero hardware required</h3>
            <p className="feature-card__desc">
              Any webcam works. No VR headset. No sensors. Just open your browser.
            </p>
          </SpotlightCard>

          {/* Card 3 — Progress you can see */}
          <SpotlightCard className="feature-card feature-card--yellow feature-card--bottom-left" spotlightColor="rgba(205, 220, 40, 0.12)">
            <h3 className="feature-card__heading-sm">Progress you can see</h3>
            <div className="feature-card__chart-wrapper">
              <ProgressChart />
            </div>
            <div className="feature-card__chart-labels">
              <span>Week 1</span>
              <span>Week 8</span>
            </div>
          </SpotlightCard>

          {/* Card 4 — Clinical Foundation */}
          <SpotlightCard className="feature-card feature-card--white feature-card--bottom-right" spotlightColor="rgba(0, 184, 176, 0.09)">
            <div className="feature-card__mono-label mono-label">CLINICAL FOUNDATION</div>
            <div className="feature-card__clinical-layout">
              <div className="feature-card__clinical-left">
                <h3 className="feature-card__heading-sm">
                  Built on 30 years of peer-<br />reviewed mirror therapy<br />research
                </h3>
              </div>
              <div className="feature-card__clinical-right">
                <div className="feature-card__big-num">200+</div>
                <div className="feature-card__big-label">peer-reviewed studies</div>
              </div>
            </div>
            <div className="feature-card__badges">
              <span className="feature-card__badge">NICE Aligned</span>
              <span className="feature-card__badge">CE Mark pending</span>
              <span className="feature-card__badge">GDPR Compliant</span>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  )
}

function FeatureHandViz() {
  return (
    <svg className="feature-hands-svg" viewBox="0 0 400 220" fill="none" aria-hidden="true">
      {/* LEFT HAND (solid / gray) */}
      <g className="hand-solid" transform="translate(60, -20) scale(0.9)">
        <ellipse cx="145" cy="190" rx="52" ry="46" fill="#4a5568" />
        <path d="M98 175 C88 158 86 138 90 120 C94 102 106 98 114 110 C119 120 116 145 110 168" fill="#4a5568" stroke="#4a5568" strokeWidth="4" strokeLinecap="round" />
        <path d="M125 150 C120 120 115 80 125 70 C135 60 140 70 145 90 C145 110 140 140 140 150" fill="#4a5568" stroke="#4a5568" strokeWidth="4" strokeLinecap="round" />
        <path d="M148 145 C148 110 150 65 160 55 C170 45 178 55 175 75 C170 100 168 135 168 145" fill="#4a5568" stroke="#4a5568" strokeWidth="4" strokeLinecap="round" />
        <path d="M172 150 C178 120 185 85 195 80 C205 75 208 85 200 105 C195 125 190 145 188 155" fill="#4a5568" stroke="#4a5568" strokeWidth="4" strokeLinecap="round" />
        <path d="M190 165 C198 145 208 120 216 120 C224 120 222 130 215 145 C208 160 200 175 198 180" fill="#4a5568" stroke="#4a5568" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* RIGHT HAND (teal outline) */}
      <g className="hand-outline" transform="translate(30, -20) scale(0.9)">
        <ellipse cx="285" cy="190" rx="52" ry="46" fill="none" stroke="#4ECDC4" strokeWidth="2" />
        <path d="M238 175 C228 158 226 138 230 120 C234 102 246 98 254 110 C259 120 256 145 250 168" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
        <path d="M265 150 C260 120 255 80 265 70 C275 60 280 70 285 90 C285 110 280 140 280 150" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
        <path d="M288 145 C288 110 290 65 300 55 C310 45 318 55 315 75 C310 100 308 135 308 145" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
        <path d="M312 150 C318 120 325 85 335 80 C345 75 348 85 340 105 C335 125 330 145 328 155" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
        <path d="M330 165 C338 145 348 120 356 120 C364 120 362 130 355 145 C348 160 340 175 338 180" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function ProgressChart() {
  const bars = [40, 30, 45, 35, 30, 25, 20, 20, 15]
  const max = 50
  return (
    <div className="features-progress-chart">
      {bars.map((h, i) => (
        <div
          key={i}
          className="features-progress-chart__bar"
          style={{ height: `${(h / max) * 100}%` }}
        >
          <div className="features-progress-chart__fill" style={{ animationDelay: `${i * 0.05}s` }}></div>
        </div>
      ))}
    </div>
  )
}
