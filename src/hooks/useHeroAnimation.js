import { useEffect } from 'react'
import { gsap } from 'gsap'

/**
 * Hero entrance timeline — runs once on mount.
 * Gated behind the `preloader:done` event so animations only
 * start after the curtain has fully left the viewport.
 */
export function useHeroAnimation() {
  useEffect(() => {
    // Abort if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // ── Pre-hide all hero elements immediately so they don't flash ──
    const ctx = gsap.context(() => {
      gsap.set('.hero__label', { y: 20, opacity: 0 })
      gsap.set('.hero__desc', { y: 30, opacity: 0 })
      gsap.set('.hero__actions', { y: 24, opacity: 0 })
      gsap.set('.hero__badges', { y: 16, opacity: 0 })
      gsap.set('.hero-main-card', { y: 60, x: 30, opacity: 0, rotate: -8 })
      gsap.set('.hero-pill-card--completed', { x: -40, opacity: 0, scale: 0.9 })
      gsap.set('.hero-float-card--patient', { y: 50, x: -20, opacity: 0 })
      gsap.set('.hero-float-card--pain', { y: 50, x: 20, opacity: 0 })
      gsap.set('.hero-main-card__joints-pill', { x: 20, opacity: 0 })
      // progress bar starts empty
      gsap.set('.hero-main-card__progress-fill', { width: '0%' })
    })

    function runAnimation() {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // ── LEFT CONTENT ──────────────────────────────────────────
      tl.to('.hero__label', { y: 0, opacity: 1, duration: 0.6 })
        .to('.hero__desc', { y: 0, opacity: 1, duration: 0.6 }, '+=0.2')
        .to('.hero__actions', { y: 0, opacity: 1, duration: 0.55 }, '-=0.35')
        .to('.hero__badges', { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')

      // ── RIGHT VISUAL — main card ──────────────────────────────
      tl.to('.hero-main-card', {
        y: 0, x: 0, opacity: 1, rotate: -4,
        duration: 0.9, ease: 'power2.out',
      }, '-=0.6')

      // ── SESSION COMPLETE pill ─────────────────────────────────
      tl.to('.hero-pill-card--completed', {
        x: 0, opacity: 1, scale: 1,
        duration: 0.6, ease: 'back.out(1.4)',
      }, '-=0.4')

      // ── FLOAT CARDS ───────────────────────────────────────────
      tl.to('.hero-float-card--patient', {
        y: 0, x: 0, opacity: 1, duration: 0.65, ease: 'power2.out',
      }, '-=0.3')
        .to('.hero-float-card--pain', {
          y: 0, x: 0, opacity: 1, duration: 0.65, ease: 'power2.out',
        }, '-=0.5')

      // ── JOINTS TRACKED pill ───────────────────────────────────
      tl.to('.hero-main-card__joints-pill', {
        x: 0, opacity: 1, duration: 0.5,
      }, '-=0.6')

      // ── PROGRESS BAR fill (3/8 = 37.5%) ─────────────────────
      // Slight delay after card is visible, elastic overshoot for life
      tl.to('.hero-main-card__progress-fill', {
        width: '37.5%',
        duration: 1.1,
        ease: 'elastic.out(1, 0.6)',
      }, '-=0.2')
    }

    // Wait for the preloader curtain to fully lift before starting
    window.addEventListener('preloader:done', runAnimation, { once: true })

    return () => {
      ctx.revert()
      window.removeEventListener('preloader:done', runAnimation)
    }
  }, [])
}
