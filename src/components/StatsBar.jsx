import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './StatsBar.css'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { raw: 94, display: '94%',  suffix: '%', label: 'Session completion rate' },
  { raw: 42, display: '42%',  suffix: '%', label: 'Average pain reduction' },
  { raw: 200, display: '200+', suffix: '+', label: 'Peer-reviewed studies' },
  { raw: 0,  display: '0',    suffix: '',  label: 'Hardware required' },
]

export default function StatsBar() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const valueEls = ref.current.querySelectorAll('.stats-bar__value')
    const triggers = []

    valueEls.forEach((el, i) => {
      const stat = STATS[i]
      gsap.set(el, { opacity: 0, y: 16 })

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
          // Skip count-up for 0 and non-numeric
          if (stat.raw === 0 || isNaN(stat.raw)) return
          const obj = { val: 0 }
          gsap.to(obj, {
            val: stat.raw,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate() {
              el.textContent = Math.round(obj.val) + stat.suffix
            },
          })
        },
      })
      triggers.push(st)
    })

    return () => triggers.forEach((t) => t?.kill())
  }, [])

  return (
    <section className="stats-bar" id="stats" aria-label="Key statistics" ref={ref}>
      <div className="stats-bar__inner container">
        {STATS.map((stat, i) => (
          <div key={i} className="stats-bar__item">
            <span className="stats-bar__value">{stat.display}</span>
            <span className="stats-bar__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
