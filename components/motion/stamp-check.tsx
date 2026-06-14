"use client"

import { useEffect, useRef } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"

interface StampCheckProps {
  name: string
  passed: boolean
  details?: string
  /** Seconds to wait after scroll-in before the stamp lands (sequential feel). */
  delay?: number
  className?: string
}

/**
 * A validation check that "stamps" PASS/FAIL when it scrolls into view — the
 * darkroom approval gesture. Shared by the landing Transmission climax and the
 * /requests detail view. Reduced motion renders the stamped state immediately.
 */
export function StampCheck({ name, passed, details, delay = 0, className }: StampCheckProps) {
  const stampRef = useRef<HTMLSpanElement | null>(null)
  const rowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const stamp = stampRef.current
    const row = rowRef.current
    if (!stamp || !row || prefersReducedMotion()) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.set(stamp, { scale: 2.4, opacity: 0, rotate: -12 })
      gsap.set(row, { opacity: 0.35 })
      gsap.to(stamp, {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 0.45,
        delay,
        ease: "back.out(2)",
        scrollTrigger: { trigger: row, start: "top 88%", once: true },
      })
      gsap.to(row, {
        opacity: 1,
        duration: 0.3,
        delay,
        scrollTrigger: { trigger: row, start: "top 88%", once: true },
      })
    }, row)
    return () => ctx.revert()
  }, [delay])

  return (
    <div
      ref={rowRef}
      className={cn(
        "flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0",
        className
      )}
    >
      <div className="flex min-w-0 flex-col">
        <span className="font-slate truncate text-sm text-foreground">{name}</span>
        {details ? <span className="truncate text-xs text-muted-foreground">{details}</span> : null}
      </div>
      <span
        ref={stampRef}
        className={cn(
          "font-slate inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.15em]",
          passed
            ? "border-[hsl(var(--exposure)/0.6)] text-[hsl(var(--exposure))] [box-shadow:0_0_18px_hsl(var(--exposure)/0.25)]"
            : "border-destructive/60 text-destructive"
        )}
      >
        {passed ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
        {passed ? "Pass" : "Fail"}
      </span>
    </div>
  )
}
