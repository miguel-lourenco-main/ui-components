import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LibraryManifest } from "@/lib/contracts";
import { importComponents, libraryId, sanitizeRemote } from "./store";
import { parseFrontmatter, parseVaultNote, readVaultNotes } from "./vault";

let tmp: string;
let libDir: string;
let srcDir: string;

const BADGE = `
/** Status pill. */
export default function Badge({ tone = "info" }: { tone?: "info" | "warn" }) {
  return <span data-tone={tone} />;
}
`;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "library-test-"));
  libDir = path.join(tmp, "library");
  srcDir = path.join(tmp, "src");
  fs.mkdirSync(path.join(srcDir, "components"), { recursive: true });
  fs.mkdirSync(path.join(srcDir, "node_modules", "pkg"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "components", "Badge.tsx"), BADGE);
  fs.writeFileSync(path.join(srcDir, "components", "Badge.test.tsx"), BADGE);
  fs.writeFileSync(path.join(srcDir, "components", "util.tsx"), "export const x = 1;");
  fs.writeFileSync(path.join(srcDir, "node_modules", "pkg", "Ignored.tsx"), BADGE);
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const clock = (iso: string) => () => new Date(iso);
const manifest = () =>
  JSON.parse(fs.readFileSync(path.join(libDir, "index.json"), "utf8")) as LibraryManifest;

describe("importComponents", () => {
  it("creates entries, skips tests/node_modules, and writes the manifest", () => {
    const result = importComponents({
      paths: [srcDir],
      project: "demo",
      category: "display",
      dir: libDir,
      now: clock("2026-01-01T00:00:00.000Z"),
    });
    expect(result.created.map((c) => c.id)).toEqual(["demo--badge"]);
    expect(result.skippedFiles.map((f) => path.basename(f))).toEqual(["util.tsx"]);

    const [entry] = manifest().components;
    expect(entry).toMatchObject({
      id: "demo--badge",
      name: "Badge",
      description: "Status pill.",
      category: "display",
      source: { project: "demo", exportKind: "default" },
      importedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(entry.source.path).toMatch(/components\/Badge\.tsx$/);
    expect(entry.code).toBe(BADGE);
    expect(fs.existsSync(path.join(libDir, "entries", "demo--badge.json"))).toBe(true);
  });

  it("is idempotent: re-import without changes keeps timestamps, a source change updates in place", () => {
    importComponents({ paths: [srcDir], project: "demo", dir: libDir, now: clock("2026-01-01T00:00:00.000Z") });
    const again = importComponents({ paths: [srcDir], project: "demo", dir: libDir, now: clock("2026-02-01T00:00:00.000Z") });
    expect(again.unchanged).toHaveLength(1);
    expect(manifest().generatedAt).toBe("2026-01-01T00:00:00.000Z");

    fs.writeFileSync(path.join(srcDir, "components", "Badge.tsx"), BADGE.replace("Status pill.", "Status chip."));
    const changed = importComponents({ paths: [srcDir], project: "demo", dir: libDir, now: clock("2026-03-01T00:00:00.000Z") });
    expect(changed.updated.map((c) => c.id)).toEqual(["demo--badge"]);
    const [entry] = manifest().components;
    expect(entry).toMatchObject({
      description: "Status chip.",
      importedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    });
  });

  it("enriches entries from matching vault notes", () => {
    const vault = path.join(tmp, "vault");
    fs.mkdirSync(path.join(vault, "UI"), { recursive: true });
    fs.mkdirSync(path.join(vault, ".obsidian"), { recursive: true });
    fs.writeFileSync(
      path.join(vault, "UI", "Badge.md"),
      "---\ncomponent: Badge\nproject: demo\ncategory: feedback\ntags:\n  - status\n---\n# Badge notes\n\nUsed on the dashboard for #alerts.\n\nMore text.\n"
    );
    fs.writeFileSync(path.join(vault, "UI", "Other.md"), "---\ncomponent: Badge\nproject: elsewhere\n---\nNot ours.\n");
    fs.writeFileSync(path.join(vault, "Plain.md"), "# No frontmatter\n");
    fs.writeFileSync(path.join(vault, ".obsidian", "Badge.md"), "---\ncomponent: Badge\n---\nconfig\n");

    const notes = readVaultNotes(vault);
    expect(notes.map((n) => n.path)).toEqual(["UI/Badge.md", "UI/Other.md"]);

    importComponents({ paths: [srcDir], project: "demo", dir: libDir, vaultNotes: notes });
    const [entry] = manifest().components;
    expect(entry.category).toBe("feedback");
    expect(entry.tags).toEqual(["alerts", "status"]);
    expect(entry.notes).toEqual([
      { path: "UI/Badge.md", title: "Badge notes", tags: ["status", "alerts"], excerpt: "Used on the dashboard for #alerts." },
    ]);
  });
});

describe("vault parsing", () => {
  it("parses scalar, inline-list and block-list frontmatter", () => {
    const { data, body } = parseFrontmatter("---\na: 'x'\nb: [one, \"two\"]\nc:\n  - three\n---\nbody");
    expect(data).toEqual({ a: "x", b: ["one", "two"], c: ["three"] });
    expect(body).toBe("body");
  });

  it("ignores notes that declare no component and accepts wiki-link names", () => {
    expect(parseVaultNote("a.md", "---\ntags: [x]\n---\ntext")).toBeNull();
    expect(parseVaultNote("b.md", "---\ncomponents: [\"[[Card]]\", Button]\n---\ntext")?.components).toEqual(["card", "button"]);
  });
});

describe("helpers", () => {
  it("builds stable ids and strips credentials / SSH aliases from remotes", () => {
    expect(libraryId("My CV", "ProjectCard")).toBe("my-cv--projectcard");
    expect(sanitizeRemote("git@gitlab.com-personal:public-work4/my-cv.git")).toBe("https://gitlab.com/public-work4/my-cv");
    expect(sanitizeRemote("https://user:token@gitlab.com/a/b.git")).toBe("https://gitlab.com/a/b");
    expect(sanitizeRemote(undefined)).toBeUndefined();
  });
});
