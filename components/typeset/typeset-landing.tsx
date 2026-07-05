"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaygroundLink } from "@/components/playground-link"
import { useSmoothScroll } from "@/lib/motion/lenis-provider"
import { useSplitReveal } from "@/lib/motion/hooks"
import { ScrollTrigger, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"
import { TypesetHero } from "./typeset-hero"
import { BentoShowcase } from "./bento-showcase"
import { ThemesList } from "./themes-list"
import { Transmission } from "./transmission"

interface Props {
  stats: { components: number; themes: number; requests: number }
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
          <PlaygroundLink size="lg" variant="ghost" className="w-fit">
            Open Playground
          </PlaygroundLink>
        </div>
        <p className="ed-mono mt-14 text-muted-foreground">Typeset · Miguel Lourenço · 2026</p>
      </div>
    </section>
  )
}

/**
 * Client orchestrator for the merged TYPESET landing. A tight five-beat
 * narrative: masthead hero → live components you can operate → themes (yours
 * included) → the agent pipeline → call to action. Each beat owns its own
 * scroll animation and degrades to a static, readable state under reduced motion.
 */
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
      <BentoShowcase />
      <ThemesList />
      <Transmission />
      <Outro />
    </>
  )
}
