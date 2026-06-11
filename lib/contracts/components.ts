/**
 * Canonical contracts for published components.
 *
 * This is the single source of truth for the shape of component data that is
 * shared between the catalog UI, the registry readers, and the MCP server.
 * The on-disk format lives in `components/display-components/<group>/<Name>/<Name>.meta.json`
 * and `index.json`; these types describe that format plus the normalized read
 * models that consumers work with.
 */

/**
 * Raw prop type as authored in `*.meta.json`. It may be a single internal
 * PropType string (e.g. "string", "enum", "component"), a TypeScript-ish hint
 * (e.g. "React.ReactNode", "number[]"), or an array combining several
 * (e.g. ["component", "function"]).
 */
export type MetaPropType = string | string[];

/** A single prop definition as stored in a component's `*.meta.json`. */
export interface ComponentPropContract {
  name: string;
  type: MetaPropType;
  required: boolean;
  defaultValue?: unknown;
  options?: Array<string | number>;
  description?: string;
  functionSignature?: {
    params: string;
    returnType: string;
  };
}

/**
 * Full component metadata as stored on disk in `*.meta.json`.
 *
 * `code` is an embedded, self-contained source string used for copy/paste and
 * agent consumption. The authoritative React implementation lives in the sibling
 * `<Name>.tsx` file; keep both in sync (validated by the registry checks).
 */
export interface ComponentMetaContract {
  id: string;
  name: string;
  category: string;
  description: string;
  props: ComponentPropContract[];
  tags: string[];
  version: string;
  author: string;
  code?: string;
  dependencies?: string[];
}

/** An entry in `components/display-components/index.json`. */
export interface ComponentIndexEntry {
  id: string;
  name: string;
  path: string;
}

/** The shape of `components/display-components/index.json`. */
export interface ComponentIndexFile {
  blacklist?: string[];
  components: ComponentIndexEntry[];
}

/**
 * Lightweight read model returned by `listComponents`/`searchComponents`.
 * Contains everything needed to render a catalog row without loading source.
 */
export interface PublishedComponentSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
  /** Normalized path relative to `components/display-components/`. */
  path: string;
}

/** Full read model returned by `getComponent`, including source and props. */
export interface PublishedComponentDetail extends PublishedComponentSummary {
  props: ComponentPropContract[];
  /** Embedded code from meta.json (may be empty). */
  code: string;
  dependencies: string[];
  /** Whether a `<Name>.examples.tsx` file exists for this component. */
  hasExamples: boolean;
}

/**
 * Source read model returned by `getComponentSource`: the authoritative
 * `<Name>.tsx` contents plus the embedded meta code for comparison.
 */
export interface PublishedComponentSource {
  id: string;
  name: string;
  /** Contents of the on-disk `<Name>.tsx` file. */
  source: string;
  /** Embedded code string from `*.meta.json` (may be empty). */
  metaCode: string;
}
