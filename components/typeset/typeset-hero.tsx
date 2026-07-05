"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaygroundLink } from "@/components/playground-link"
import { useMagnetic } from "@/lib/motion/hooks"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"
import { KineticWeightText } from "./kinetic-weight-text"

interface HeroProps {
  stats: { components: number; themes: number; requests: number }
}

/**
 * TYPESET hero — an editorial masthead. A giant variable-weight wordmark ripples
 * its weight toward the cursor (the signature); the type is real, readable DOM.
 * Entrance lines clip-rise on load; reduced motion shows them at rest.
 */
export function TypesetHero({ stats }: HeroProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const magneticRef = useMagnetic<HTMLDivElement>(0.4)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-rise]", {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        ease: "expo",
        stagger: 0.1,
      })
      gsap.from("[data-fade]", { opacity: 0, y: 16, duration: 0.7, ease: "expo", stagger: 0.08, delay: 0.5 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative w-full px-4 pb-16 pt-28 md:pt-36">
      <div className="container mx-auto max-w-6xl">
        {/* Masthead */}
        <div data-fade className="ed-mono flex flex-wrap items-center justify-between gap-2 pb-4 text-muted-foreground">
          <span>Issue 01 — Component Types</span>
          <span className="text-type-accent">Miguel Lourenço</span>
          <span className="hidden sm:inline">Est. 2026</span>
        </div>
        <div className="ed-rule" />

        {/* Giant kinetic wordmark */}
        <h1 className="mt-8 md:mt-14">
          <span className="block overflow-hidden">
            <span data-rise className="t-giant block">
              <KineticWeightText text="Components," />
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-rise className="t-giant block text-type-accent">
              <KineticWeightText text="typeset." baseWeight={500} />
            </span>
          </span>
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-12 md:items-end">
          <p data-fade className="max-w-md text-lg text-muted-foreground md:col-span-7 md:text-xl">
            A component library set like an editorial — oversized type, live React + TypeScript parts you
            can operate and paste, and AI agents proposing new ones over MCP.
          </p>

          <div data-fade className="flex flex-col items-start gap-4 sm:flex-row md:col-span-5 md:justify-end">
            <div ref={magneticRef} className="w-fit">
              <Button size="lg" asChild className="glow-primary w-fit">
                <Link href="/components">
                  Browse Components <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
            <PlaygroundLink size="lg" variant="ghost" className="w-fit">
              Open Playground
            </PlaygroundLink>
          </div>
        </div>

        {/* Masthead stat row */}
        <div data-fade className="mt-14 grid grid-cols-3 gap-4 border-t border-[hsl(var(--ed-rule))] pt-6">
          {[
            { v: stats.components, l: "Components" },
            { v: stats.themes, l: "Themes" },
            { v: stats.requests, l: "Agent requests" },
          ].map((s) => (
            <div key={s.l}>
              <span className="text-display text-3xl font-bold tabular-nums md:text-4xl">{s.v}</span>
              <span className="ed-mono ml-2 text-muted-foreground">{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
