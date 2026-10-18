import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { LibraryLocalOverlay } from "@/lib/contracts";
import { EMPTY_OVERLAY, VAULT_FIELDS, applyLocalOverlay } from "./overlay";

const entry = { id: "demo--badge", category: "display", tags: ["cta"], description: "" };

const overlay: LibraryLocalOverlay = {
  version: 1,
  entries: {
    "demo--badge": {
      notes: [{ path: "UI/Badge.md", title: "Badge notes", tags: ["Status"], excerpt: "Used on the dashboard." }],
      category: "feedback",
      tags: ["Status", "cta"],
    },
  },
};

describe("applyLocalOverlay", () => {
  it("merges notes, tags, category and a fallback description when the overlay has the entry", () => {
    expect(applyLocalOverlay(entry, overlay)).toEqual({
      id: "demo--badge",
      category: "feedback",
      tags: ["cta", "status"],
      description: "Used on the dashboard.",
      notes: overlay.entries["demo--badge"].notes,
    });
  });

  it("keeps a JSDoc description over the note excerpt", () => {
    expect(applyLocalOverlay({ ...entry, description: "From source." }, overlay).description).toBe("From source.");
  });

  it("returns the committed entry with no notes when there is no overlay or no match", () => {
    expect(applyLocalOverlay(entry, EMPTY_OVERLAY)).toEqual({ ...entry, notes: [] });
    expect(applyLocalOverlay(entry, undefined)).toEqual({ ...entry, notes: [] });
    expect(applyLocalOverlay({ ...entry, id: "other" }, overlay).notes).toEqual([]);
  });
});

describe("committed library data", () => {
  // Guards for the data in the repo: what the public build serves.
  const root = path.resolve(__dirname, "../../data/library");
  const files = [
    path.join(root, "index.json"),
    ...fs.readdirSync(path.join(root, "entries")).map((f) => path.join(root, "entries", f)),
  ];

  it("holds no vault-derived fields (notes live in the gitignored local overlay)", () => {
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      for (const field of VAULT_FIELDS) expect(text, file).not.toContain(`"${field}"`);
      expect(text, file).not.toContain('"excerpt"');
    }
  });

  it("keeps the manifest light and in sync with the per-entry files", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "index.json"), "utf8"));
    expect(manifest.version).toBe(2);
    const ids = manifest.components.map((c: { id: string }) => c.id).sort();
    const entryIds = fs.readdirSync(path.join(root, "entries")).map((f) => f.replace(/\.json$/, "")).sort();
    expect(ids).toEqual(entryIds);
    for (const row of manifest.components) {
      expect(row).not.toHaveProperty("code");
      expect(row).not.toHaveProperty("props");
      expect(Array.isArray(row.propNames)).toBe(true);
    }
  });

  it("ships an empty overlay for builds and tests", () => {
    const empty = JSON.parse(fs.readFileSync(path.resolve(__dirname, "empty-overlay.json"), "utf8"));
    expect(empty).toEqual(EMPTY_OVERLAY);
  });
});
