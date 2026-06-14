"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { gsap, setupGsap, prefersReducedMotion } from "@/lib/motion/gsap-setup"

function Specimen({
  index,
  name,
  href,
  className,
  children,
}: {
  index: string
  name: string
  href: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-specimen
      className={cn(
        "spec-card spec-corner group relative flex flex-col p-6 transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-[hsl(var(--substance-1)/0.45)] hover:[box-shadow:0_0_0_1px_hsl(var(--substance-1)/0.25),0_30px_60px_-30px_hsl(var(--substance-1)/0.5)]",
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="t-mono text-muted-foreground">
          {index} · {name}
        </span>
        <Link
          href={href}
          aria-label={`Open ${name} specimen`}
          className="text-muted-foreground/60 outline-none transition-colors hover:text-primary-accent focus-visible:text-primary-accent"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  )
}

function GrowthSpecimen() {
  const [v, setV] = useState(64)
  return (
    <Specimen index="SPEC-01" name="Slider" href="/components?component=slider" className="sm:col-span-2 sm:row-span-2">
      <p className="text-display mb-3 text-[clamp(3rem,10vw,6.5rem)] font-bold leading-none tabular-nums text-spectrum">
        {v}
      </p>
      <p className="mb-8 max-w-xs text-sm text-muted-foreground">
        Drive the substance. Every specimen below is the real, paste-ready component.
      </p>
      <Slider value={[v]} onValueChange={(val) => setV(val[0])} max={100} step={1} aria-label="Growth" />
    </Specimen>
  )
}

function InputSpecimen() {
  const [text, setText] = useState("")
  return (
    <Specimen index="SPEC-02" name="Input" href="/components?component=input" className="sm:col-span-2">
      <p className="text-display mb-4 truncate text-2xl font-semibold md:text-3xl">
        {text ? text : <span className="text-muted-foreground/50">Label the sample…</span>}
      </p>
      <Input value={text} maxLength={24} onChange={(e) => setText(e.target.value)} placeholder="Type to label" />
    </Specimen>
  )
}

function SwitchSpecimen() {
  const [on, setOn] = useState(true)
  return (
    <Specimen index="SPEC-03" name="Switch" href="/components?component=switch">
      <div className="mb-5 flex items-center gap-2">
        <Badge variant={on ? "default" : "secondary"}>{on ? "Active" : "Dormant"}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Energize specimen</span>
        <Switch checked={on} onCheckedChange={setOn} aria-label="Energize specimen" />
      </div>
    </Specimen>
  )
}

function ButtonSpecimen() {
  return (
    <Specimen index="SPEC-04" name="Button" href="/components?component=button" className="sm:col-span-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Default</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
        <Button size="sm" variant="ghost">
          Ghost
        </Button>
      </div>
    </Specimen>
  )
}

/** Real components presented as extracted lab specimens that develop in on scroll. */
export function SpecimenShowcase() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    setupGsap()
    const ctx = gsap.context(() => {
      gsap.from("[data-specimen]", {
        y: 44,
        opacity: 0,
        duration: 0.8,
        ease: "expo",
        stagger: 0.09,
        scrollTrigger: { trigger: root, start: "top 75%", once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative w-full px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="t-mono text-primary-accent">Extracted specimens</span>
            <h2 className="t-h1 mt-3 max-w-xl font-semibold">Operate the material, then take it.</h2>
          </div>
          <Link
            href="/components"
            className="t-mono text-primary-accent outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
          >
            Full library →
          </Link>
        </div>

        <div ref={rootRef} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:auto-rows-[minmax(0,1fr)]">
          <GrowthSpecimen />
          <InputSpecimen />
          <SwitchSpecimen />
          <ButtonSpecimen />
        </div>
      </div>
    </section>
  )
}
