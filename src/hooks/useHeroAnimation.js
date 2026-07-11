import { useEffect } from 'react'
import { gsap } from 'gsap'

/**
 * Hero entrance timeline — runs once on mount.
 * Animates the left content staggered, then the visual cards flying in.
 */
export function useHeroAnimation() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Abort if user prefers reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // ── LEFT CONTENT ──────────────────────────────────────────
      gsap.set('.hero__label', { y: 20, opacity: 0 })
      gsap.set('.hero__heading', { y: 40, opacity: 0 })
      gsap.set('.hero__desc', { y: 30, opacity: 0 })
      gsap.set('.hero__actions', { y: 24, opacity: 0 })
      gsap.set('.hero__badges', { y: 16, opacity: 0 })

      tl.to('.hero__label',   { y: 0, opacity: 1, duration: 0.6 })
        .to('.hero__heading', { y: 0, opacity: 1, duration: 0.75 }, '-=0.35')
        .to('.hero__desc',    { y: 0, opacity: 1, duration: 0.6  }, '-=0.45')
        .to('.hero__actions', { y: 0, opacity: 1, duration: 0.55 }, '-=0.35')
        .to('.hero__badges',  { y: 0, opacity: 1, duration: 0.5  }, '-=0.3')

      // ── RIGHT VISUAL — main card ──────────────────────────────
      gsap.set('.hero-main-card', { y: 60, x: 30, opacity: 0, rotate: -8 })
      tl.to('.hero-main-card', {
        y: 0, x: 0, opacity: 1, rotate: -4,
        duration: 0.9, ease: 'power2.out',
      }, '-=0.6')

      // ── SESSION COMPLETE pill ─────────────────────────────────
      gsap.set('.hero-pill-card--completed', { x: -40, opacity: 0, scale: 0.9 })
      tl.to('.hero-pill-card--completed', {
        x: 0, opacity: 1, scale: 1,
        duration: 0.6, ease: 'back.out(1.4)',
      }, '-=0.4')

      // ── FLOAT CARDS ───────────────────────────────────────────
      gsap.set('.hero-float-card--patient', { y: 50, x: -20, opacity: 0 })
      gsap.set('.hero-float-card--pain',    { y: 50, x: 20,  opacity: 0 })

      tl.to('.hero-float-card--patient', {
        y: 0, x: 0, opacity: 1, duration: 0.65, ease: 'power2.out',
      }, '-=0.3')
        .to('.hero-float-card--pain', {
          y: 0, x: 0, opacity: 1, duration: 0.65, ease: 'power2.out',
        }, '-=0.5')

      // ── JOINTS TRACKED pill ───────────────────────────────────
      gsap.set('.hero-main-card__joints-pill', { x: 20, opacity: 0 })
      tl.to('.hero-main-card__joints-pill', {
        x: 0, opacity: 1, duration: 0.5,
      }, '-=0.6')

    }) // gsap.context auto-scopes to DOM

    return () => ctx.revert()
  }, [])
}
