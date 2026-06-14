"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMagnetic } from "@/lib/motion/hooks"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"
import { SubstanceFallback } from "./substance-fallback"
import { KineticHeading } from "./kinetic-heading"
import { StatRibbon } from "./stat-ribbon"

const MaterialLabCanvas = dynamic(() => import("./material-lab-canvas"), {
  ssr: false,
  loading: () => null,
})

function webglSupported(): boolean {
  try {
    const c = document.createElement("canvas")
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")))
  } catch {
    return false
  }
}

interface HeroProps {
  stats: { components: number; themes: number; requests: number }
}

/**
 * THE MATERIAL LAB hero. The substance canvas is layered behind a static
 * fallback gradient + blueprint grid, with kinetic type, CTAs and the stat
 * ribbon in front. Canvas mounts only when the device can afford it; the static
 * HTML headline is the LCP element and is always readable.
 */
export function MaterialLabHero({ stats }: HeroProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const magneticRef = useMagnetic<HTMLDivElement>(0.4)
  const [show3d, setShow3d] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const small = window.matchMedia("(max-width: 768px)").matches
    if (coarse || small || !webglSupported()) return
    setShow3d(true)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-eyebrow]", { y: 16, opacity: 0, duration: 0.7, ease: "expo", delay: 0.1 })
      gsap.from("[data-hero-sub]", { y: 18, opacity: 0, duration: 0.7, ease: "expo", delay: 0.55 })
      gsap.from("[data-hero-cta]", { y: 20, opacity: 0, duration: 0.7, ease: "expo", stagger: 0.08, delay: 0.7 })
      gsap.from("[data-hero-ribbon]", { y: 16, opacity: 0, duration: 0.7, ease: "expo", delay: 0.9 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden px-4 py-24"
    >
      <SubstanceFallback />
      {show3d ? <MaterialLabCanvas /> : null}
      {/* contrast guards: vertical top/bottom + a left scrim so the copy stays AA
          while the right side of the substance stays vivid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-background/10 to-background"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-background/25 to-transparent"
      />

      <div className="container relative mx-auto max-w-5xl">
        <span data-hero-eyebrow className="t-mono mb-6 inline-block text-primary-accent">
          The Material Lab · interactive component substance
        </span>

        <KineticHeading as="h1" by="words" className="t-hero max-w-4xl">
          Components, grown <span className="text-substance">from luminous material.</span>
        </KineticHeading>

        <p data-hero-sub className="mt-7 max-w-xl text-lg text-muted-foreground sm:text-xl">
          A living component library: drag, type, and theme real React + TypeScript parts — then watch
          AI agents propose new specimens over MCP.
        </p>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div data-hero-cta ref={magneticRef} className="w-fit">
            <Button size="lg" asChild className="glow-edge w-fit">
              <Link href="/components">
                Browse Specimens <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <div data-hero-cta className="w-fit">
            <Button size="lg" variant="ghost" asChild className="w-fit">
              <Link href="/playground">Open Playground</Link>
            </Button>
          </div>
        </div>

        <div data-hero-ribbon className="mt-14">
          <StatRibbon components={stats.components} themes={stats.themes} requests={stats.requests} />
        </div>
      </div>

      <div
        aria-hidden
        className="t-mono absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
      >
        Scroll to extract ↓
      </div>
    </section>
  )
}
