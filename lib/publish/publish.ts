/**
 * Approval -> published flow.
 *
 * Converts an approved request's current version into repo changes:
 * - component requests write `<group>/<Name>/*` files and update `index.json`
 * - theme requests upsert into `data/themes/custom.json` (merged by lib/themes.ts)
 *
 * The payload is re-validated before any write; nothing is published if it does
 * not pass. Target paths are overridable so tests can publish into temp dirs.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type {
  ComponentIndexFile,
  ComponentMetaContract,
  ComponentRequest,
  ProposedFile,
  ThemeContract,
  ValidationIssue,
} from "@/lib/contracts";
import { buildValidationResult } from "@/lib/contracts";
import { validatePayload } from "@/lib/validation";
import { assertSafeRelativePath } from "@/lib/registry/paths";
import {
  COMPONENTS_INDEX_PATH,
  CUSTOM_THEMES_PATH,
  DISPLAY_COMPONENTS_DIR,
  REPO_ROOT,
  normalizeIndexPath,
} from "@/lib/registry/paths";
import type { RequestStore } from "@/lib/requests";

export interface PublishOptions {
  /** When true, compute changes but do not write files or update status. */
  dryRun?: boolean;
  /** Override the display-components directory (tests). */
  componentsDir?: string;
  /** Override the components index path (tests). */
  indexPath?: string;
  /** Override the custom themes registry path (tests). */
  customThemesPath?: string;
  /** Repo root for path-safety resolution (defaults to the real repo root). */
  repoRoot?: string;
}

export interface PublishResult {
  ok: boolean;
  requestId: string;
  written: string[];
  indexUpdated: boolean;
  status: ComponentRequest["status"];
  issues?: ValidationIssue[];
  error?: string;
}

interface CustomThemesFile {
  version: number;
  themes: ThemeContract[];
}

/** Publish an approved request. Returns a structured result (never throws for expected failures). */
export async function publishRequest(
  store: RequestStore,
  id: string,
  options: PublishOptions = {}
): Promise<PublishResult> {
  const request = await store.getRequest(id);
  if (!request) {
    return failure(id, "not_found", `Request ${id} not found.`);
  }
  if (request.status !== "approved") {
    return failure(
      id,
      "not_approved",
      `Request ${id} must be "approved" to publish (current: "${request.status}").`,
      request.status
    );
  }

  const current = request.versions.find(
    (v) => v.id === request.currentVersionId
  );
  if (!current) {
    return failure(id, "no_version", "Request has no current version.", request.status);
  }

  // Re-validate before writing anything.
  const { issues, checks } = validatePayload(
    request.type,
    current.payload,
    request.targetId
  );
  const validation = buildValidationResult(checks, issues, new Date().toISOString());
  if (!validation.valid) {
    return {
      ok: false,
      requestId: id,
      written: [],
      indexUpdated: false,
      status: request.status,
      issues: validation.issues,
      error: "Validation failed; nothing was published.",
    };
  }

  const written: string[] = [];
  let indexUpdated = false;

  if (current.payload.kind === "component") {
    const result = await publishComponent(current.payload, options);
    written.push(...result.written);
    indexUpdated = result.indexUpdated;
  } else {
    const result = await publishTheme(current.payload.theme, options);
    written.push(...result.written);
  }

  let status: ComponentRequest["status"] = request.status;
  if (!options.dryRun) {
    const updated = await store.setStatus(id, "published");
    status = updated.status;
  }

  return { ok: true, requestId: id, written, indexUpdated, status };
}

