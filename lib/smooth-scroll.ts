/**
 * Animated window scroll with a controllable duration, unlike native
 * `behavior: 'smooth'` whose speed is browser-defined and feels abrupt for
 * long distances. Respects prefers-reduced-motion by jumping instantly.
 */
export function smoothScrollTo(targetY: number, duration = 1100) {
  if (typeof window === "undefined") return

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  if (prefersReducedMotion) {
    window.scrollTo(0, targetY)
    return
  }

  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 1) return

  const startTime = performance.now()
  // Gentle ease-in-out so the scroll ramps up and settles softly.
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    window.scrollTo(0, startY + distance * easeInOutCubic(progress))
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}
