"use client"

import { useCountUp } from "@/lib/motion/hooks"

function Stat({ value, label }: { value: number; label: string }) {
  const ref = useCountUp<HTMLSpanElement>(value)
  return (
    <div className="flex items-baseline gap-2">
      <span ref={ref} className="text-display text-2xl font-bold tabular-nums md:text-3xl">
        {value}
      </span>
      <span className="t-mono text-muted-foreground">{label}</span>
    </div>
  )
}

/** Live measurement ribbon under the hero — real catalog counts, counting up. */
export function StatRibbon({
  components,
  themes,
  requests,
}: {
  components: number
  themes: number
  requests: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <Stat value={components} label="Specimens" />
      <span className="h-4 w-px bg-border" aria-hidden />
      <Stat value={themes} label="Spectra" />
      <span className="h-4 w-px bg-border" aria-hidden />
      <Stat value={requests} label="Samples" />
    </div>
  )
}
