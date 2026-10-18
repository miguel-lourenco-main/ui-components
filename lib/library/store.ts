/**
 * File-backed component library store and import pipeline (Node-only).
 *
 * Entries live at `data/library/entries/<id>.json`; `data/library/index.json`
 * is regenerated from them after every import. Importing is idempotent: the id
 * is derived from project + component name, so re-importing a file updates the
 * existing entry, and an entry whose content did not change keeps its
 * timestamps (the manifest does not churn).
 *
 * Vault enrichment never goes into the committed entries: it is written to the
 * gitignored `data/library/local/overlay.json` instead (see `./overlay.ts`).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  LibraryComponent,
  LibraryLocalEnrichment,
  LibraryLocalOverlay,
  LibraryManifest,
} from "@/lib/contracts";
import { REPO_ROOT } from "@/lib/registry/paths";
import { slugify } from "@/lib/requests/ids";
import { extractComponents } from "./extract";
import { EMPTY_OVERLAY, stripVaultFields } from "./overlay";
import { notesForComponent, type VaultNote } from "./vault";

export const LIBRARY_DIR = path.join(REPO_ROOT, "data", "library");
/** Subdirectory of the library dir that holds local-only (gitignored) data. */
export const LOCAL_SUBDIR = "local";
const MANIFEST_VERSION = 1;
const SOURCE_EXTENSIONS = new Set([".tsx", ".jsx"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".turbo"]);
const SKIP_FILE = /\.(test|spec|stories|examples)\.[jt]sx?$|\.d\.ts$/;

export interface ImportOptions {
  /** Files or directories to scan. */
  paths: string[];
  /** Project name; defaults to the source git repo's directory name. */
  project?: string;
  /** Category for imported entries that no vault note categorises. */
  category?: string;
  /** Extra tags applied to every imported entry. */
  tags?: string[];
  /** Notes read from an Obsidian vault (see `readVaultNotes`). */
  vaultNotes?: VaultNote[];
  /** Library directory (tests override it). */
  dir?: string;
  /** Clock override for tests. */
  now?: () => Date;
}

export interface ImportResult {
  created: LibraryComponent[];
  updated: LibraryComponent[];
  unchanged: LibraryComponent[];
  /** Files that were scanned but contained no exported components. */
  skippedFiles: string[];
  /** Linked-note count per entry id, when a vault was given (written to the local overlay only). */
  localNotes: Record<string, number>;
}

export interface SourceFile {
  file: string;
  /** The import argument the file was found under (a directory, or the file's own directory). */
  base: string;
}

/** Expand files/directories into the component source files to scan. */
export function collectSourceFiles(inputs: string[]): SourceFile[] {
  const files = new Map<string, SourceFile>();
  const walk = (abs: string, base: string) => {
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
        if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
        walk(path.join(abs, entry.name), base);
      }
    } else if (SOURCE_EXTENSIONS.has(path.extname(abs)) && !SKIP_FILE.test(abs) && !files.has(abs)) {
      files.set(abs, { file: abs, base });
    }
  };
  for (const input of inputs) {
    const abs = path.resolve(input);
    walk(abs, fs.statSync(abs).isDirectory() ? abs : path.dirname(abs));
  }
  return Array.from(files.values()).sort((a, b) => a.file.localeCompare(b.file));
}

interface GitInfo {
  /** Repository root, when the file is inside a git checkout. */
  root?: string;
  commit?: string;
  repo?: string;
}

function git(cwd: string, args: string[]): string | undefined {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || undefined;
  } catch {
    return undefined;
  }
}

/** Git root/commit/remote for a file; empty when it is not in a repo. */
export function gitInfoFor(file: string): GitInfo {
  const root = git(path.dirname(file), ["rev-parse", "--show-toplevel"]);
  if (!root) return {};
  return {
    root,
    commit: git(root, ["rev-parse", "HEAD"]),
    repo: sanitizeRemote(git(root, ["remote", "get-url", "origin"])),
  };
}

