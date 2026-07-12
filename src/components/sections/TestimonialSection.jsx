import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../../styles/sections/TestimonialSection.css'
import TextType from '../reactbits/TextType'

gsap.registerPlugin(ScrollTrigger)

const PAIN_DATA = [
  { week: 'Week 1', score: '8/10', pct: 80 },
  { week: 'Week 2', score: '7/10', pct: 70 },
  { week: 'Week 4', score: '5/10', pct: 50 },
  { week: 'Week 6', score: '3/10', pct: 30 },
  { week: 'Week 8', score: '2/10', pct: 20 },
]

const QUOTES = [
  '"After 12 years of phantom pain, I had my first pain-free morning three weeks into my VISENSA programme."',
  '"I was sceptical at first. By week four, my occupational therapist was asking me what I was doing differently."',
  '"No hardware. No clinic visits. Just real progress — from my living room."',
]

export default function TestimonialSection() {
  // ── animated bar widths ────────────────────────────────────────────
  const [animated, setAnimated]   = useState(false)
  const chartRef                  = useRef(null)
  const cardRef                   = useRef(null)

  // ── Scroll trigger: run bars from 0 → target width ───────────────
  useEffect(() => {
    if (!chartRef.current) return

    // Reset all bars to 0 so they animate in on scroll
    gsap.set('.pain-chart__bar', { width: 0 })

    const trigger = ScrollTrigger.create({
      trigger: chartRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        setAnimated(true)
        PAIN_DATA.forEach((row, i) => {
          gsap.to(`.pain-chart__bar--${i}`, {
            width: `${row.pct}%`,
            duration: 1.1,
            delay: i * 0.12,
            ease: 'power3.out',
          })
        })
      },
    })

    return () => trigger.kill()
  }, [])

  // ── Tilt on hover (mouse tracking) ────────────────────────────────
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    function onMove(e) {
      const rect = card.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      const dx   = (e.clientX - cx) / (rect.width  / 2) // -1 … 1
      const dy   = (e.clientY - cy) / (rect.height / 2)

      gsap.to(card, {
        rotateY:  dx * 8,
        rotateX: -dy * 8,
        scale:    1.02,
        duration: 0.35,
        ease:     'power2.out',
        transformPerspective: 900,
        transformOrigin:      'center center',
      })
    }

    function onLeave() {
      gsap.to(card, {
        rotateY: 0, rotateX: 0, scale: 1,
        duration: 0.55, ease: 'power3.out',
      })
    }

    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section className="testimonial" id="testimonial">
      <div className="testimonial__container container">

        {/* ── Quote Side ──────────────────────────────────────────── */}
        <div className="testimonial__quote-side">
          <p className="mono-label">Patient story</p>

          <blockquote className="testimonial__quote">
            <TextType
              text={QUOTES}
              as="span"
              typingSpeed={28}
              deletingSpeed={14}
              pauseDuration={3200}
              initialDelay={400}
              showCursor={true}
              cursorCharacter="|"
              cursorClassName="testimonial__cursor"
              variableSpeed={{ min: 18, max: 40 }}
            />
          </blockquote>

          <div className="testimonial__author">
            <div className="testimonial__avatar">R</div>
            <div className="testimonial__author-info">
              <span className="testimonial__author-name">Robert M.</span>
              <span className="testimonial__author-desc">Above-elbow amputee · 8 weeks on programme</span>
            </div>
          </div>
        </div>

        {/* ── Chart Side ──────────────────────────────────────────── */}
        <div
          className="testimonial__chart-side"
          ref={cardRef}
          style={{ willChange: 'transform' }}
        >
          <p className="mono-label">Robert's pain journey</p>

          <div className="pain-chart" ref={chartRef}>
            {PAIN_DATA.map((row, i) => (
              <div key={i} className="pain-chart__row">
                <span className="pain-chart__week">{row.week}</span>
                <div className="pain-chart__bar-wrap">
                  {/* Bar starts at 0, GSAP animates it to pct on scroll */}
                  <div
                    className={`pain-chart__bar pain-chart__bar--${i}`}
                    style={{ width: 0 }}
                  />
                </div>
                <span className="pain-chart__score">{row.score}</span>
              </div>
            ))}
          </div>

          <div className="testimonial__result">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 12V6M12 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Pain reduced from <strong>8/10 &rarr; 2/10</strong> over 8 weeks</span>
          </div>
        </div>

      </div>
    </section>
  )
}
