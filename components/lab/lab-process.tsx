"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowRight, FlaskConical } from "lucide-react"
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
 * The lab process: an agent-proposed "sample" arrives, its real validation
 * checks stamp PASS, and the proposed material is synthesized. All values are
 * real data from data/requests. Reduced motion shows it at rest.
 */
export function LabProcess() {
  const rootRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion() || !featured) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-stage]", {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "expo",
        stagger: 0.15,
        scrollTrigger: { trigger: root, start: "top 72%", once: true },
      })
      gsap.from("[data-divider]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "expo",
        scrollTrigger: { trigger: root, start: "top 70%", once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  if (!featured || !featuredVersion) return null
  const checks = featuredVersion.validation?.checks ?? []
  const dark = themePayload?.theme.colors.dark

  return (
    <section ref={rootRef} className="relative w-full px-4 py-24 md:py-32">
      <div aria-hidden className="lab-grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <span className="t-mono mb-4 inline-flex items-center gap-2 text-primary-accent">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden />
            Incoming sample · under validation
          </span>
          <h2 className="t-h1 font-semibold">New material arrives by agent.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            AI agents propose new components and themes over MCP. Each sample is validated against a real
            contract before it is synthesized into the library.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Stage 1 — proposal */}
          <div data-stage className="spec-card spec-corner relative p-6">
            <span className="t-mono text-muted-foreground">Stage 01 · Proposal</span>
            <div className="substance-divider my-4" data-divider />
            <dl className="space-y-2 font-mono text-xs leading-relaxed sm:text-sm">
              <div>
                <dt className="inline text-primary-accent">agent</dt>{" "}
                <dd className="inline text-foreground">{featuredVersion.authorAgent}</dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">propose</dt>{" "}
                <dd className="inline text-foreground">{featured.type.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">title</dt>{" "}
                <dd className="inline text-foreground">{featured.title}</dd>
              </div>
              <div className="text-muted-foreground">{featuredVersion.rationale}</div>
            </dl>
          </div>

          {/* Stage 2 — validation */}
          <div data-stage className="spec-card spec-corner relative p-6">
            <span className="t-mono text-muted-foreground">Stage 02 · Validation</span>
            <div className="substance-divider my-4" data-divider />
            <div>
              {checks.map((c, i) => (
                <StampCheck key={c.name} name={labelFor(c.name)} passed={c.passed} details={c.details} delay={0.12 * (i + 1)} />
              ))}
              <StampCheck name="Overall result" passed={featuredVersion.validation?.valid ?? true} delay={0.12 * (checks.length + 1)} />
            </div>
          </div>

          {/* Stage 3 — synthesized */}
          <div data-stage className="spec-card spec-corner relative flex flex-col p-6">
            <div className="flex items-center justify-between">
              <span className="t-mono text-muted-foreground">Stage 03 · Synthesized</span>
              <span className="t-mono text-primary-accent">{featured.status.replace("_", " ")}</span>
            </div>
            <div className="substance-divider my-4" data-divider />
            <h3 className="t-h2 font-semibold">{themePayload?.theme.name ?? featured.title}</h3>
            {dark ? (
              <div className="my-5 flex flex-wrap gap-2">
                {SWATCHES.map((k) =>
                  dark[k] ? (
                    <span
                      key={k}
                      title={k}
                      className="h-8 w-8 rounded-[4px] border border-white/10"
                      style={{ backgroundColor: dark[k] }}
                    />
                  ) : null
                )}
              </div>
            ) : null}
            {dark ? (
              <div
                className="mb-5 flex items-center justify-center rounded-[6px] py-4 text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${dark.primary}, ${dark.accent ?? dark.secondary})`, color: dark.background }}
              >
                {themePayload?.theme.name}
              </div>
            ) : null}
            <Button asChild className="mt-auto w-fit" variant="outline">
              <Link href="/requests">
                Review pipeline <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
