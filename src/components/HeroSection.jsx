import './HeroSection.css'
import startIcon from '../assets/start-icon.png'
import { useHeroAnimation } from '../hooks/useHeroAnimation'
import TextType from './TextType'
import SplitText from './SplitText'
import DotField from './DotField'

export default function HeroSection() {
  useHeroAnimation()

  return (
    <section className="hero" id="hero">
      {/* ── Interactive Background Grid ── */}
      <DotField
        dotRadius={1.5}
        dotSpacing={20}
        bulgeStrength={80}
        cursorRadius={300}
        glowRadius={250}
        sparkle={true}
        waveAmplitude={0}
        gradientFrom="rgba(0, 184, 176, 0.4)"
        gradientTo="rgba(0, 184, 176, 0.1)"
        glowColor="rgba(0, 184, 176, 0.15)"
      />

      <div className="hero__container container">

        {/* ── Left Content ── */}
        <div className="hero__content">

          {/* Pill label */}
          <div className="hero__label" id="hero-label">
            <span className="hero__label-dot"></span>
            RESEARCH-BACKED MIRROR THERAPY
          </div>

          {/* Heading — SplitText for static text, TextType cycling on accent line */}
          <h1 className="hero__heading" aria-label="Your hand still knows how to move.">
            <SplitText
              text="Your hand"
              tag="span"
              splitType="words"
              textAlign="left"
              delay={80}
              duration={0.75}
              ease="power3.out"
              from={{ opacity: 0, y: 36 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
            />
            <br />
            <SplitText
              text="still knows"
              tag="span"
              splitType="words"
              textAlign="left"
              delay={80}
              duration={0.75}
              ease="power3.out"
              from={{ opacity: 0, y: 36 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
            />
            <br />
            <span className="hero__heading-accent">
              <TextType
                text={[
                  'how to move.',
                  'how to heal.',
                  'how to recover.',
                ]}
                as="span"
                typingSpeed={65}
                deletingSpeed={35}
                pauseDuration={2200}
                initialDelay={800}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="hero__cursor"
                variableSpeed={{ min: 45, max: 90 }}
              />
            </span>
          </h1>

          {/* Description — exact Figma copy */}
          <p className="hero__desc">
            Browser-based mirror therapy for phantom limb<br />
            pain and stroke rehabilitation. Clinically backed.<br />
            No hardware. No download.
          </p>

          {/* CTAs */}
          <div className="hero__actions">
            <a href="#" className="hero__btn-primary" id="hero-start-free">
              Start free session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#how-it-works" className="hero__btn-secondary" id="hero-how-it-works">
              <span className="hero__btn-secondary__play" aria-hidden="true">
                <img src={startIcon} alt="Play icon" style={{ width: '17px', height: '17px' }} />
              </span>
              How it works
            </a>
          </div>

          {/* Trust badges */}
          <div className="hero__badges">
            {['No hardware needed', 'Camera stays on-device', 'Free first session'].map((text) => (
              <span key={text} className="hero__badge">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="6.5" fill="#4ECDC4" opacity="0.2" />
                  <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="#00A99D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right Visual ── */}
        <div className="hero__visual">

          {/* Main session card — tilted */}
          <div className="hero-main-card" aria-label="Active therapy session preview">
            {/* Card header */}
            <div className="hero-main-card__header">
              <div className="hero-main-card__status">
                <span className="hero-main-card__dot"></span>
                <span className="hero-main-card__status-text">ACTIVE SESSION</span>
              </div>
              <span className="hero-main-card__counter">3 / 8</span>
            </div>

            {/* Two hands */}
            <div className="hero-main-card__hands">
              <TwoHandsSVG />
            </div>

            {/* Joints pill — inside card */}
            <div className="hero-main-card__joints-pill">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 6C1 3.24 3.24 1 6 1" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 6C11 8.76 8.76 11 6 11" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="6" cy="6" r="2" fill="#4ECDC4" />
              </svg>
              21 JOINTS TRACKED
            </div>

            {/* Instruction footer */}
            <div className="hero-main-card__footer">
              <p className="hero-main-card__instruction">Slowly open and close your hand</p>
              <div className="hero-main-card__progress">
                <div className="hero-main-card__progress-track">
                  <div className="hero-main-card__progress-fill"></div>
                </div>
                <span className="hero-main-card__progress-num">3/8</span>
              </div>
            </div>
          </div>

          {/* Session complete pill — top left overlap */}
          <div className="hero-pill-card hero-pill-card--completed">
            <div className="hero-pill-card__completed-header">
              <span className="hero-pill-card__check">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                  <circle cx="12.59" cy="12.59" r="12.59" fill="#4BA882" />
                  <path d="M8 12.5L11.5 16L17.5 9" stroke="white" strokeWidth="1.52" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="hero-pill-card__title">Session complete</p>
            </div>
            <p className="hero-pill-card__meta">8/8 exercises · 11:42</p>
          </div>

          {/* Robert M. card — bottom left */}
          <div className="hero-float-card hero-float-card--patient">
            <div className="hero-float-card__avatar">R</div>
            <div className="hero-float-card__info">
              <p className="hero-float-card__name">Robert M.</p>
              <p className="hero-float-card__sub">Week 4 · Phantom limb</p>
              <div className="hero-float-card__weeks">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className={`hero-float-card__week ${i < 4 ? 'hero-float-card__week--done' : ''}`}
                  />
                ))}
              </div>
              <p className="hero-float-card__weeks-label">4 of 8 weeks complete</p>
            </div>
          </div>

          {/* Pain Score card — bottom right */}
          <div className="hero-float-card hero-float-card--pain">
            <div className="hero-float-card__pain-header">
              <span className="hero-float-card__pain-label">PAIN SCORE</span>
              <DownTrendIcon />
            </div>
            <p className="hero-float-card__pain-value">↓42%</p>
            <p className="hero-float-card__pain-sub">avg. after 4 weeks</p>
            <SparklineSVG />
          </div>

        </div>
      </div>
    </section>
  )
}

/* Two hands SVG — solid gray palm on left, teal outline on right */
function TwoHandsSVG() {
  return (
    <svg
      className="two-hands-svg"
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* === LEFT HAND (solid / gray — the physical hand) === */}
      <g className="hand-solid">
        {/* Palm */}
        <ellipse cx="145" cy="190" rx="52" ry="46" fill="#4a5568" />
        {/* Thumb */}
        <path
          d="M98 175 C88 158 86 138 90 120 C94 102 106 98 114 110 C119 120 116 145 110 168"
          fill="#4a5568" stroke="#4a5568" strokeWidth="2"
        />
        {/* Index */}
        <path
          d="M112 160 C108 138 110 112 114 85 C118 60 128 55 134 70 C138 85 136 118 132 152"
          fill="#4a5568" stroke="#4a5568" strokeWidth="2"
        />
        {/* Middle */}
        <path
          d="M137 156 C135 132 137 104 140 75 C143 50 153 46 158 62 C162 78 160 112 156 150"
          fill="#4a5568" stroke="#4a5568" strokeWidth="2"
        />
        {/* Ring */}
        <path
          d="M162 158 C162 135 164 108 166 82 C168 60 177 57 181 72 C184 87 182 118 178 154"
          fill="#4a5568" stroke="#4a5568" strokeWidth="2"
        />
        {/* Pinky */}
        <path
          d="M186 168 C187 148 188 128 188 110 C188 96 195 94 198 105 C200 116 199 140 196 165"
          fill="#4a5568" stroke="#4a5568" strokeWidth="2"
        />
      </g>

      {/* === RIGHT HAND (teal outline — the mirror/virtual hand) === */}
      <g className="hand-outline">
        {/* Palm */}
        <ellipse cx="285" cy="190" rx="52" ry="46" fill="none" stroke="#4ECDC4" strokeWidth="2" />
        {/* Thumb */}
        <path
          d="M238 175 C228 158 226 138 230 120 C234 102 246 98 254 110 C259 120 256 145 250 168"
          fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Index */}
        <path
          d="M252 160 C248 138 250 112 254 85 C258 60 268 55 274 70 C278 85 276 118 272 152"
          fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Middle */}
        <path
          d="M277 156 C275 132 277 104 280 75 C283 50 293 46 298 62 C302 78 300 112 296 150"
          fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Ring */}
        <path
          d="M302 158 C302 135 304 108 306 82 C308 60 317 57 321 72 C324 87 322 118 318 154"
          fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Pinky */}
        <path
          d="M326 168 C327 148 328 128 328 110 C328 96 335 94 338 105 C340 116 339 140 336 165"
          fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

/* Downward trend icon for pain score */
function DownTrendIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <path d="M2 3L8 9L13 5L20 12" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H20V7" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Pain sparkline — curved downward */
function SparklineSVG() {
  return (
    <svg
      className="hero-float-card__sparkline"
      viewBox="0 0 140 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 8 C20 8 30 14 50 22 C70 30 90 38 110 42 C125 45 135 46 140 46"
        stroke="#4ECDC4"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0 8 C20 8 30 14 50 22 C70 30 90 38 110 42 C125 45 135 46 140 46 L140 50 L0 50Z"
        fill="#4ECDC4"
        opacity="0.1"
      />
    </svg>
  )
}