/** Drop credentials from remote URLs and normalise SSH remotes to https. */
export function sanitizeRemote(remote: string | undefined): string | undefined {
  if (!remote) return undefined;
  const ssh = /^[\w.-]+@([^:]+):(.+?)(\.git)?$/.exec(remote);
  if (ssh) {
    // SSH host aliases (e.g. gitlab.com-personal) map back to the real host.
    const host = ssh[1].replace(/^(gitlab\.com|github\.com)-.+$/, "$1");
    return `https://${host}/${ssh[2]}`;
  }
  try {
    const url = new URL(remote);
    url.username = "";
    url.password = "";
    return url.toString().replace(/\.git$/, "");
  } catch {
    return undefined;
  }
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** Stable id for a component: `<project>--<name>`. */
export function libraryId(project: string, name: string): string {
  return `${slugify(project)}--${slugify(name)}`;
}

function entryPath(dir: string, id: string): string {
  return path.join(dir, "entries", `${id}.json`);
}

/** Read all stored entries. */
export function readLibrary(dir = LIBRARY_DIR): LibraryComponent[] {
  const entriesDir = path.join(dir, "entries");
  if (!fs.existsSync(entriesDir)) return [];
  return fs
    .readdirSync(entriesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => stripVaultFields(JSON.parse(fs.readFileSync(path.join(entriesDir, f), "utf8")) as LibraryComponent));
}

function overlayPath(dir: string): string {
  return path.join(dir, LOCAL_SUBDIR, "overlay.json");
}

/** Read the local vault overlay; empty when it does not exist. */
export function readLocalOverlay(dir = LIBRARY_DIR): LibraryLocalOverlay {
  const file = overlayPath(dir);
  if (!fs.existsSync(file)) return { ...EMPTY_OVERLAY, entries: {} };
  return JSON.parse(fs.readFileSync(file, "utf8")) as LibraryLocalOverlay;
}

function writeLocalOverlay(dir: string, overlay: LibraryLocalOverlay): void {
  const file = overlayPath(dir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const entries = Object.fromEntries(Object.entries(overlay.entries).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(file, `${JSON.stringify({ ...overlay, entries }, null, 2)}\n`);
}

/** Rebuild `index.json` from the stored entries. Deterministic for unchanged entries. */
export function writeManifest(dir = LIBRARY_DIR): LibraryManifest {
  const components = readLibrary(dir).sort(
    (a, b) => a.source.project.localeCompare(b.source.project) || a.name.localeCompare(b.name)
  );
  const generatedAt = components.reduce((max, c) => (c.updatedAt > max ? c.updatedAt : max), "1970-01-01T00:00:00.000Z");
  const manifest: LibraryManifest = { version: MANIFEST_VERSION, generatedAt, components };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/**
 * Everything except timestamps and the source commit, for change detection: a
 * new commit in the source repo that did not touch the file is not a change.
 */
function signature(entry: LibraryComponent): string {
  const { importedAt: _i, updatedAt: _u, source, ...rest } = entry;
  const { commit: _c, ...sourceRest } = source;
  return JSON.stringify({ ...rest, source: sourceRest });
}

/** Extract components from source files and upsert them into the library. */
export function importComponents(options: ImportOptions): ImportResult {
  const dir = options.dir ?? LIBRARY_DIR;
  const now = (options.now ?? (() => new Date()))().toISOString();
  const existing = new Map(readLibrary(dir).map((e) => [e.id, e]));
  const result: ImportResult = { created: [], updated: [], unchanged: [], skippedFiles: [], localNotes: {} };
  const overlay = options.vaultNotes ? readLocalOverlay(dir) : undefined;

  for (const { file, base } of collectSourceFiles(options.paths)) {
    const code = fs.readFileSync(file, "utf8");
    const extracted = extractComponents(code, file);
    if (extracted.components.length === 0) {
      result.skippedFiles.push(file);
      continue;
    }
    const gitInfo = gitInfoFor(file);
    const root = gitInfo.root ?? base;
    const project = options.project ?? path.basename(root);
    const relPath = path.relative(root, file).split(path.sep).join("/");

    for (const component of extracted.components) {
      let id = libraryId(project, component.name);
      const clash = existing.get(id);
      if (clash && clash.source.path !== relPath) {
        // Same name in another file of the same project: disambiguate by path.
        id = `${id}-${sha256(relPath).slice(0, 6)}`;
      }
      const previous = existing.get(id);

      if (overlay && options.vaultNotes) {
        // Vault data goes to the local overlay only, never into the committed entry.
        const notes = notesForComponent(options.vaultNotes, { name: component.name, id, project });
        result.localNotes[id] = notes.length;
        if (notes.length > 0) {
          const category = notes.find((n) => n.category)?.category;
          const enrichment: LibraryLocalEnrichment = {
            notes: notes.map(({ path: p, title, tags: noteTags, excerpt }) => ({ path: p, title, tags: noteTags, excerpt })),
            ...(category ? { category } : {}),
            tags: Array.from(new Set(notes.flatMap((n) => n.tags).map((t) => t.toLowerCase()))).sort(),
          };
          overlay.entries[id] = enrichment;
        } else {
          delete overlay.entries[id];
        }
      }
      const tags = Array.from(new Set((options.tags ?? []).map((t) => t.toLowerCase()))).sort();

      const entry: LibraryComponent = {
        id,
        name: component.name,
        description: component.description,
        category: options.category ?? previous?.category ?? "uncategorized",
        tags,
        props: component.props,
        propsExtends: component.propsExtends,
        dependencies: extracted.dependencies,
        localImports: extracted.localImports,
        source: {
          project,
          ...(gitInfo.repo ? { repo: gitInfo.repo } : {}),
          path: relPath,
          ...(gitInfo.commit ? { commit: gitInfo.commit } : {}),
          exportKind: component.exportKind,
        },
        code,
        contentHash: sha256(code),
        importedAt: previous?.importedAt ?? now,
        updatedAt: now,
      };

      if (previous && signature(previous) === signature(entry)) {
        result.unchanged.push(previous);
        continue;
      }
      fs.mkdirSync(path.join(dir, "entries"), { recursive: true });
      fs.writeFileSync(entryPath(dir, id), `${JSON.stringify(entry, null, 2)}\n`);
      existing.set(id, entry);
      (previous ? result.updated : result.created).push(entry);
    }
  }

  writeManifest(dir);
  if (overlay) writeLocalOverlay(dir, overlay);
  return result;
}
