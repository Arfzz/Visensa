import './HeroSection.css'

export default function HeroSection() {
  return (
    <section className="hero" id="hero">
      <div className="hero__container container">
        {/* Left Content */}
        <div className="hero__content">
          {/* Mono label */}
          <div className="hero__label mono-label mono-label--dot">
            Research-backed mirror therapy
          </div>

          {/* Heading */}
          <h1 className="hero__heading">
            Your hand<br />
            still knows<br />
            <span className="hero__heading-accent">how to move.</span>
          </h1>

          {/* Paragraph */}
          <p className="hero__desc">
            Browser-based mirror therapy for phantom limb pain. Clinically validated, 
            Zero hardware required. Powered by AI. No appointment needed.
          </p>

          {/* CTAs */}
          <div className="hero__actions">
            <a href="#" className="btn-hero-primary" id="hero-start-free">
              Start free session
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#how-it-works" className="btn-hero-secondary" id="hero-how-it-works">
              <span className="btn-hero-secondary__icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.5 5.5L10.5 8L6.5 10.5V5.5Z" fill="currentColor"/>
                </svg>
              </span>
              How it works
            </a>
          </div>

          {/* Trust badges */}
          <div className="hero__badges">
            <span className="hero__badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="#00C875" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              No hardware needed
            </span>
            <span className="hero__badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="#00C875" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Camera stays on-device
            </span>
            <span className="hero__badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="#00C875" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Free first session
            </span>
          </div>
        </div>

        {/* Right — App Preview Card */}
        <div className="hero__visual">
          {/* Main App Card */}
          <div className="hero-card hero-card--main">
            <div className="hero-card__header">
              <div className="hero-card__status">
                <span className="hero-card__status-dot"></span>
                <span className="hero-card__status-label">ACTIVE SESSION</span>
              </div>
              <span className="hero-card__progress-label">3 / 8</span>
            </div>

            {/* Hand visualization */}
            <div className="hero-card__hand-area">
              <HandSVG />
            </div>

            <div className="hero-card__instruction">
              <p>Slowly open and close your hand</p>
              <div className="hero-card__progress-bar">
                <div className="hero-card__progress-fill" style={{ width: '37.5%' }}></div>
                <span className="hero-card__progress-num">3/8</span>
              </div>
            </div>
          </div>

          {/* Session Complete badge */}
          <div className="hero-badge-card hero-badge-card--complete">
            <div className="hero-badge-card__icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#00C875"/>
                <path d="M5 10L8.5 13.5L15 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="hero-badge-card__info">
              <span className="hero-badge-card__title">Session complete</span>
              <span className="hero-badge-card__meta">8/8 exercises · 11:42</span>
            </div>
          </div>

          {/* Patient Progress Card */}
          <div className="hero-badge-card hero-badge-card--patient">
            <div className="hero-badge-card__avatar">R</div>
            <div className="hero-badge-card__info">
              <span className="hero-badge-card__title">Robert M.</span>
              <span className="hero-badge-card__meta">Week 4 · Phantom limb</span>
            </div>
            <div className="hero-badge-card__weeks">
              {[...Array(7)].map((_, i) => (
                <span key={i} className={`hero-badge-card__week-dot ${i < 4 ? 'hero-badge-card__week-dot--active' : ''}`}></span>
              ))}
            </div>
            <span className="hero-badge-card__meta hero-badge-card__meta--weeks">4 of 8 weeks complete</span>
          </div>

          {/* Pain Score Card */}
          <div className="hero-badge-card hero-badge-card--pain">
            <span className="hero-badge-card__label">PAIN SCORE</span>
            <span className="hero-badge-card__value">↓42%</span>
            <span className="hero-badge-card__meta">avg. after 4 weeks</span>
            <SparklineSVG />
          </div>

          {/* Joint tracking badge */}
          <div className="hero-badge-card hero-badge-card--joints">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#00C875" strokeWidth="1.5"/>
              <circle cx="7" cy="7" r="2" fill="#00C875"/>
            </svg>
            <span>21 JOINTS TRACKED</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function HandSVG() {
  return (
    <svg className="hero-card__hand-svg" viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Palm */}
      <ellipse cx="150" cy="170" rx="60" ry="55" fill="rgba(0,200,117,0.08)" stroke="rgba(0,200,117,0.3)" strokeWidth="1.5"/>
      {/* Fingers */}
      {/* Thumb */}
      <path d="M100 155 Q85 130 90 110 Q95 90 108 100 Q115 115 108 140" stroke="rgba(0,200,117,0.5)" strokeWidth="12" strokeLinecap="round" fill="none"/>
      {/* Index */}
      <path d="M118 125 Q115 95 120 65 Q125 40 135 55 Q140 75 135 115" stroke="rgba(0,200,117,0.5)" strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* Middle */}
      <path d="M143 120 Q142 88 146 55 Q150 28 160 45 Q165 65 158 115" stroke="rgba(0,200,117,0.5)" strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* Ring */}
      <path d="M168 124 Q170 95 172 68 Q175 48 184 62 Q188 80 182 120" stroke="rgba(0,200,117,0.5)" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* Pinky */}
      <path d="M192 135 Q196 110 196 88 Q197 72 204 82 Q207 96 202 130" stroke="rgba(0,200,117,0.4)" strokeWidth="9" strokeLinecap="round" fill="none"/>

      {/* Joint dots */}
      {[
        [150, 170], [120, 150], [145, 145], [170, 148], [196, 155],
        [108, 140], [135, 115], [158, 115], [182, 120], [202, 130],
        [100, 122], [120, 95], [143, 90], [168, 94], [194, 106],
        [95, 105], [122, 70], [146, 68], [170, 72], [195, 90],
        [108, 100]
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#00C875" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur={`${1.5 + i * 0.1}s`} repeatCount="indefinite"/>
        </circle>
      ))}

      {/* Connection lines */}
      <g opacity="0.25" stroke="#00C875" strokeWidth="1">
        <line x1="150" y1="170" x2="120" y2="150"/>
        <line x1="150" y1="170" x2="145" y2="145"/>
        <line x1="150" y1="170" x2="170" y2="148"/>
        <line x1="150" y1="170" x2="196" y2="155"/>
        <line x1="120" y1="150" x2="108" y2="140"/>
        <line x1="108" y1="140" x2="100" y2="122"/>
        <line x1="145" y1="145" x2="135" y2="115"/>
        <line x1="135" y1="115" x2="120" y2="95"/>
        <line x1="170" y1="148" x2="158" y2="115"/>
        <line x1="158" y1="115" x2="143" y2="90"/>
      </g>
    </svg>
  )
}

function SparklineSVG() {
  return (
    <svg className="hero-badge-card__sparkline" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 32 L20 28 L40 20 L60 16 L80 10 L100 6 L120 4"
        stroke="#00C875"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0 32 L20 28 L40 20 L60 16 L80 10 L100 6 L120 4 L120 40 L0 40Z"
        fill="url(#sparkGradient)"
        opacity="0.2"
      />
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C875"/>
          <stop offset="100%" stopColor="#00C875" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
