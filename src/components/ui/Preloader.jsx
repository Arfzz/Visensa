import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import TextType from '../reactbits/TextType'
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
  '#FFFFFF', // White
  '#FFD166', // Bright Yellow
  '#111111', // Almost Black
  '#FF6B6B', // Coral Red
  '#003F5C', // Deep Navy
  '#CDDC28', // Lime
  '#FFA600', // Orange
  '#a8dadc', // White for the last one
]

export default function Preloader() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [showVisensa, setShowVisensa] = useState(false)
  const overlayRef = useRef(null)
  const wordRef = useRef(null)

  // ── cycle words ────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return

    if (index === words.length - 1) {
      // Waktu untuk kata terakhir ("Привет")
      const t1 = setTimeout(() => {
        // Hilangkan kata terakhir
        gsap.to(wordRef.current, {
          y: -60,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            // Tampilkan tulisan Visensa
            setShowVisensa(true)
          }
        })
      }, 500)

      return () => clearTimeout(t1)
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
  }, [index, visible])

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

  // Effect to handle exit when Visensa TextType finishes typing
  // We will trigger this using a timeout after showVisensa becomes true
  useEffect(() => {
    if (showVisensa) {
      // Asumsikan TextType butuh sekitar 1-1.5 detik untuk ngetik "Visensa"
      const t = setTimeout(() => {
        exitPreloader()
      }, 1500) // Waktu tunggu TextType selesai + delay sebentar sebelum naik
      return () => clearTimeout(t)
    }
  }, [showVisensa])

  if (!visible) return null

  return (
    <div className="preloader" ref={overlayRef}>
      <div className="preloader__clip">
        {!showVisensa ? (
          <p
            ref={wordRef}
            className="preloader__word"
            style={{ color: colors[index] }}
          >
            {words[index]}
            <span className="preloader__dot">.</span>
          </p>
        ) : (
          <div style={{ color: "#FFFFFF", fontSize: "clamp(3rem, 10vw, 7rem)", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            <TextType
              text="Visensa."
              typingSpeed={100}
              showCursor={true}
              cursorCharacter="|"
              cursorBlinkDuration={0.5}
              loop={false}
            />
          </div>
        )}
      </div>

      {/* subtle animated progress bar at bottom */}
      <div className="preloader__bar">
        <div
          className="preloader__bar-fill"
          style={{
            width: showVisensa ? '100%' : `${((index + 1) / words.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
