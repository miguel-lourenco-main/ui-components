"use client"

/**
 * Single GSAP registration point shared by every redesign direction.
 *
 * - Registers ScrollTrigger + CustomEase exactly once (HMR-safe).
 * - Mirrors the app's `--ease-out-expo` (cubic-bezier(0.16,1,0.3,1)) as a named
 *   GSAP ease called "expo" so scrubbed/canvas motion matches DOM transitions.
 * - All callers should `import { gsap, ScrollTrigger } from "@/lib/motion/gsap-setup"`
 *   and call `setupGsap()` inside a client effect before creating tweens.
 */
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CustomEase } from "gsap/CustomEase"

let registered = false

export function setupGsap(): void {
  if (registered || typeof window === "undefined") return
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  // cubic-bezier(0.16, 1, 0.3, 1) → SVG path form for CustomEase
  if (!CustomEase.get("expo")) {
    CustomEase.create("expo", "M0,0 C0.16,1 0.3,1 1,1")
  }
  ScrollTrigger.config({ ignoreMobileResize: true })
  registered = true
}

/** True when the visitor asked the OS to reduce motion. SSR-safe (false on server). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** True for fine pointers (mouse/trackpad). Magnetic/loupe FX gate on this. */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(pointer: fine)").matches
}

export { gsap, ScrollTrigger, CustomEase }
