import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Reusable scroll-reveal: elements slide up + fade in, staggered.
 * @param {string} containerSelector  — wrapping element (scoped query root)
 * @param {string} itemSelector        — children to animate
 * @param {object} opts                — overrides
 */
export function useScrollReveal(containerSelector, itemSelector, opts = {}) {
  useEffect(() => {
    const containers = document.querySelectorAll(containerSelector)
    if (!containers.length) return

    const triggers = []

    containers.forEach((container) => {
      const items = container.querySelectorAll(itemSelector)
      if (!items.length) return

      gsap.set(items, { y: 40, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 82%',
          toggleActions: 'play none none none',
          ...opts.scrollTrigger,
        },
      })

      tl.to(items, {
        y: 0,
        opacity: 1,
        duration: opts.duration ?? 0.7,
        stagger: opts.stagger ?? 0.12,
        ease: opts.ease ?? 'power3.out',
      })

      triggers.push(tl.scrollTrigger)
    })

    return () => triggers.forEach((t) => t?.kill())
  }, [containerSelector, itemSelector])
}

/**
 * CountUp animation for numeric elements.
 * @param {string} selector — e.g. '.stat__value[data-count]'
 */
export function useCountUp(selector) {
  useEffect(() => {
    const els = document.querySelectorAll(selector)
    if (!els.length) return

    const triggers = []

    els.forEach((el) => {
      const target = parseFloat(el.dataset.count ?? el.textContent)
      const isDecimal = String(target).includes('.')
      const suffix = el.dataset.suffix ?? ''
      const prefix = el.dataset.prefix ?? ''

      gsap.set(el, { opacity: 0 })

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el, { opacity: 1, duration: 0.3 })
          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate() {
              el.textContent = prefix + (isDecimal
                ? this.targets()[0].val.toFixed(1)
                : Math.round(this.targets()[0].val)) + suffix
            },
          })
        },
      })
      triggers.push(st)
    })

    return () => triggers.forEach((t) => t?.kill())
  }, [selector])
}
