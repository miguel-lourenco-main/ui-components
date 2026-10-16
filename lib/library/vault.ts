/**
 * Obsidian vault enrichment for library entries (Node-only).
 *
 * A note is linked to a component when its frontmatter names it:
 *
 * ```yaml
 * ---
 * component: Button            # or  components: [Button, IconButton]
 * project: my-cv               # optional: only match components from this project
 * category: forms              # optional: becomes the entry's category
 * tags: [interactive, cta]     # optional: merged into the entry's tags
 * ---
 * ```
 *
 * Only the title, tags, and first paragraph of a matching note are copied into
 * the library; the rest of the note stays in the vault.
 */
import fs from "node:fs";
import path from "node:path";
import type { LibraryNote } from "@/lib/contracts";

export interface VaultNote extends LibraryNote {
  /** Component names/ids the note declares. Lowercased. */
  components: string[];
  project?: string;
  category?: string;
}

const SKIP_DIRS = new Set([".obsidian", ".trash", ".git", "node_modules"]);
const EXCERPT_MAX = 280;

type Frontmatter = Record<string, string | string[]>;

/** Minimal YAML frontmatter reader: scalars, inline `[a, b]` lists, and `- item` block lists. */
export function parseFrontmatter(markdown: string): { data: Frontmatter; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(markdown);
  if (!match) return { data: {}, body: markdown };
  const data: Frontmatter = {};
  let listKey: string | null = null;
  for (const raw of match[1].split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(raw);
    if (item && listKey) {
      (data[listKey] as string[]).push(unquote(item[1]));
      continue;
    }
    const pair = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(raw);
    if (!pair) continue;
    const [, key, value] = pair;
    listKey = null;
    if (value === "") {
      data[key] = [];
      listKey = key;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => unquote(v))
        .filter(Boolean);
    } else {
      data[key] = unquote(value);
    }
  }
  return { data, body: markdown.slice(match[0].length) };
}

function unquote(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "").trim();
}

function asList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Parse one note; returns null when it does not declare any component. */
export function parseVaultNote(relPath: string, markdown: string): VaultNote | null {
  const { data, body } = parseFrontmatter(markdown);
  const components = [...asList(data.component), ...asList(data.components)]
    .map((c) => c.replace(/^\[\[|\]\]$/g, "").trim().toLowerCase())
    .filter(Boolean);
  if (components.length === 0) return null;

  const heading = /^#\s+(.+)$/m.exec(body);
  const title = heading?.[1].trim() || path.basename(relPath, ".md");
  const inlineTags = Array.from(body.matchAll(/(?:^|\s)#([A-Za-z][\w/-]*)/g), (m) => m[1]);
  const tags = Array.from(new Set([...asList(data.tags), ...inlineTags].map((t) => t.replace(/^#/, ""))));

  const paragraph =
    body
      .split(/\r?\n\s*\r?\n/)
      .map((block) => block.trim())
      .find((block) => block && !block.startsWith("#") && !block.startsWith("```")) ?? "";
  const flat = paragraph.replace(/\s+/g, " ");
  const excerpt = flat.length > EXCERPT_MAX ? `${flat.slice(0, EXCERPT_MAX - 1).trimEnd()}…` : flat;

  const project = typeof data.project === "string" ? data.project : undefined;
  const category = typeof data.category === "string" ? data.category : undefined;
  return { path: relPath, title, tags, excerpt, components, project, category };
}

/** Recursively read every Markdown note in the vault that declares a component. */
export function readVaultNotes(vaultDir: string): VaultNote[] {
  const notes: VaultNote[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const abs = path.join(dir, entry.name);
        const rel = path.relative(vaultDir, abs).split(path.sep).join("/");
        const note = parseVaultNote(rel, fs.readFileSync(abs, "utf8"));
        if (note) notes.push(note);
      }
    }
  };
  walk(vaultDir);
  return notes.sort((a, b) => a.path.localeCompare(b.path));
}

/** Notes that declare this component (by name or id), honouring an optional `project` filter. */
export function notesForComponent(
  notes: VaultNote[],
  component: { name: string; id: string; project: string }
): VaultNote[] {
  const keys = new Set([component.name.toLowerCase(), component.id.toLowerCase()]);
  return notes.filter(
    (note) =>
      note.components.some((c) => keys.has(c)) &&
      (!note.project || note.project.toLowerCase() === component.project.toLowerCase())
  );
}
