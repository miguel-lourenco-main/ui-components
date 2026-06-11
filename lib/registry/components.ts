/**
 * MCP-safe published component registry readers.
 *
 * These read the on-disk registry (`components/display-components/`) using the
 * filesystem and have no React/rendering dependencies, so they can run in the
 * MCP server, validation scripts, and tests. The browser catalog continues to
 * use the build-time `lib/componentsIndex.ts`.
 */
import fs from "node:fs";
import path from "node:path";
import type {
  ComponentIndexEntry,
  ComponentIndexFile,
  ComponentMetaContract,
  PublishedComponentDetail,
  PublishedComponentSource,
  PublishedComponentSummary,
} from "@/lib/contracts";
import {
  COMPONENTS_INDEX_PATH,
  DISPLAY_COMPONENTS_DIR,
  normalizeIndexPath,
} from "./paths";

function readIndexFile(): ComponentIndexFile {
  const raw = fs.readFileSync(COMPONENTS_INDEX_PATH, "utf8");
  const parsed = JSON.parse(raw) as ComponentIndexFile;
  if (!parsed || !Array.isArray(parsed.components)) {
    throw new Error("Invalid components index: missing `components` array");
  }
  return parsed;
}

function activeEntries(index: ComponentIndexFile): ComponentIndexEntry[] {
  const blacklist = new Set(index.blacklist ?? []);
  return index.components.filter((c) => !blacklist.has(c.id));
}

function componentDir(entry: ComponentIndexEntry): string {
  return path.join(DISPLAY_COMPONENTS_DIR, normalizeIndexPath(entry.path));
}

function metaPath(entry: ComponentIndexEntry): string {
  return path.join(componentDir(entry), `${entry.name}.meta.json`);
}

function sourcePath(entry: ComponentIndexEntry): string {
  return path.join(componentDir(entry), `${entry.name}.tsx`);
}

function examplesPath(entry: ComponentIndexEntry): string {
  return path.join(componentDir(entry), `${entry.name}.examples.tsx`);
}

/** Read and parse a component's meta.json. Throws if missing/invalid. */
export function readComponentMeta(
  entry: ComponentIndexEntry
): ComponentMetaContract {
  const raw = fs.readFileSync(metaPath(entry), "utf8");
  return JSON.parse(raw) as ComponentMetaContract;
}

function toSummary(
  entry: ComponentIndexEntry,
  meta: ComponentMetaContract
): PublishedComponentSummary {
  return {
    id: entry.id.toLowerCase(),
    name: entry.name,
    description: meta.description ?? "",
    category: meta.category ?? "mixed",
    tags: meta.tags ?? [],
    version: meta.version ?? "1.0.0",
    author: meta.author ?? "Unknown",
    path: normalizeIndexPath(entry.path),
  };
}

/** List all active (non-blacklisted) published components as summaries. */
export function listComponents(): PublishedComponentSummary[] {
  const index = readIndexFile();
  const summaries: PublishedComponentSummary[] = [];
  for (const entry of activeEntries(index)) {
    try {
      summaries.push(toSummary(entry, readComponentMeta(entry)));
    } catch {
      // Skip entries whose metadata cannot be read; registry validation
      // reports these separately so listing stays resilient.
    }
  }
  return summaries;
}

function findEntry(componentId: string): ComponentIndexEntry | undefined {
  const index = readIndexFile();
  const target = componentId.toLowerCase();
  return activeEntries(index).find((e) => e.id.toLowerCase() === target);
}

/** Get full detail (props, code, examples flag) for one component by id. */
export function getComponent(
  componentId: string
): PublishedComponentDetail | undefined {
  const entry = findEntry(componentId);
  if (!entry) return undefined;
  const meta = readComponentMeta(entry);
  return {
    ...toSummary(entry, meta),
    props: meta.props ?? [],
    code: meta.code ?? "",
    dependencies: meta.dependencies ?? [],
    hasExamples: fs.existsSync(examplesPath(entry)),
  };
}

/**
 * Search components by free-text query across id, name, description, and tags.
 * Returns summaries ranked by a simple relevance score (name/id matches win).
 */
export function searchComponents(query: string): PublishedComponentSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return listComponents();

  const scored: Array<{ score: number; summary: PublishedComponentSummary }> = [];
  for (const summary of listComponents()) {
    let score = 0;
    if (summary.id.toLowerCase() === q || summary.name.toLowerCase() === q) {
      score += 100;
    }
    if (summary.name.toLowerCase().includes(q)) score += 20;
    if (summary.id.toLowerCase().includes(q)) score += 15;
    if (summary.category.toLowerCase().includes(q)) score += 8;
    if (summary.description.toLowerCase().includes(q)) score += 5;
    if (summary.tags.some((t) => t.toLowerCase().includes(q))) score += 10;
    if (score > 0) scored.push({ score, summary });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.summary.name.localeCompare(b.summary.name))
    .map((s) => s.summary);
}

/**
 * Get the authoritative on-disk `<Name>.tsx` source plus the embedded meta code
 * for one component. Returns undefined when the component is not registered.
 */
export function getComponentSource(
  componentId: string
): PublishedComponentSource | undefined {
  const entry = findEntry(componentId);
  if (!entry) return undefined;
  const meta = readComponentMeta(entry);
  const sourceFile = sourcePath(entry);
  const source = fs.existsSync(sourceFile)
    ? fs.readFileSync(sourceFile, "utf8")
    : "";
  return {
    id: entry.id.toLowerCase(),
    name: entry.name,
    source,
    metaCode: meta.code ?? "",
  };
}

/** Internal: expose resolved file paths for the validation layer. */
export function resolveComponentFiles(entry: ComponentIndexEntry) {
  return {
    dir: componentDir(entry),
    meta: metaPath(entry),
    source: sourcePath(entry),
    examples: examplesPath(entry),
  };
}

/** Internal: read the raw index + active entries for the validation layer. */
export function readRegistry() {
  const index = readIndexFile();
  return { index, entries: activeEntries(index) };
}
