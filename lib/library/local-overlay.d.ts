/**
 * `@library-local-overlay` is a webpack alias (see next.config.js): the private
 * vault overlay in `next dev` when it exists, otherwise the committed empty one.
 * Declared here rather than in tsconfig `paths`, which Next would resolve first.
 */
declare module "@library-local-overlay" {
  const overlay: import("@/lib/contracts").LibraryLocalOverlay;
  export default overlay;
}
