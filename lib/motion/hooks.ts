"use client"

/**
 * Reusable motion primitives shared across all redesign directions.
 * Every hook is SSR-safe, cleans up its GSAP/ScrollTrigger instances on unmount,
 * and degrades to a static final state under prefers-reduced-motion.
 */
import { useEffect, useRef } from "react"
import SplitType from "split-type"
import { gsap, ScrollTrigger, setupGsap, prefersReducedMotion, hasFinePointer } from "./gsap-setup"

/**
 * Magnetic pull toward the cursor. Fine-pointer only; real focus/hover states
 * live underneath so keyboard users are unaffected.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.4) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return
    setupGsap()
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "expo" })
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "expo" })

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const relX = e.clientX - (r.left + r.width / 2)
      const relY = e.clientY - (r.top + r.height / 2)
      xTo(relX * strength)
      yTo(relY * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
      gsap.killTweensOf(el)
    }
  }, [strength])
  return ref
}

/**
 * Count a number up from `from` to `target` when it scrolls into view.
 * Writes to textContent so the value stays real DOM (a11y + SEO).
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(
  target: number,
  { from = 0, duration = 1.6, format }: { from?: number; duration?: number; format?: (n: number) => string } = {}
) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const render = (n: number) => {
      el.textContent = format ? format(n) : String(Math.round(n))
    }
    if (prefersReducedMotion()) {
      render(target)
      return
    }
    setupGsap()
    const obj = { v: from }
    // Leave the SSR'd final value in place until the trigger actually fires, so
    // the number is never stuck at `from` if the trigger is missed.
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        render(from)
        gsap.to(obj, {
          v: target,
          duration,
          ease: "expo",
          onUpdate: () => render(obj.v),
        })
      },
    })
    return () => st.kill()
  }, [target, from, duration, format])
  return ref
}

type SplitBy = "chars" | "words" | "lines"

/**
 * Kinetic text reveal. Splits the element post-mount (so static HTML stays
 * semantic), preserves the full string as aria-label, then staggers the pieces
 * up from behind a clipped edge on scroll-in. Reduced-motion: no animation.
 */
export function useSplitReveal<T extends HTMLElement = HTMLElement>(
  { by = "lines", stagger, start = "top 80%", y = "110%", duration = 0.9, delay = 0 }: {
    by?: SplitBy
    stagger?: number
    start?: string
    y?: string
    duration?: number
    delay?: number
  } = {}
) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", el.textContent ?? "")

    if (prefersReducedMotion()) return

    setupGsap()
    const split = new SplitType(el, { types: by === "chars" ? "chars,words" : by, tagName: "span" })
    const targets = (by === "chars" ? split.chars : by === "words" ? split.words : split.lines) ?? []
    // Clip each line/word so pieces slide in from behind an edge.
    const wrappers = by === "lines" ? split.lines : null
    wrappers?.forEach((l) => (l.style.overflow = "hidden"))

    const step = stagger ?? (by === "chars" ? 0.012 : by === "words" ? 0.04 : 0.08)
    const tween = gsap.from(targets, {
      yPercent: parseFloat(y),
      opacity: 0,
      duration,
      delay,
      ease: "expo",
      stagger: step,
      scrollTrigger: { trigger: el, start, once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      split.revert()
    }
  }, [by, stagger, start, y, duration, delay])
  return ref
}

/**
 * Generic fade/rise-in on scroll for a single element (GSAP equivalent of the
 * existing FadeIn, used when a section already lives inside the GSAP context).
 */
export function useRevealIn<T extends HTMLElement = HTMLElement>(
  { y = 28, duration = 0.8, start = "top 85%", delay = 0 }: { y?: number; duration?: number; start?: string; delay?: number } = {}
) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    setupGsap()
    const tween = gsap.from(el, {
      y,
      opacity: 0,
      duration,
      delay,
      ease: "expo",
      scrollTrigger: { trigger: el, start, once: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [y, duration, start, delay])
  return ref
}
