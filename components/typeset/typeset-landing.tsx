"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSmoothScroll } from "@/lib/motion/lenis-provider"
import { useSplitReveal } from "@/lib/motion/hooks"
import { ScrollTrigger, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"
import { TypesetHero } from "./typeset-hero"
import { BentoShowcase } from "./bento-showcase"
import { TypeMarquee } from "./type-marquee"
import { TypeBeat } from "./type-beat"
import { ThemesList } from "./themes-list"
import { Dispatch } from "./dispatch"

interface Props {
  stats: { components: number; themes: number; requests: number }
}

function Manifesto() {
  const ref = useSplitReveal<HTMLHeadingElement>({ by: "lines" })
  return (
    <section className="relative w-full px-4 py-24 md:py-36">
      <div className="container mx-auto max-w-5xl">
        <h2 ref={ref} className="t-display-2 leading-[1.05]">
          Most libraries hand you a grid of cards. This one is{" "}
          <span className="text-type-accent">set like a magazine</span> — type first, components live,
          code ready to lift.
        </h2>
      </div>
    </section>
  )
}

function Outro() {
  const ref = useSplitReveal<HTMLHeadingElement>({ by: "words" })
  return (
    <section className="relative w-full px-4 py-28 text-center md:py-40">
      <div className="container mx-auto max-w-4xl">
        <h2 ref={ref} className="t-giant">
          Now set yours.
        </h2>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild className="glow-primary w-fit">
            <Link href="/components">
              Browse Components <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button size="lg" variant="ghost" asChild className="w-fit">
            <Link href="/playground">Open Playground</Link>
          </Button>
        </div>
        <p className="ed-mono mt-14 text-muted-foreground">Typeset · Miguel Lourenço · 2026</p>
      </div>
    </section>
  )
}

/** Client orchestrator for the TYPESET landing. */
export function TypesetLanding({ stats }: Props) {
  useSmoothScroll(true)
  useEffect(() => {
    if (prefersReducedMotion()) return
    setupGsap()
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 500)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <TypesetHero stats={stats} />
      <TypeMarquee />
      <BentoShowcase />
      <Manifesto />
      <TypeBeat />
      <ThemesList />
      <Dispatch />
      <Outro />
    </>
  )
}
