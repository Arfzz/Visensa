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
          <DashboardCard />
          <WeeklyCard />
        </div>

        {/* Right — Content */}
        <div className="tracking__content">
          <p className="mono-label">Progress Dashboard</p>
          <h2 className="tracking__heading">
            Track Your{' '}
            <span className="tracking__heading-accent">Recovery</span>
            <br />Every Session.
          </h2>
          <p className="tracking__desc">
            After every session, VISENSA logs your pain score and movement data so you can see 
            exactly how much you're improving — week by week.
          </p>
          <ul className="tracking__features">
            {features.map((f, i) => (
              <li key={i} className="tracking__feature-item">
                <span className="tracking__feature-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="#00C875"/>
                    <path d="M4 7L6.5 9.5L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        <span className="dashboard-card__badge">↓ 50%</span>
      </div>
      <p className="dashboard-card__sub">Week 4 of recovery</p>

      {/* Sparkline */}
      <div className="dashboard-card__chart">
        <svg viewBox="0 0 340 80" fill="none" className="dashboard-sparkline">
          <path
            d="M0 60 C30 55 60 45 90 35 C120 25 150 20 180 15 C210 10 240 8 270 6 C300 4 320 3 340 2"
            stroke="#00C875"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M0 60 C30 55 60 45 90 35 C120 25 150 20 180 15 C210 10 240 8 270 6 C300 4 320 3 340 2 L340 80 L0 80Z"
            fill="url(#dashGrad)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C875"/>
              <stop offset="100%" stopColor="#00C875" stopOpacity="0"/>
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
        <span className="dashboard-card__arrow">→</span>
        <div className="dashboard-card__week dashboard-card__week--current">
          <span className="dashboard-card__week-label">WEEK 4</span>
          <span className="dashboard-card__week-val" style={{ color: '#00C875' }}>4.0</span>
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
      <span className="weekly-card__trend">↑ 2 from last week</span>
    </div>
  )
}
