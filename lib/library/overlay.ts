/**
 * Local vault overlay: merge private, vault-derived enrichment into committed
 * library entries. Browser-safe (pure data in, data out).
 *
 * The overlay file (`data/library/local/overlay.json`) is gitignored and only
 * wired into `next dev` (see the `@library-local-overlay` alias in
 * `next.config.js`). Production builds resolve the alias to an empty overlay,
 * so no note text can reach the static export.
 */
import type {
  LibraryComponent,
  LibraryEntryView,
  LibraryLocalEnrichment,
  LibraryLocalOverlay,
} from "@/lib/contracts";

export const EMPTY_OVERLAY: LibraryLocalOverlay = { version: 1, entries: {} };

/** Fields that come from the vault and must never be committed. */
export const VAULT_FIELDS = ["notes"] as const;

/** Drop vault-derived fields from an entry (e.g. one written by an older importer). */
export function stripVaultFields<T extends object>(entry: T): T {
  const copy = { ...entry } as Record<string, unknown>;
  for (const field of VAULT_FIELDS) delete copy[field];
  return copy as T;
}

/**
 * Merge an entry with its local enrichment. Note tags are added to the
 * entry's tags, a note category replaces the committed one, the first note's
 * excerpt stands in for a missing JSDoc description, and with no enrichment
 * the entry gets an empty `notes` list.
 */
export function applyLocalOverlay<
  T extends Pick<LibraryComponent, "id" | "category" | "tags" | "description">,
>(
  entry: T,
  overlay: LibraryLocalOverlay | undefined
): T & Pick<LibraryEntryView, "notes"> {
  const local: LibraryLocalEnrichment | undefined = overlay?.entries?.[entry.id];
  if (!local) return { ...entry, notes: [] };
  const tags = Array.from(new Set([...entry.tags, ...local.tags.map((t) => t.toLowerCase())])).sort();
  return {
    ...entry,
    description: entry.description || local.notes[0]?.excerpt || "",
    category: local.category ?? entry.category,
    tags,
    notes: local.notes,
  };
}
