"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowUpRight, Plus } from "lucide-react"
import ThemedPreviewSurface from "@/components/themed-preview-surface"
import { themes } from "@/lib/themes"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"

/**
 * The themes as an editorial index — count driven by the live `themes` array
 * (built-ins + any user themes merged from data/themes/custom.json), so the
 * section scales as users add their own. Each row reveals on scroll and links to
 * its detail; a final row invites proposing a new theme through the agent
 * pipeline. The themed preview is the isolated ThemedPreviewSurface; GSAP only
 * animates the OUTER row, so the inline CSS-var isolation is intact.
 */
export function ThemesList() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-theme-row]", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "expo",
        stagger: 0.08,
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative w-full px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="ed-mono text-type-accent">The type families</span>
            <h2 className="t-display-2 mt-3">
              <span className="tabular-nums">{themes.length}</span> themes, one source.
            </h2>
          </div>
          <Link
            href="/themes"
            className="ed-mono text-type-accent outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
          >
            All themes →
          </Link>
        </div>

        <div ref={rootRef} className="border-t border-[hsl(var(--ed-rule))]">
          {themes.map((theme, i) => (
            <Link
              key={theme.id}
              href={`/themes?theme=${theme.id}`}
              data-theme-row
              className="group grid grid-cols-12 items-center gap-4 border-b border-[hsl(var(--ed-rule))] py-6 outline-none transition-colors hover:bg-secondary/30 focus-visible:bg-secondary/30"
            >
              <span className="ed-mono col-span-2 text-muted-foreground md:col-span-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-10 md:col-span-4">
                <h3 className="t-display-2 text-2xl md:text-3xl">{theme.name}</h3>
              </div>
              <p className="col-span-8 hidden text-sm text-muted-foreground md:col-span-4 md:block">
                {theme.description}
              </p>
              <div className="col-span-12 md:col-span-3">
                <div className="pointer-events-none flex items-center justify-between gap-3">
                  <ThemedPreviewSurface
                    themeId={theme.id}
                    component={"button" as never}
                    size="small"
                    mode="dark"
                    showModeToggle={false}
                    className="flex-1"
                    surfaceClassName="p-3"
                  />
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-type-accent" aria-hidden />
                </div>
              </div>
            </Link>
          ))}

          {/* Future: users set their own. Proposed over MCP, validated, then merged. */}
          <Link
            href="/requests"
            data-theme-row
            className="group grid grid-cols-12 items-center gap-4 border-b border-dashed border-[hsl(var(--type-accent)/0.4)] py-6 outline-none transition-colors hover:bg-secondary/30 focus-visible:bg-secondary/30"
          >
            <span className="ed-mono col-span-2 text-type-accent md:col-span-1" aria-hidden>
              <Plus className="h-4 w-4" />
            </span>
            <div className="col-span-10 md:col-span-4">
              <h3 className="t-display-2 text-2xl text-type-accent md:text-3xl">Bring your own</h3>
            </div>
            <p className="col-span-8 hidden text-sm text-muted-foreground md:col-span-4 md:block">
              Propose a theme over MCP — it&rsquo;s validated against the contract, reviewed, then set
              into the library alongside these.
            </p>
            <div className="col-span-12 md:col-span-3">
              <span className="ed-mono flex items-center justify-end gap-2 text-type-accent transition-opacity group-hover:opacity-80">
                Open the pipeline
                <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
