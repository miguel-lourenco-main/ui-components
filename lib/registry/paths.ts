/**
 * Filesystem path helpers and safety utilities for Node-side registry/request
 * access. These run in the MCP server, validation scripts, and tests (never in
 * the browser bundle).
 */
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Absolute path to the repository root (two levels up from `lib/registry`). */
export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

/** Root directory of the published display-components registry. */
export const DISPLAY_COMPONENTS_DIR = path.join(
  REPO_ROOT,
  "components",
  "display-components"
);

/** Path to the component index manifest. */
export const COMPONENTS_INDEX_PATH = path.join(
  DISPLAY_COMPONENTS_DIR,
  "index.json"
);

/** Directory where file-backed requests are stored. */
export const REQUESTS_DIR = path.join(REPO_ROOT, "data", "requests");

/** Path to the generated requests manifest consumed by the UI. */
export const REQUESTS_MANIFEST_PATH = path.join(REQUESTS_DIR, "index.json");

/** Path to the published custom themes registry merged by `lib/themes.ts`. */
export const CUSTOM_THEMES_PATH = path.join(
  REPO_ROOT,
  "data",
  "themes",
  "custom.json"
);

/** Normalize an index.json path entry (e.g. "./buttons/Button/" -> "buttons/Button"). */
export function normalizeIndexPath(p: string): string {
  return p.replace(/^\.\/+/, "").replace(/\/+$/, "");
}

/**
 * Validate that a proposed, repo-relative path is safe to write:
 * - not absolute
 * - no parent traversal segments
 * - resolves to a location inside the repo root
 *
 * Returns the normalized POSIX-style relative path, or throws on violation.
 */
export function assertSafeRelativePath(relPath: string): string {
  if (typeof relPath !== "string" || relPath.trim() === "") {
    throw new Error("Path must be a non-empty string");
  }
  if (path.isAbsolute(relPath)) {
    throw new Error(`Absolute paths are not allowed: ${relPath}`);
  }
  const segments = relPath.split(/[\\/]+/);
  if (segments.includes("..")) {
    throw new Error(`Path traversal is not allowed: ${relPath}`);
  }
  const resolved = path.resolve(REPO_ROOT, relPath);
  const rootWithSep = REPO_ROOT.endsWith(path.sep)
    ? REPO_ROOT
    : REPO_ROOT + path.sep;
  if (resolved !== REPO_ROOT && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Path escapes the repository root: ${relPath}`);
  }
  return segments.filter(Boolean).join("/");
}

/** Non-throwing variant: returns true when the path is safe. */
export function isSafeRelativePath(relPath: string): boolean {
  try {
    assertSafeRelativePath(relPath);
    return true;
  } catch {
    return false;
  }
}
