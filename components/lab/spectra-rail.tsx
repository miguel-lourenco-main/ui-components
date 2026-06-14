"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"
import ThemedPreviewSurface from "@/components/themed-preview-surface"
import { themes } from "@/lib/themes"
import { cardLinkClassName } from "@/components/glow-card"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"

/**
 * The six themes as calibrated "spectra". Each card wraps the existing isolated
 * ThemedPreviewSurface; GSAP only animates the OUTER frame, so the inline
 * computeThemeCssVars isolation is never touched.
 */
export function SpectraRail() {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-spectrum]", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "expo",
        stagger: 0.1,
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative w-full px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="t-mono text-primary-accent">Living spectra</span>
            <h2 className="t-h1 mt-3 max-w-xl font-semibold">One component, six calibrated looks.</h2>
          </div>
          <Link
            href="/themes"
            className="t-mono text-primary-accent outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
          >
            All spectra →
          </Link>
        </div>

        <div ref={rootRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, i) => (
            <Link key={theme.id} href={`/themes?theme=${theme.id}`} className={cardLinkClassName}>
              <div
                data-spectrum
                className="spec-card spec-corner group relative h-full p-5 transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-[hsl(var(--substance-1)/0.45)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="t-mono text-muted-foreground">
                    SPECTRUM-{String(i + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary-accent" aria-hidden />
                </div>
                <h3 className="t-h2 mb-1 font-semibold">{theme.name}</h3>
                <p className="mb-4 line-clamp-1 text-sm text-muted-foreground" title={theme.description}>
                  {theme.description}
                </p>
                <ThemedPreviewSurface
                  themeId={theme.id}
                  component={"button" as never}
                  size="medium"
                  mode="dark"
                  showModeToggle={false}
                  surfaceClassName="p-6"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
