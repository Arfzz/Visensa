import './TrackingSection.css'

export default function TrackingSection() {
  const features = [
    'Pain score tracked before and after every session',
    'Weekly summary in plain English, not data tables',
    'Share a PDF report with your therapist in one tap',
    'All data stored locally — never leaves your device',
  ]

  return (
    <section className="tracking" id="tracking">
      <div className="tracking__container container">
        {/* Left — Dashboard Preview */}
        <div className="tracking__visual">
          <div className="tracking__visual-inner">
            <DashboardCard />
            <WeeklyCard />
          </div>
        </div>

        {/* Right — Content */}
        <div className="tracking__content">
          <p className="tracking__mono-label mono-label">PROGRESS DASHBOARD</p>
          <h2 className="tracking__heading">
            Track Your <span className="tracking__heading-accent">Recovery</span>
            <br />Every Session.
          </h2>
          <p className="tracking__desc">
            After every session, VISENSA logs your pain score and exercise quality. Watch your recovery curve trend downward — week by week, session by session.
          </p>
          <ul className="tracking__features">
            {features.map((f, i) => (
              <li key={i} className="tracking__feature-item">
                <span className="tracking__feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="rgba(0, 184, 176, 0.12)" />
                    <path d="M6 10L9 13L14 7" stroke="#00B8B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function DashboardCard() {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <span className="dashboard-card__title">Pain Progress</span>
        <span className="dashboard-card__badge">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: 4 }}>
            <path d="M5 1V9M5 9L1 5M5 9L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          50%
        </span>
      </div>
      <p className="dashboard-card__sub">Week 4 of recovery</p>

      {/* Sparkline (downward) */}
      <div className="dashboard-card__chart">
        <svg viewBox="0 0 340 80" fill="none" className="dashboard-sparkline" preserveAspectRatio="none">
          <path
            d="M0 10 C80 10, 160 30, 340 70"
            stroke="#00B8B0"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M0 10 C80 10, 160 30, 340 70 L340 80 L0 80 Z"
            fill="url(#dashGrad)"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B8B0" stopOpacity="1" />
              <stop offset="100%" stopColor="#00B8B0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Week comparison */}
      <div className="dashboard-card__compare">
        <div className="dashboard-card__week">
          <span className="dashboard-card__week-label">WEEK 1</span>
          <span className="dashboard-card__week-val">8.0</span>
        </div>
        <span className="dashboard-card__arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#a0b3b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="dashboard-card__week dashboard-card__week--current">
          <span className="dashboard-card__week-label">WEEK 4</span>
          <span className="dashboard-card__week-val" style={{ color: '#00B8B0' }}>4.0</span>
        </div>
      </div>
    </div>
  )
}

function WeeklyCard() {
  return (
    <div className="weekly-card">
      <span className="weekly-card__label mono-label">THIS WEEK</span>
      <span className="weekly-card__value">4 sessions</span>
      <span className="weekly-card__trend">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: 4 }}>
          <path d="M5 9V1M5 1L1 5M5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        2 from last week
      </span>
    </div>
  )
}
