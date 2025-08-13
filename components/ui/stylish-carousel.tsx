"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface StylishCarouselProps {
  className?: string
  speedMs?: number
  reverse?: boolean
  pauseOnHover?: boolean
  fadeColor?: string
  // Render items directly; provide children as a row of equally spaced elements
  children: React.ReactNode
}

// A minimal, dependency-free, seamless marquee-style carousel inspired by Magic UI / Aceternity galleries.
// Duplicates content to create an infinite loop. Designed to blend into the UI: no borders, arrows, or rails.
export function StylishCarousel({
  className,
  speedMs = 45000,
  reverse = false,
  pauseOnHover = true,
  fadeColor,
  children,
}: StylishCarouselProps) {
  // Convert ms to inline style duration to allow per-instance tuning.
  const durationStyle = { animationDuration: `${speedMs}ms` }

  return (
    <div className={cn("relative w-full overflow-hidden", className)} aria-roledescription="carousel">
      <div
        className={cn(
          "flex w-max gap-6 select-none",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "[animation-play-state:running] hover:[animation-play-state:paused]"
        )}
        style={durationStyle}
      >
        {/* First pass */}
        <div className="flex items-center gap-6">{children}</div>
        {/* Duplicate for seamless loop */}
        <div className="flex items-center gap-6" aria-hidden>
          {children}
        </div>
      </div>
      {/* Subtle edge fade to make the loop feel natural without visible edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16"
        style={{
          backgroundImage: `linear-gradient(to right, ${fadeColor ?? 'hsl(var(--background))'}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16"
        style={{
          backgroundImage: `linear-gradient(to left, ${fadeColor ?? 'hsl(var(--background))'}, transparent)`,
        }}
      />
    </div>
  )
}


