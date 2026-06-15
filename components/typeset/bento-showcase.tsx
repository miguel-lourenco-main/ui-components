"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Check, Copy } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSplitReveal } from "@/lib/motion/hooks"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"

/** The affordance that says: this is real, operate it — not a screenshot. */
function LiveTag() {
  return (
    <span className="ed-mono inline-flex items-center gap-1.5 text-type-accent" aria-hidden>
      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--type-accent))]" />
      Live
    </span>
  )
}

function Tile({
  no,
  name,
  href,
  hint,
  className,
  children,
}: {
  no: string
  name: string
  href: string
  /** A short instruction telling the user what to do with this live component. */
  hint: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-bento
      className={cn(
        "group relative flex flex-col bg-card p-6 transition-colors duration-300 ease-out-expo hover:bg-secondary/40",
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="ed-mono flex items-center gap-3 text-muted-foreground">
          <span>
            {no} / {name}
          </span>
          <LiveTag />
        </span>
        <Link
          href={href}
          aria-label={`Open ${name}`}
          className="text-muted-foreground/60 outline-none transition-colors hover:text-type-accent focus-visible:text-type-accent"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
      <p className="ed-mono mt-5 text-muted-foreground/70">{hint}</p>
    </div>
  )
}

function InputTile() {
  const [text, setText] = useState("")
  return (
    <Tile no="01" name="Input" href="/components?component=input" hint="Type to set it" className="md:col-span-2 md:row-span-2">
      <p className="t-display-2 mb-6 break-words leading-[0.95]">
        {text ? text : <span className="t-outline">Set me.</span>}
      </p>
      <Input value={text} maxLength={18} onChange={(e) => setText(e.target.value)} placeholder="Type to typeset" />
    </Tile>
  )
}

function SliderTile() {
  const [v, setV] = useState(58)
  return (
    <Tile no="02" name="Slider" href="/components?component=slider" hint="Drag to reweight" className="md:col-span-2">
      <p
        className="text-display mb-5 text-6xl leading-none tabular-nums md:text-7xl"
        style={{ fontVariationSettings: `"wght" ${300 + Math.round(v * 6)}` }}
      >
        {v}
      </p>
      <Slider value={[v]} onValueChange={(val) => setV(val[0])} max={100} step={1} aria-label="Weight" />
    </Tile>
  )
}

function SwitchTile() {
  const [on, setOn] = useState(true)
  return (
    <Tile no="03" name="Switch" href="/components?component=switch" hint="Toggle the cut">
      <p
        className="text-display mb-5 text-5xl leading-none transition-all duration-500"
        style={{ fontStyle: on ? "italic" : "normal", fontVariationSettings: `"wght" ${on ? 800 : 300}` }}
      >
        Aa
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{on ? "Bold italic" : "Light roman"}</span>
        <Switch checked={on} onCheckedChange={setOn} aria-label="Toggle weight" />
      </div>
    </Tile>
  )
}

const SNIPPET = `<Button>Browse</Button>`
function ButtonTile() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  return (
    <Tile no="04" name="Button" href="/components?component=button" hint="Copy the snippet">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm">Default</Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
      </div>
      <button
        onClick={copy}
        className="ed-mono flex items-center justify-between gap-3 border border-[hsl(var(--ed-rule))] px-3 py-2 text-left text-muted-foreground outline-none transition-colors hover:border-[hsl(var(--type-accent)/0.5)] hover:text-foreground"
        aria-label="Copy snippet"
      >
        <code className="truncate normal-case tracking-normal">{SNIPPET}</code>
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-type-accent" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
        )}
      </button>
    </Tile>
  )
}

/** Editorial bento where each cell is a real, operable component. */
export function BentoShowcase() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const headingRef = useSplitReveal<HTMLHeadingElement>({ by: "lines" })
  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-bento]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "expo",
        stagger: 0.08,
        scrollTrigger: { trigger: root, start: "top 75%", once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative w-full px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="ed-mono text-type-accent">Live specimens</span>
            <h2 ref={headingRef} className="t-display-2 mt-3 leading-[1.05]">
              Most libraries hand you a grid of cards.{" "}
              <span className="text-type-accent">These ones you operate</span> — then paste.
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Nothing below is a screenshot. Type into them, drag them, toggle them, copy the code —
              the same React + TypeScript parts that ship in the library.
            </p>
          </div>
          <Link
            href="/components"
            className="ed-mono shrink-0 text-type-accent outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
          >
            Full library →
          </Link>
        </div>

        <div ref={rootRef} className="grid grid-cols-1 gap-px border border-[hsl(var(--ed-rule))] bg-[hsl(var(--ed-rule))] md:grid-cols-4 md:auto-rows-[minmax(0,1fr)]">
          <InputTile />
          <SliderTile />
          <SwitchTile />
          <ButtonTile />
        </div>
      </div>
    </section>
  )
}
