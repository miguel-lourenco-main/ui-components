/**
 * MCP-safe theme registry readers.
 *
 * Themes are pure, serializable data defined in `lib/themes.ts` (no React
 * imports), so we read them directly. This keeps a single source of truth: the
 * UI and the agent-facing registry consume the same `themes` array.
 */
import { themes } from "@/lib/themes";
import type { ThemeContract, ThemeSummary } from "@/lib/contracts";

/** All themes as full serializable contracts. */
export function listThemes(): ThemeContract[] {
  return themes as ThemeContract[];
}

/** Lightweight theme summaries for listing. */
export function listThemeSummaries(): ThemeSummary[] {
  return listThemes().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    styles: t.styles,
  }));
}

/** Get a single theme by id. */
export function getTheme(themeId: string): ThemeContract | undefined {
  const target = themeId.trim().toLowerCase();
  return listThemes().find((t) => t.id.toLowerCase() === target);
}
