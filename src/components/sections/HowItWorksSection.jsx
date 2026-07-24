import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../../styles/sections/HowItWorksSection.css'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    num: '01',
    title: 'Open in your browser',
    desc: 'No download, no app store, no account for your first session. Works in Chrome or Edge on any laptop.',
    time: '~30 seconds',
    variant: 'blue'
  },
  {
    num: '02',
    title: 'Allow camera and calibrate',
    desc: 'Camera access is processed entirely on your device. Position your hand — AI finds your 21 joints in seconds.',
    time: '~2 minutes',
    variant: 'teal'
  },
  {
    num: '03',
    title: 'Begin your mirror therapy session',
    desc: 'Follow guided movements at your pace. The mirrored hand provides the visual feedback your brain needs to rewire.',
    time: '~12 minutes',
    variant: 'green'
  },
]

export default function HowItWorksSection() {
  const stepsRef = useRef(null)

  useEffect(() => {
    if (!stepsRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = stepsRef.current.querySelectorAll('.hiw__step')

    cards.forEach((card, i) => {
      const numEl   = card.querySelector('.step-card__num')
      const ripple  = card.querySelector('.step-card__ripple')

      // ── Card slide-in ────────────────────────────────────────────
      gsap.fromTo(card,
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1,
          duration: 0.65,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: { trigger: card, start: 'top 82%', once: true },
        }
      )

      // ── Number colour flash + ripple on card enter ────────────────
      ScrollTrigger.create({
        trigger: card,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          // 1. Number pops to accent colour then fades back
          const colors = ['#2563eb', '#00B8B0', '#4BA84E']
          gsap.timeline()
            .to(numEl, { color: colors[i], duration: 0.3, ease: 'power2.out' })
            .to(numEl, { color: 'rgba(0,0,0,0.06)', duration: 0.8, delay: 0.5, ease: 'power2.in' })

          // 2. Ripple circle expands and fades out
          if (ripple) {
            gsap.fromTo(ripple,
              { scale: 0.4, opacity: 0.6 },
              { scale: 2.8, opacity: 0, duration: 0.9, ease: 'power2.out',
                onComplete: () => gsap.set(ripple, { scale: 0.4, opacity: 0 }) }
            )
          }
        },
      })
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container container">
        {/* Header */}
        <div className="how-it-works__header">
          <div className="how-it-works__header-text">
            <p className="mono-label how-it-works__mono-label">YOUR FIRST SESSION</p>
            <h2 className="how-it-works__heading">
              From browser to therapy<br />in under 4 minutes.
            </h2>
          </div>
          <a href="#" className="how-it-works__cta" id="how-it-works-start-now">
            Start now
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Steps */}
        <div className="how-it-works__steps" ref={stepsRef}>
          {STEPS.map((step, i) => (
            <div key={i} className={`step-card step-card--${step.variant} hiw__step`}>

              {/* Step number with ripple overlay */}
              <div className="step-card__num-wrap">
                <div className="step-card__num">{step.num}</div>
                {/* Ripple circle — positioned relative to num-wrap */}
                <span className="step-card__ripple" aria-hidden="true" />
              </div>

              <div className="step-card__content">
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
              </div>
              <div className="step-card__time">
                <span className="step-card__time-label">{step.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
