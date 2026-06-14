"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSmoothScroll } from "@/lib/motion/lenis-provider"
import { ScrollTrigger, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"
import { LabCursor } from "./lab-cursor"
import { MaterialLabHero } from "./material-lab-hero"
import { KineticHeading } from "./kinetic-heading"
import { SpecimenShowcase } from "./specimen-showcase"
import { SpectraRail } from "./spectra-rail"
import { LabProcess } from "./lab-process"

interface Props {
  stats: { components: number; themes: number; requests: number }
}

function Manifesto() {
  return (
    <section className="relative w-full px-4 py-24 md:py-36">
      <div className="container mx-auto max-w-5xl">
        <KineticHeading as="h2" by="lines" className="t-h1 font-semibold leading-[1.1]">
          UI is <span className="text-substance">grown from material</span>, not assembled from parts.
          Pour in the props and watch the component take shape.
        </KineticHeading>
      </div>
    </section>
  )
}

function CtaCoda() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-28 text-center md:py-40">
      <div aria-hidden className="substance-fallback pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="lab-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="container mx-auto max-w-3xl">
        <KineticHeading as="h2" by="words" className="t-hero font-bold">
          Enter the lab.
        </KineticHeading>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild className="glow-edge w-fit">
            <Link href="/playground">
              Open Playground <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button size="lg" variant="ghost" asChild className="w-fit">
            <Link href="/components">Browse Specimens</Link>
          </Button>
        </div>
        <p className="t-mono mt-14 text-muted-foreground">The Material Lab · Miguel Lourenço</p>
      </div>
    </section>
  )
}

/** Client orchestrator for THE MATERIAL LAB landing. */
export function MaterialLabLanding({ stats }: Props) {
  useSmoothScroll(true)
  useEffect(() => {
    if (prefersReducedMotion()) return
    setupGsap()
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 500)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <LabCursor />
      <MaterialLabHero stats={stats} />
      <Manifesto />
      <SpecimenShowcase />
      <SpectraRail />
      <LabProcess />
      <CtaCoda />
    </>
  )
}
