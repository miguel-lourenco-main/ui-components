"use client"

import { createElement } from "react"
import { useSplitReveal } from "@/lib/motion/hooks"

interface KineticHeadingProps {
  as?: "h1" | "h2" | "h3"
  by?: "chars" | "words" | "lines"
  className?: string
  children: React.ReactNode
}

/**
 * A heading that wraps real (server-rendered, readable) text and reveals it
 * piece-by-piece via split-type once it enters view. Under reduced motion it is
 * simply the plain heading. LCP-safe: the text exists before any JS runs.
 */
export function KineticHeading({ as = "h2", by = "words", className, children }: KineticHeadingProps) {
  const ref = useSplitReveal<HTMLHeadingElement>({ by })
  return createElement(as, { ref, className }, children)
}
