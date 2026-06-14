"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion/gsap-setup"

interface KineticWeightTextProps {
  text: string
  className?: string
  /** Resting weight when the pointer is far / on touch / reduced-motion. */
  baseWeight?: number
  /** Peak weight directly under the cursor. */
  maxWeight?: number
  /** Pixel radius of the cursor's influence. */
  radius?: number
}

/**
 * The Typeset signature: each glyph's variable-font weight swells toward the
 * cursor, so the headline ripples as you move across it. The full string is the
 * accessible label; the per-letter spans are aria-hidden. On touch / reduced
 * motion it is a normal static heading.
 */
export function KineticWeightText({
  text,
  className,
  baseWeight = 420,
  maxWeight = 900,
  radius = 220,
}: KineticWeightTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || !hasFinePointer() || prefersReducedMotion()) return
    const letters = Array.from(root.querySelectorAll<HTMLElement>("[data-kl]"))
    let raf = 0
    let mx = -9999
    let my = -9999

    const apply = () => {
      raf = 0
      for (const el of letters) {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.hypot(cx - mx, cy - my)
        const t = Math.max(0, 1 - d / radius)
        const w = Math.round(baseWeight + (maxWeight - baseWeight) * (t * t))
        el.style.fontVariationSettings = `"wght" ${w}`
      }
    }
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!raf) raf = requestAnimationFrame(apply)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [baseWeight, maxWeight, radius])

  return (
    <span ref={ref} aria-label={text} className={className}>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} aria-hidden>
            {" "}
          </span>
        ) : (
          <span
            key={i}
            data-kl
            aria-hidden
            className={cn("kinetic-letter")}
            style={{ fontVariationSettings: `"wght" ${baseWeight}` }}
          >
            {ch}
          </span>
        )
      )}
    </span>
  )
}
