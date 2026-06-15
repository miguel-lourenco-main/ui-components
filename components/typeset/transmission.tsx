"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowRight, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StampCheck } from "@/components/motion/stamp-check"
import { REQUESTS } from "@/lib/requests/manifest-data"
import type { ThemeRequestPayload } from "@/lib/contracts"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"

/** Resolve the current (or last) version of a request without Array.prototype.at. */
function currentVersion(r: (typeof REQUESTS)[number]) {
  return r.versions.find((v) => v.id === r.currentVersionId) ?? r.versions[r.versions.length - 1]
}

/** Pick a theme proposal (richest "materialize" payload), else the newest request. */
const featured = REQUESTS.find((r) => currentVersion(r)?.payload.kind === "theme") ?? REQUESTS[0]
const featuredVersion = featured ? currentVersion(featured) : undefined
const themePayload =
  featuredVersion?.payload.kind === "theme" ? (featuredVersion.payload as ThemeRequestPayload) : undefined

/** Humanize raw validation check names into review-desk language (presentation only). */
const CHECK_LABELS: Record<string, string> = {
  "payload-kind": "Payload kind recognized",
  theme: "Theme schema valid",
  component: "Component schema valid",
  schema: "JSON schema conformant",
  "schema.invalid": "JSON schema conformant",
  files: "Proposed files present",
  "path.traversal": "No path traversal",
  preview: "Preview compiles",
}
const labelFor = (name: string) => CHECK_LABELS[name] ?? name

const SWATCH_KEYS = ["primary", "secondary", "accent", "background", "foreground", "muted", "border"] as const

/**
 * THE TRANSMISSION — the climax, set in editorial type. An AI agent proposal
 * arrives over MCP, its real validation checks stamp PASS one by one, and the
 * proposed theme is set on the worktable. Every value is real data from
 * data/requests. Scroll-driven (not pinned) so it never fights resize/mobile;
 * reduced motion shows it at rest.
 */
export function Transmission() {
  const rootRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion() || !featured) return
    setupGsap()
    const ctx = gsap.context(() => {
      // Transmission lines print sequentially.
      gsap.from("[data-tx-line]", {
        opacity: 0,
        x: -10,
        duration: 0.4,
        stagger: 0.18,
        ease: "power2.out",
        scrollTrigger: { trigger: "[data-tx-terminal]", start: "top 78%", once: true },
      })
      // The worktable sets the materialized theme in.
      gsap.from("[data-tx-worktable]", {
        opacity: 0,
        y: 36,
        duration: 1,
        ease: "expo",
        scrollTrigger: { trigger: "[data-tx-worktable]", start: "top 80%", once: true },
      })
      gsap.from("[data-tx-swatch]", {
        opacity: 0,
        scale: 0.6,
        duration: 0.5,
        stagger: 0.06,
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: "[data-tx-worktable]", start: "top 70%", once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  if (!featured || !featuredVersion) return null

  const checks = featuredVersion.validation?.checks ?? []
  const dark = themePayload?.theme.colors.dark

  return (
    <section ref={rootRef} className="relative w-full px-4 py-24 md:py-36">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <span className="ed-mono mb-4 inline-flex items-center gap-2 text-type-accent">
            <Radio className="h-3.5 w-3.5" aria-hidden />
            Incoming transmission
          </span>
          <h2 className="t-display-2">
            Components arrive <span className="text-type-accent">by agent.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            AI agents propose new components and themes over MCP. Each proposal is validated against a
            real contract, reviewed, and only then set into the library.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-[hsl(var(--ed-rule))] bg-[hsl(var(--ed-rule))] lg:grid-cols-2">
          {/* The terminal — the proposal prints in */}
          <div data-tx-terminal className="bg-card text-sm">
            <div className="flex items-center gap-1.5 border-b border-[hsl(var(--ed-rule))] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--type-accent)/0.7)]" />
              <span className="ed-mono ml-2 text-muted-foreground">mcp://component-registry</span>
            </div>
            <div className="space-y-1.5 px-5 py-5 font-mono text-xs leading-relaxed sm:text-sm">
              <p data-tx-line className="text-muted-foreground">
                <span className="text-type-accent">agent</span> :: {featuredVersion.authorAgent}
              </p>
              <p data-tx-line className="text-foreground">
                <span className="text-muted-foreground">$</span> propose {featured.type.replace("_", " ")}
              </p>
              <p data-tx-line className="text-foreground">
                <span className="text-muted-foreground">title</span> → {featured.title}
              </p>
              <p data-tx-line className="text-muted-foreground">
                <span className="text-muted-foreground">why</span> → {featuredVersion.rationale}
              </p>
              <p data-tx-line className="caret pt-2 text-type-accent">
                running validation
              </p>

              <div className="mt-3 border-t border-[hsl(var(--ed-rule))] pt-2">
                {checks.length > 0 ? (
                  checks.map((c, i) => (
                    <StampCheck
                      key={c.name}
                      name={labelFor(c.name)}
                      passed={c.passed}
                      details={c.details}
                      delay={0.15 * (i + 1)}
                    />
                  ))
                ) : (
                  <StampCheck name="Validation" passed={featuredVersion.validation?.valid ?? true} />
                )}
                <StampCheck
                  name="Overall result"
                  passed={featuredVersion.validation?.valid ?? true}
                  delay={0.15 * (checks.length + 1)}
                />
              </div>
            </div>
          </div>

          {/* The worktable — materialized proposal, set in type */}
          <div data-tx-worktable className="relative flex flex-col justify-between bg-card p-6 md:p-8">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="ed-mono text-muted-foreground">
                  {themePayload ? "Materialized theme" : "Materialized proposal"}
                </span>
                <span className="ed-mono text-type-accent">{featured.status.replace("_", " ")}</span>
              </div>
              <h3 className="t-display-2 text-2xl md:text-3xl">
                {themePayload?.theme.name ?? featured.title}
              </h3>
              {themePayload?.theme.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{themePayload.theme.description}</p>
              ) : null}
            </div>

            {dark ? (
              <div className="my-8 flex flex-wrap gap-3">
                {SWATCH_KEYS.map((key) =>
                  dark[key] ? (
                    <div key={key} data-tx-swatch className="flex flex-col items-center gap-1.5">
                      <span
                        className="h-12 w-12 rounded-[3px] border border-white/10"
                        style={{ backgroundColor: dark[key] }}
                      />
                      <span className="ed-mono text-[0.5rem] tracking-wider text-muted-foreground">
                        {key}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="my-8 border border-[hsl(var(--ed-rule))] bg-background/60 p-6 text-sm text-muted-foreground">
                {featured.type.replace("_", " ")} proposal ready for review.
              </div>
            )}

            {/* A sample swatch set in the proposed palette */}
            {dark ? (
              <div
                className="mb-6 flex items-center justify-center py-5 text-sm font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${dark.primary}, ${dark.accent ?? dark.secondary})`,
                  color: dark.background,
                }}
              >
                Sample · {themePayload?.theme.name}
              </div>
            ) : null}

            <Button asChild className="w-fit" variant="outline">
              <Link href="/requests">
                Review in the pipeline <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
