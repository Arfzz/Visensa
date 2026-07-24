import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../../styles/ui/StatsBar.css'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { from: 0, to: 94,  format: (v) => `${Math.round(v)}%`,  label: 'Session completion rate' },
  { from: 0, to: 42,  format: (v) => `${Math.round(v)}%`,  label: 'Average pain reduction' },
  { from: 0, to: 200, format: (v) => `${Math.round(v)}+`,  label: 'Peer-reviewed studies' },
  { from: 0, to: 0,   format: ()  => '0',                   label: 'Hardware required' },
]

export default function StatsBar() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const items   = ref.current.querySelectorAll('.stats-bar__item')
    const triggers = []

    // Stagger-reveal the whole bar first, then count up each number
    const reveal = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        // Reveal items with stagger
        gsap.fromTo(items,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: 'power2.out' }
        )

        // Count each value up independently
        STATS.forEach((stat, i) => {
          if (stat.to === 0) return // "0 Hardware" stays at 0

          const valEl = items[i]?.querySelector('.stats-bar__value')
          if (!valEl) return

          const obj = { val: stat.from }
          gsap.to(obj, {
            val: stat.to,
            duration: 1.8,
            delay: i * 0.1,
            ease: 'power2.out',
            onUpdate() {
              valEl.textContent = stat.format(obj.val)
            },
            onComplete() {
              valEl.textContent = stat.format(stat.to)
            },
          })
        })
      },
    })

    triggers.push(reveal)
    return () => triggers.forEach((t) => t?.kill())
  }, [])

  return (
    <section className="stats-bar" id="stats" aria-label="Key statistics" ref={ref}>
      <div className="stats-bar__inner container">
        {STATS.map((stat, i) => (
          <div key={i} className="stats-bar__item" style={{ opacity: 0 }}>
            <span className="stats-bar__value">{stat.format(stat.from)}</span>
            <span className="stats-bar__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
