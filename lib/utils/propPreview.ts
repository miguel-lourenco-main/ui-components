import type { PropPreviewContract } from '@/lib/contracts/components';

interface PropWithPreview {
  name: string;
  preview?: PropPreviewContract;
}

/**
 * Whether editing this prop can change a mounted preview. Driven only by the
 * prop contract's `preview` field: a prop is non-visual exactly when its meta
 * says `"preview": { "visual": false, "reason": ... }`.
 */
export function hasVisualEffect(prop: PropWithPreview): boolean {
  return prop.preview?.visual !== false;
}

/** Reason shown next to a disabled editor, or undefined for visual props. */
export function nonVisualReason(prop: PropWithPreview): string | undefined {
  return hasVisualEffect(prop) ? undefined : prop.preview?.reason;
}

/** Split props into the ones worth editing in a preview and the ones that are not. */
export function partitionByVisualEffect<T extends PropWithPreview>(props: T[]): { visual: T[]; nonVisual: T[] } {
  const visual: T[] = [];
  const nonVisual: T[] = [];
  for (const prop of props) (hasVisualEffect(prop) ? visual : nonVisual).push(prop);
  return { visual, nonVisual };
}

/**
 * React's naming convention for uncontrolled, initial-only props
 * (`defaultValue`, `defaultChecked`, `defaultPressed`, ...). Used only by
 * registry validation to warn when such a prop is not marked non-visual.
 */
export function looksInitialOnly(propName: string): boolean {
  return /^default[A-Z]/.test(propName);
}
