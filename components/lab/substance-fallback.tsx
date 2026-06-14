/**
 * Static substance backdrop: the WebGL canvas's loading state AND the permanent
 * backdrop for mobile / reduced-motion / no-WebGL. Pure CSS, so the hero is
 * never blank and never blocks LCP.
 */
export function SubstanceFallback() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="substance-fallback absolute inset-0" />
      <div className="lab-grid-bg absolute inset-0" />
    </div>
  )
}

export default SubstanceFallback
