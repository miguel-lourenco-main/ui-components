import { cn } from "@/lib/utils"

interface AmbientBackgroundProps {
  variant?: "hero" | "subtle"
  className?: string
}

/**
 * Decorative ambient glow blobs for section backgrounds.
 * Purely visual: transform-only CSS animations, hidden from assistive tech,
 * and disabled entirely under prefers-reduced-motion (see globals.css).
 * Scope per-section — never mount behind Monaco or the playground panels.
 */
export function AmbientBackground({ variant = "hero", className }: AmbientBackgroundProps) {
  const isHero = variant === "hero"

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div
        className={cn(
          "animate-blob-1 absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[hsl(var(--glow))] blur-3xl",
          isHero ? "opacity-[0.12]" : "opacity-[0.07]"
        )}
      />
      <div
        className={cn(
          "animate-blob-2 absolute right-[15%] top-1/3 h-80 w-80 rounded-full bg-violet-500 blur-3xl",
          isHero ? "opacity-[0.10]" : "opacity-[0.06]"
        )}
      />
      {isHero && (
        <div className="animate-blob-3 absolute -bottom-20 left-1/2 h-72 w-72 rounded-full bg-sky-500 opacity-[0.08] blur-3xl" />
      )}
    </div>
  )
}
