import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../../styles/sections/TrackingSection.css'

gsap.registerPlugin(ScrollTrigger)

export default function TrackingSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Dashboard card slides in from left
      gsap.fromTo('.dashboard-card',
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.dashboard-card', start: 'top 80%' },
        }
      )

      // Weekly card with slight delay + pop
      gsap.fromTo('.weekly-card',
        { x: -40, y: 20, opacity: 0, scale: 0.92 },
        {
          x: 0, y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.3)',
          scrollTrigger: { trigger: '.weekly-card', start: 'top 82%' },
          delay: 0.2,
        }
      )

      // Sparkline stroke draw animation
      const path = document.querySelector('.dashboard-sparkline path:first-child')
      if (path) {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(path, {
          strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.dashboard-card__chart', start: 'top 82%' },
        })
      }

      // Heading + desc slide in from right
      gsap.fromTo('.tracking__heading',
        { x: 40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.tracking__heading', start: 'top 82%' },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])


  const features = [
    'Pain score tracked before and after every session',
    'Weekly summary in plain English, not data tables',
    'Share a PDF report with your therapist in one tap',
    'All data stored locally — never leaves your device',
  ]

  return (
    <section className="tracking" id="tracking" ref={sectionRef}>
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
  const cardRef   = useRef(null)
  const score4Ref = useRef(null)

  useEffect(() => {
    if (!cardRef.current || !score4Ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const obj = { val: 8.0 }
    ScrollTrigger.create({
      trigger: cardRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: 4.0,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() {
            if (score4Ref.current)
              score4Ref.current.textContent = obj.val.toFixed(1)
          },
          onComplete() {
            if (score4Ref.current) score4Ref.current.textContent = '4.0'
          },
        })
      },
    })
  }, [])

  return (
    <div className="dashboard-card" ref={cardRef}>
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
          {/* Score starts at 8.0, GSAP counts it down to 4.0 */}
          <span
            ref={score4Ref}
            className="dashboard-card__week-val"
            style={{ color: '#00B8B0' }}
          >
            8.0
          </span>
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
