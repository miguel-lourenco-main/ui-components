/**
 * Canonical contracts for themes.
 *
 * The authoritative theme data currently lives in `lib/themes.ts` as a typed
 * `Theme[]`. That structure is already fully serializable, so we re-export the
 * existing `Theme` type as the shared contract instead of duplicating it. This
 * preserves a single source of truth: changing `lib/themes.ts` updates both the
 * UI and the agent-facing registry.
 */
import type { Theme, ThemeMode, ThemeComponentKey } from "@/lib/themes";

/** Serializable theme contract shared by the UI, registry, and MCP server. */
export type ThemeContract = Theme;

export type { ThemeMode, ThemeComponentKey };

/** Lightweight read model for listing themes without full component style maps. */
export interface ThemeSummary {
  id: string;
  name: string;
  description: string;
  styles: Theme["styles"];
}

/** Required color token keys every theme mode must define. */
export const REQUIRED_COLOR_TOKENS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "muted",
  "border",
] as const;

/** Required component style groups every theme mode must define. */
export const REQUIRED_COMPONENT_GROUPS = [
  "button",
  "card",
  "form",
  "alert",
  "badge",
] as const;

export type RequiredColorToken = (typeof REQUIRED_COLOR_TOKENS)[number];
export type RequiredComponentGroup = (typeof REQUIRED_COMPONENT_GROUPS)[number];
