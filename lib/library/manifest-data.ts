/**
 * Browser-safe accessors for the library (`pnpm library:import` output). No
 * filesystem access, so it is safe for client components and the static export.
 *
 * `data/library/index.json` holds light rows (no source, no prop contracts) and
 * is bundled with the route. Each entry's full JSON is a separate lazily loaded
 * chunk, fetched by `loadLibraryEntry` when the detail view opens, so the
 * route's size does not grow with the library's source.
 *
 * In `next dev`, entries are merged with the private vault overlay when one
 * exists; production builds resolve the overlay to an empty one.
 */
import manifest from "@/data/library/index.json";
import localOverlay from "@library-local-overlay";
import type {
  ComponentMetaContract,
  LibraryComponent,
  LibraryEntryView,
  LibraryIndexView,
  LibraryLocalOverlay,
  LibraryManifest,
} from "@/lib/contracts";
import { applyLocalOverlay } from "./overlay";

const data = manifest as unknown as LibraryManifest;
const overlay: LibraryLocalOverlay = localOverlay;

/** All library rows, sorted by project then name (as generated). */
export const LIBRARY: LibraryIndexView[] = (data.components ?? []).map((c) => applyLocalOverlay(c, overlay));

/** Look up one manifest row by id. */
export function getLibraryIndexEntry(id: string): LibraryIndexView | undefined {
  return LIBRARY.find((c) => c.id === id);
}

const ENTRY_ID = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Load one entry's full data (source, props) on demand. Resolves to undefined
 * for an unknown id. Ids are checked against the manifest before importing.
 */
export async function loadLibraryEntry(id: string): Promise<LibraryEntryView | undefined> {
  if (!ENTRY_ID.test(id) || !getLibraryIndexEntry(id)) return undefined;
  try {
    const mod = (await import(`@/data/library/entries/${id}.json`)) as { default: LibraryComponent };
    return applyLocalOverlay(mod.default, overlay);
  } catch {
    return undefined;
  }
}

/** Link to the entry's source file at the imported commit, when the remote is known. */
export function sourceUrl(entry: Pick<LibraryComponent, "source">): string | undefined {
  const { repo, commit, path } = entry.source;
  if (!repo) return undefined;
  const ref = commit ?? "HEAD";
  return repo.includes("github.com") ? `${repo}/blob/${ref}/${path}` : `${repo}/-/blob/${ref}/${path}`;
}

/**
 * Adapt an entry to the registry meta contract so the existing proposal
 * preview (`ProposalComponentPreview`) can attempt a live render.
 */
export function toPreviewMeta(entry: LibraryComponent): ComponentMetaContract {
  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description: entry.description || entry.name,
    props: entry.props.map(({ tsType: _ts, defaultExpression: _expr, ...prop }) => prop),
    tags: entry.tags,
    version: entry.contentHash.slice(0, 7),
    author: entry.source.project,
    code: entry.code,
    dependencies: entry.dependencies,
  };
}
