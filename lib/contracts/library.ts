/**
 * Contracts for the component library: components ingested from the user's
 * other projects (and, optionally, enriched from their Obsidian vault).
 *
 * Unlike the published registry (`components/display-components/`), library
 * entries are not hand-written: they are extracted from source code by
 * `pnpm library:import`, stored one file per entry under `data/library/entries/`,
 * and summarised in a generated `data/library/index.json` manifest that the
 * static `/library` route imports (full entries are loaded per detail view). Re-importing the same file updates the
 * entry in place (same id), so the library stays in sync with its sources.
 *
 * Committed entries hold only code-derived data. Anything read from the
 * Obsidian vault (note titles, excerpts, note tags and categories) is private
 * and lives in a gitignored local overlay (`data/library/local/overlay.json`)
 * that `next dev` merges in when it exists. The public build never sees it.
 */
import type { ComponentPropContract } from "./components";

/** Where a library entry was imported from. */
export interface LibrarySource {
  /** Project name (defaults to the git repo directory name). */
  project: string;
  /** Remote URL of the source repository, when known. */
  repo?: string;
  /** File path relative to the source repository root. */
  path: string;
  /** Commit the file was read at, when the source is a git checkout. */
  commit?: string;
  /** How the component is exported from its file. */
  exportKind: "default" | "named";
}

/**
 * A prop extracted from source. Shares the registry prop contract (so the
 * existing preview/props tooling can consume it) and keeps the raw TypeScript
 * type text, which is usually more informative than the normalized `type`.
 */
export interface LibraryProp extends ComponentPropContract {
  /** The prop's TypeScript type as written in the source. */
  tsType: string;
  /** Default value expression from the destructuring pattern, when not a plain literal. */
  defaultExpression?: string;
}

/** An Obsidian note linked to a library entry. Local-only: never committed. */
export interface LibraryNote {
  /** Path relative to the vault root. */
  path: string;
  title: string;
  tags: string[];
  /** First paragraph of the note body, trimmed. */
  excerpt: string;
}

/** One ingested component. */
export interface LibraryComponent {
  /** Stable id: `<project>--<component>` slug. */
  id: string;
  name: string;
  description: string;
  /** Free-form category from the import flag, else "uncategorized". A local vault note may override it. */
  category: string;
  /** Tags from the import flags. Local vault notes may add more. */
  tags: string[];
  props: LibraryProp[];
  /** Names of interfaces/types the props type extends (e.g. `React.ButtonHTMLAttributes<...>`). */
  propsExtends: string[];
  /** Bare package imports (e.g. `framer-motion`). */
  dependencies: string[];
  /** Relative/aliased imports that must travel with the component (e.g. `@/lib/utils`). */
  localImports: string[];
  source: LibrarySource;
  /** Full source of the file the component lives in. */
  code: string;
  /** sha256 of `code`, used to detect changes on re-import. */
  contentHash: string;
  /** ISO-8601: first import, and last time the content changed. */
  importedAt: string;
  updatedAt: string;
}

/** Vault-derived enrichment for one entry, kept in the local overlay. */
export interface LibraryLocalEnrichment {
  notes: LibraryNote[];
  /** Category declared by a linked note; overrides the committed one locally. */
  category?: string;
  /** Tags from linked notes, merged into the entry's own tags locally. */
  tags: string[];
}

/** The gitignored overlay written by `pnpm library:import --vault`. */
export interface LibraryLocalOverlay {
  version: number;
  /** Enrichment keyed by library entry id. */
  entries: Record<string, LibraryLocalEnrichment>;
}

/** A library entry as the detail view sees it: committed data plus any local notes. */
export interface LibraryEntryView extends LibraryComponent {
  /** Linked vault notes; always empty outside local dev. */
  notes: LibraryNote[];
}

/**
 * Light manifest row: enough to list, search and filter. The full source and
 * the prop contracts stay in the per-entry file, which the detail view loads
 * on demand, so the manifest stays small as the library grows.
 */
export interface LibraryIndexEntry
  extends Omit<LibraryComponent, "code" | "props" | "propsExtends" | "localImports"> {
  /** Prop names, for search and the card's prop count. */
  propNames: string[];
}

/** A manifest row as the browser sees it, with any local notes merged in. */
export interface LibraryIndexView extends LibraryIndexEntry {
  notes: LibraryNote[];
}

/** Generated manifest consumed by the `/library` route. */
export interface LibraryManifest {
  version: number;
  generatedAt: string;
  components: LibraryIndexEntry[];
}
