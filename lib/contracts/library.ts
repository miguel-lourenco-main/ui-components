/**
 * Contracts for the component library: components ingested from the user's
 * other projects (and, optionally, enriched from their Obsidian vault).
 *
 * Unlike the published registry (`components/display-components/`), library
 * entries are not hand-written: they are extracted from source code by
 * `pnpm library:import`, stored one file per entry under `data/library/entries/`,
 * and aggregated into a generated `data/library/index.json` manifest that the
 * static `/library` route imports. Re-importing the same file updates the
 * entry in place (same id), so the library stays in sync with its sources.
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

/** An Obsidian note linked to a library entry. */
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
  /** Free-form category; from the vault note or the import flag, else "uncategorized". */
  category: string;
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
  notes: LibraryNote[];
  /** ISO-8601: first import, and last time the content changed. */
  importedAt: string;
  updatedAt: string;
}

/** Generated manifest consumed by the `/library` route. */
export interface LibraryManifest {
  version: number;
  generatedAt: string;
  components: LibraryComponent[];
}
