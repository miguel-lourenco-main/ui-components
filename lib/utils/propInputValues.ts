/**
 * Conversions between a prop's value and the text shown in its Props panel
 * input. Kept pure so the empty-input rules are unit tested.
 *
 * Rule: an empty text field is a value, not "unset". Clearing a string prop
 * yields `""`, so a controlled prop such as `value` stays controlled and the
 * preview clears with it. Mapping `""` to `undefined` made React treat the
 * input as uncontrolled, and the DOM kept the last typed text.
 *
 * Numbers have no empty value, so an empty number field does mean "unset".
 */

/** Text to show in a string/color input for the current prop value. */
export function formatTextInput(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

/** Text to show in a number input. `0` is shown, not blanked. */
export function formatNumberInput(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') return value;
  return '';
}

/** Prop value produced by a number input: `undefined` when empty or not a number. */
export function parseNumberInput(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}
