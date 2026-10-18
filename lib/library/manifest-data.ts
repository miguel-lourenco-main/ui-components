/**
 * Browser-safe accessors for the generated library manifest
 * (`data/library/index.json`, written by `pnpm library:import`). No
 * filesystem access, so it is safe for client components and the static export.
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
  LibraryLocalOverlay,
  LibraryManifest,
} from "@/lib/contracts";
import { applyLocalOverlay } from "./overlay";

const data = manifest as unknown as LibraryManifest;
const overlay: LibraryLocalOverlay = localOverlay;

/** All library entries, sorted by project then name (as generated). */
export const LIBRARY: LibraryEntryView[] = (data.components ?? []).map((c) => applyLocalOverlay(c, overlay));

/** Look up one entry by id. */
export function getLibraryComponent(id: string): LibraryEntryView | undefined {
  return LIBRARY.find((c) => c.id === id);
}

/** Link to the entry's source file at the imported commit, when the remote is known. */
export function sourceUrl(entry: LibraryComponent): string | undefined {
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
