"use client"

import { useEffect, useRef, useState } from "react"
import { gsap, setupGsap, hasFinePointer, prefersReducedMotion } from "@/lib/motion/gsap-setup"

/**
 * Landing-only lab cursor: a soft substance ring that lerps toward the pointer
 * and dilates over interactive elements. Fine-pointer only; the native cursor
 * stays, keyboard users are unaffected.
 */
export function LabCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    const ring = ringRef.current
    if (!ring) return
    setupGsap()
    setActive(true)

    const xTo = gsap.quickTo(ring, "x", { duration: 0.4, ease: "expo" })
    const yTo = gsap.quickTo(ring, "y", { duration: 0.4, ease: "expo" })
    const sTo = gsap.quickTo(ring, "scale", { duration: 0.3, ease: "expo" })
    const oTo = gsap.quickTo(ring, "opacity", { duration: 0.3, ease: "power2" })

    let shown = false
    const onMove = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      if (!shown) {
        shown = true
        oTo(1)
      }
      const interactive = (e.target as HTMLElement)?.closest("a, button, [role='button'], input, textarea, select")
      sTo(interactive ? 2.2 : 1)
    }
    const onLeave = () => oTo(0)
    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      gsap.killTweensOf(ring)
    }
  }, [])

  if (!active) return null
  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] -ml-3.5 -mt-3.5 h-7 w-7 rounded-full border border-[hsl(var(--substance-1)/0.8)] opacity-0 mix-blend-screen [box-shadow:0_0_24px_hsl(var(--substance-1)/0.5)] will-change-transform"
    />
  )
}
