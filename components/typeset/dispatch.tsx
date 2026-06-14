"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StampCheck } from "@/components/motion/stamp-check"
import { REQUESTS } from "@/lib/requests/manifest-data"
import type { ThemeRequestPayload } from "@/lib/contracts"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"

function currentVersion(r: (typeof REQUESTS)[number]) {
  return r.versions.find((v) => v.id === r.currentVersionId) ?? r.versions[r.versions.length - 1]
}
const featured = REQUESTS.find((r) => currentVersion(r)?.payload.kind === "theme") ?? REQUESTS[0]
const featuredVersion = featured ? currentVersion(featured) : undefined
const themePayload =
  featuredVersion?.payload.kind === "theme" ? (featuredVersion.payload as ThemeRequestPayload) : undefined

const CHECK_LABELS: Record<string, string> = {
  "payload-kind": "Payload kind recognized",
  theme: "Theme schema valid",
  component: "Component schema valid",
  schema: "JSON schema conformant",
  files: "Proposed files present",
  preview: "Preview compiles",
}
const labelFor = (n: string) => CHECK_LABELS[n] ?? n
const SWATCHES = ["primary", "secondary", "accent", "background", "foreground", "muted", "border"] as const

/**
 * THE DISPATCH — the MCP story as a filed wire report. Real my-cv-agent proposal,
 * real RequestValidationResult.checks stamping PASS, the Portfolio theme set in
 * type. Scroll-driven; reduced motion shows it at rest.
 */
export function Dispatch() {
  const rootRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion() || !featured) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-dispatch]", {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: "expo",
        stagger: 0.12,
        scrollTrigger: { trigger: root, start: "top 74%", once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  if (!featured || !featuredVersion) return null
  const checks = featuredVersion.validation?.checks ?? []
  const dark = themePayload?.theme.colors.dark

  return (
    <section ref={rootRef} className="relative w-full px-4 py-24 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <div data-dispatch className="ed-mono flex items-center justify-between border-b border-[hsl(var(--ed-rule))] pb-4 text-muted-foreground">
          <span className="text-type-accent">The dispatch</span>
          <span>Filed by {featuredVersion.authorAgent} · over MCP</span>
        </div>

        <h2 data-dispatch className="t-display-2 mt-8 max-w-3xl">
          New components are <span className="text-type-accent">filed by agents</span>, set by contract.
        </h2>
        <p data-dispatch className="mt-4 max-w-xl text-lg text-muted-foreground">
          An AI agent proposes a component or theme over MCP. It is validated against a real contract,
          reviewed in-app, and only then set into the library.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-px border border-[hsl(var(--ed-rule))] bg-[hsl(var(--ed-rule))] lg:grid-cols-2">
          {/* Filed proposal + validation ledger */}
          <div data-dispatch className="bg-card p-6 md:p-8">
            <span className="ed-mono text-muted-foreground">Proposal · {featured.type.replace("_", " ")}</span>
            <h3 className="t-display-2 mt-2 text-2xl md:text-3xl">{featured.title}</h3>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">{featuredVersion.rationale}</p>
            <div className="mt-6 border-t border-[hsl(var(--ed-rule))] pt-2">
              {checks.map((c, i) => (
                <StampCheck key={c.name} name={labelFor(c.name)} passed={c.passed} details={c.details} delay={0.12 * (i + 1)} />
              ))}
              <StampCheck name="Overall result" passed={featuredVersion.validation?.valid ?? true} delay={0.12 * (checks.length + 1)} />
            </div>
          </div>

          {/* Materialized theme, set in type */}
          <div data-dispatch className="flex flex-col bg-card p-6 md:p-8">
            <div className="flex items-center justify-between">
              <span className="ed-mono text-muted-foreground">Set · {themePayload ? "theme" : "proposal"}</span>
              <span className="ed-mono text-type-accent">{featured.status.replace("_", " ")}</span>
            </div>
            <h3 className="t-display-2 mt-2 text-2xl md:text-3xl">{themePayload?.theme.name ?? featured.title}</h3>
            {dark ? (
              <div className="my-6 flex flex-wrap gap-2">
                {SWATCHES.map((k) =>
                  dark[k] ? (
                    <span key={k} title={k} className="h-9 w-9 rounded-[3px] border border-white/10" style={{ backgroundColor: dark[k] }} />
                  ) : null
                )}
              </div>
            ) : null}
            {dark ? (
              <div
                className="mb-6 flex items-center justify-center py-5 text-lg font-bold"
                style={{ background: `linear-gradient(135deg, ${dark.primary}, ${dark.accent ?? dark.secondary})`, color: dark.background }}
              >
                {themePayload?.theme.name}
              </div>
            ) : null}
            <Button asChild className="mt-auto w-fit" variant="outline">
              <Link href="/requests">
                Read the pipeline <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
