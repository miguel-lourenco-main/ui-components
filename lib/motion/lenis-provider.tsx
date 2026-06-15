"use client"

/**
 * Landing-only smooth scroll. Lenis drives the page and feeds ScrollTrigger so
 * scrubbed beats stay in lockstep with the wheel.
 *
 * HARD RULES (see redesign blueprint):
 *  - NEVER mount on /playground (Monaco + react-resizable-panels need native scroll).
 *  - No-op under prefers-reduced-motion (native scroll, no hijack).
 *  - Touch devices keep native scroll feel (syncTouch off); Lenis still smooths wheel.
 *  - Tears everything down on unmount so client-side route changes leave no ticker leak.
 */
import { useEffect } from "react"
import Lenis from "lenis"
import { gsap, ScrollTrigger, setupGsap, prefersReducedMotion } from "./gsap-setup"

export function useSmoothScroll(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return
    if (prefersReducedMotion()) return // native scroll, no smoothing

    setupGsap()

    const lenis = new Lenis({
      duration: 1.1,
      // expo-out: fast impulse, soft settle — matches the app easing spine
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.5,
    })

    lenis.on("scroll", ScrollTrigger.update)

    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Re-measure once fonts + async previews settle (prevents pin-jump mismeasure).
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    const t = window.setTimeout(refresh, 600)

    return () => {
      window.clearTimeout(t)
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [enabled])
}

/** Component wrapper for the hook — wrap ONLY landing-route content. */
export function SmoothScroll({
  children,
  enabled = true,
}: {
  children: React.ReactNode
  enabled?: boolean
}) {
  useSmoothScroll(enabled)
  return <>{children}</>
}
