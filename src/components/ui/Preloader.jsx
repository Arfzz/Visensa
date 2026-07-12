import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './Preloader.css'

const words = [
  'Halo',       // Indonesia
  'Hello',      // Inggris
  'Bonjour',    // Prancis
  'Ciao',       // Italia
  '안녕하세요',  // Korea
  '你好',       // China
  'こんにちは', // Jepang
  'Привет',     // Rusia
]

const colors = [
  '#ffffff',   // white       — Halo
  '#CDDC28',   // lime        — Hello
  '#0d1a14',   // forest dark — Bonjour
  '#fff5c0',   // warm cream  — Ciao
  '#b2f5ea',   // mint        — 안녕하세요
  '#ffd166',   // amber       — 你好
  '#f4a261',   // peach       — こんにちは
  '#a8dadc',   // sky blue    — Привет
]

export default function Preloader() {
  const [index, setIndex]       = useState(0)
  const [visible, setVisible]   = useState(true)
  const overlayRef              = useRef(null)
  const wordRef                 = useRef(null)

  // ── cycle words ────────────────────────────────────────────────────
  useEffect(() => {
    if (index === words.length - 1) {
      // Hold the last word briefly, then trigger exit
      const t = setTimeout(() => exitPreloader(), 500)
      return () => clearTimeout(t)
    }

    const interval = setInterval(() => {
      // Slide old word up → swap text → slide new word in
      gsap.to(wordRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setIndex((prev) => prev + 1)
          gsap.fromTo(
            wordRef.current,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
          )
        },
      })
    }, 300)

    return () => clearInterval(interval)
  }, [index])

  // ── lock scroll while visible ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [visible])

  // ── curtain exit (slide up) ────────────────────────────────────────
  function exitPreloader() {
    gsap.to(overlayRef.current, {
      yPercent: -100,
      duration: 0.85,
      ease: 'power4.inOut',
      delay: 0.15,
      onComplete: () => {
        setVisible(false)
        // Signal to the rest of the app that the preloader is fully gone
        window.dispatchEvent(new CustomEvent('preloader:done'))
      },
    })
  }

  if (!visible) return null

  return (
    <div className="preloader" ref={overlayRef}>
      <div className="preloader__clip">
        <p
          ref={wordRef}
          className="preloader__word"
          style={{ color: colors[index] }}
        >
          {words[index]}
          <span className="preloader__dot">.</span>
        </p>
      </div>

      {/* subtle animated progress bar at bottom */}
      <div className="preloader__bar">
        <div
          className="preloader__bar-fill"
          style={{
            width: `${((index + 1) / words.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
