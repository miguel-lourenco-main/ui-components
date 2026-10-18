/**
 * CLI: ingest components from another project's source into the library.
 *
 * Usage:
 *   pnpm library:import <file-or-dir>... [--project <name>] [--category <name>]
 *                       [--tag <tag>]... [--vault <obsidian-vault-dir>] [--dry-run]
 *
 * Scans .tsx/.jsx files (skipping tests, stories, node_modules, build output),
 * extracts exported React components and their props, optionally links
 * Obsidian notes whose frontmatter names the component, and upserts entries
 * into data/library/. Re-running on the same sources updates entries in place.
 * Vault data is private: it goes to the gitignored data/library/local/overlay.json,
 * which only `next dev` reads. Committed entries hold code-derived data only.
 * With --dry-run, prints what would be imported and writes nothing.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { importComponents } from "@/lib/library/store";
import { readVaultNotes } from "@/lib/library/vault";

function main(): void {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      project: { type: "string" },
      category: { type: "string" },
      tag: { type: "string", multiple: true },
      vault: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help || positionals.length === 0) {
    console.log(
      "Usage: pnpm library:import <file-or-dir>... [--project <name>] [--category <name>] [--tag <tag>]... [--vault <dir>] [--dry-run]"
    );
    if (positionals.length === 0 && !values.help) process.exitCode = 1;
    return;
  }

  for (const p of positionals) {
    if (!fs.existsSync(p)) {
      console.error(`Path not found: ${p}`);
      process.exitCode = 1;
      return;
    }
  }

  const vaultNotes = values.vault ? readVaultNotes(path.resolve(values.vault)) : undefined;
  if (vaultNotes) console.log(`Vault: ${vaultNotes.length} note(s) declare a component`);

  const dryDir = values["dry-run"] ? fs.mkdtempSync(path.join(os.tmpdir(), "library-dry-run-")) : undefined;
  if (dryDir) {
    // Seed the scratch copy so dry runs report created vs updated accurately.
    const real = path.join(process.cwd(), "data", "library", "entries");
    if (fs.existsSync(real)) fs.cpSync(real, path.join(dryDir, "entries"), { recursive: true });
  }

  try {
    const result = importComponents({
      paths: positionals,
      project: values.project,
      category: values.category,
      tags: values.tag,
      vaultNotes,
      dir: dryDir,
    });
    const line = (label: string, items: { id: string; source: { path: string } }[]) => {
      for (const item of items) {
        const count = result.localNotes[item.id] ?? 0;
        const notes = count ? ` (+${count} local note${count > 1 ? "s" : ""})` : "";
        console.log(`  ${label} ${item.id}  ${item.source.path}${notes}`);
      }
    };
    line("created  ", result.created);
    line("updated  ", result.updated);
    line("unchanged", result.unchanged);
    console.log(
      `\n${values["dry-run"] ? "[dry run] " : ""}${result.created.length} created, ${result.updated.length} updated, ` +
        `${result.unchanged.length} unchanged, ${result.skippedFiles.length} file(s) without components`
    );
    if (vaultNotes && !values["dry-run"]) {
      console.log("Vault enrichment written to data/library/local/overlay.json (gitignored, dev only).");
    }
  } finally {
    if (dryDir) fs.rmSync(dryDir, { recursive: true, force: true });
  }
}

main();