async function publishComponent(
  payload: { meta: ComponentMetaContract; files: ProposedFile[] },
  options: PublishOptions
): Promise<{ written: string[]; indexUpdated: boolean }> {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const componentsDir = options.componentsDir ?? DISPLAY_COMPONENTS_DIR;
  const indexPath = options.indexPath ?? COMPONENTS_INDEX_PATH;
  const written: string[] = [];

  // Write each proposed file (path safety enforced relative to repo root).
  for (const file of payload.files) {
    const safeRel = assertSafeRelativePath(file.path);
    const abs = path.resolve(repoRoot, safeRel);
    if (!options.dryRun) {
      await fsp.mkdir(path.dirname(abs), { recursive: true });
      await fsp.writeFile(abs, file.contents, "utf8");
    }
    written.push(safeRel);
  }

  // Always write the canonical meta.json from payload.meta to avoid drift.
  const groupRel = deriveComponentDirRel(payload.files);
  if (groupRel) {
    const metaRel = `${groupRel}/${payload.meta.name}.meta.json`;
    const metaAbs = path.resolve(repoRoot, metaRel);
    if (!options.dryRun) {
      await fsp.mkdir(path.dirname(metaAbs), { recursive: true });
      await fsp.writeFile(
        metaAbs,
        `${JSON.stringify(payload.meta, null, 2)}\n`,
        "utf8"
      );
    }
    if (!written.includes(metaRel)) written.push(metaRel);
  }

  const indexUpdated = await upsertIndexEntry(
    indexPath,
    payload.meta,
    groupRel,
    componentsDir,
    repoRoot,
    options.dryRun ?? false
  );

  return { written, indexUpdated };
}

/** Derive the component directory (relative to repo root) from the .tsx file. */
function deriveComponentDirRel(files: ProposedFile[]): string | undefined {
  const main = files.find(
    (f) => f.path.endsWith(".tsx") && !f.path.endsWith(".examples.tsx")
  );
  if (!main) return undefined;
  return path.posix.dirname(assertSafeRelativePath(main.path));
}

async function upsertIndexEntry(
  indexPath: string,
  meta: ComponentMetaContract,
  groupRel: string | undefined,
  componentsDir: string,
  repoRoot: string,
  dryRun: boolean
): Promise<boolean> {
  if (!groupRel) return false;
  let index: ComponentIndexFile = { blacklist: [], components: [] };
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(await fsp.readFile(indexPath, "utf8")) as ComponentIndexFile;
  }
  const exists = index.components.some(
    (c) => c.id.toLowerCase() === meta.id.toLowerCase()
  );
  if (exists) return false;

  // index paths are relative to the components dir, "./group/Name/".
  const dirAbs = path.resolve(repoRoot, groupRel);
  const relToComponents = normalizeIndexPath(
    path.relative(componentsDir, dirAbs).split(path.sep).join("/")
  );
  index.components.push({
    id: meta.id.toLowerCase(),
    name: meta.name,
    path: `./${relToComponents}/`,
  });
  if (!dryRun) {
    await fsp.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  }
  return true;
}

async function publishTheme(
  theme: ThemeContract,
  options: PublishOptions
): Promise<{ written: string[] }> {
  const customPath = options.customThemesPath ?? CUSTOM_THEMES_PATH;
  let file: CustomThemesFile = { version: 1, themes: [] };
  if (fs.existsSync(customPath)) {
    file = JSON.parse(await fsp.readFile(customPath, "utf8")) as CustomThemesFile;
  }
  const idx = file.themes.findIndex((t) => t.id === theme.id);
  if (idx >= 0) {
    file.themes[idx] = theme; // theme update
  } else {
    file.themes.push(theme); // new theme
  }
  if (!options.dryRun) {
    await fsp.mkdir(path.dirname(customPath), { recursive: true });
    await fsp.writeFile(customPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  }
  return { written: [path.relative(options.repoRoot ?? REPO_ROOT, customPath)] };
}

function failure(
  id: string,
  code: string,
  message: string,
  status: ComponentRequest["status"] = "draft"
): PublishResult {
  return {
    ok: false,
    requestId: id,
    written: [],
    indexUpdated: false,
    status,
    error: `${code}: ${message}`,
  };
}
