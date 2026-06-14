import { cn } from "@/lib/utils"

const WORDS = ["Components", "Themes", "Playground", "Agents", "TypeScript", "Copy & paste"]

/**
 * An oversized running headline — a purely decorative editorial divider. Uses the
 * existing marquee keyframes (disabled under reduced motion via globals.css).
 */
export function TypeMarquee({ reverse = false }: { reverse?: boolean }) {
  const row = [...WORDS, ...WORDS]
  return (
    <div aria-hidden className="relative w-full overflow-hidden border-y border-[hsl(var(--ed-rule))] py-6">
      <div
        className={cn(
          "flex w-max items-center gap-8 whitespace-nowrap",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
      >
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8">
            <span
              className={cn(
                "text-display text-4xl font-bold md:text-6xl",
                i % 2 === 1 && "t-outline"
              )}
            >
              {w}
            </span>
            <span className="text-type-accent text-3xl md:text-5xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
