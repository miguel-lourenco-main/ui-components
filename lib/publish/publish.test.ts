import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileRequestStore } from "@/lib/requests";
import { publishRequest } from "./publish";
import { getTheme } from "@/lib/registry/themes";
import type {
  ComponentRequestPayload,
  ThemeRequestPayload,
} from "@/lib/contracts";

const BADGE_SRC = "export default function Badge(){ return null }";

function badgePayload(): ComponentRequestPayload {
  return {
    kind: "component",
    meta: {
      id: "badge",
      name: "Badge",
      category: "data-display",
      description: "Status descriptor.",
      props: [],
      tags: ["status"],
      version: "1.0.0",
      author: "Agent",
      code: BADGE_SRC,
    },
    files: [
      {
        path: "components/display-components/data/Badge/Badge.tsx",
        contents: BADGE_SRC,
      },
    ],
  };
}

async function approvedComponentRequest(store: FileRequestStore) {
  const req = await store.createRequest({
    type: "new_component",
    title: "Add Badge",
    rationale: "x",
    payload: badgePayload(),
  });
  await store.setValidationResult(req.id, req.currentVersionId, {
    valid: true,
    checkedAt: new Date().toISOString(),
    issues: [],
    checks: [{ name: "schema", passed: true }],
  });
  await store.setReviewDecision(req.id, {
    decision: "approved",
    reviewer: "me",
    decidedAt: new Date().toISOString(),
  });
  return req.id;
}

describe("publishRequest (component)", () => {
  let storeDir: string;
  let repoRoot: string;
  let store: FileRequestStore;

  beforeEach(() => {
    storeDir = fs.mkdtempSync(path.join(os.tmpdir(), "pub-store-"));
    repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pub-repo-"));
    store = new FileRequestStore({ dir: storeDir });
  });

  afterEach(() => {
    fs.rmSync(storeDir, { recursive: true, force: true });
    fs.rmSync(repoRoot, { recursive: true, force: true });
  });

  function opts(dryRun: boolean) {
    return {
      dryRun,
      repoRoot,
      componentsDir: path.join(repoRoot, "components", "display-components"),
      indexPath: path.join(
        repoRoot,
        "components",
        "display-components",
        "index.json"
      ),
    };
  }

  it("requires approved status", async () => {
    const req = await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "x",
      payload: badgePayload(),
    });
    const result = await publishRequest(store, req.id, opts(false));
    expect(result.ok).toBe(false);
    expect(result.error).toContain("approved");
  });

  it("dry run writes nothing", async () => {
    const id = await approvedComponentRequest(store);
    const result = await publishRequest(store, id, opts(true));
    expect(result.ok).toBe(true);
    expect(
      fs.existsSync(
        path.join(repoRoot, "components/display-components/data/Badge/Badge.tsx")
      )
    ).toBe(false);
    const refreshed = await store.getRequest(id);
    expect(refreshed?.status).toBe("approved");
  });

  it("apply writes files, updates index, and marks published", async () => {
    const id = await approvedComponentRequest(store);
    const result = await publishRequest(store, id, opts(false));
    expect(result.ok).toBe(true);
    expect(result.indexUpdated).toBe(true);
    expect(result.status).toBe("published");

    const tsx = path.join(
      repoRoot,
      "components/display-components/data/Badge/Badge.tsx"
    );
    const meta = path.join(
      repoRoot,
      "components/display-components/data/Badge/Badge.meta.json"
    );
    expect(fs.existsSync(tsx)).toBe(true);
    expect(fs.existsSync(meta)).toBe(true);

    const index = JSON.parse(
      fs.readFileSync(
        path.join(repoRoot, "components/display-components/index.json"),
        "utf8"
      )
    );
    expect(index.components.some((c: { id: string }) => c.id === "badge")).toBe(
      true
    );
  });
});

describe("publishRequest (theme)", () => {
  let storeDir: string;
  let themeDir: string;
  let store: FileRequestStore;
  let customPath: string;

  beforeEach(() => {
    storeDir = fs.mkdtempSync(path.join(os.tmpdir(), "pub-theme-"));
    themeDir = fs.mkdtempSync(path.join(os.tmpdir(), "pub-theme-out-"));
    store = new FileRequestStore({ dir: storeDir });
    customPath = path.join(themeDir, "custom.json");
  });

  afterEach(() => {
    fs.rmSync(storeDir, { recursive: true, force: true });
    fs.rmSync(themeDir, { recursive: true, force: true });
  });

  it("upserts a new theme into the custom registry", async () => {
    const theme = structuredClone(getTheme("modern")!);
    theme.id = "ocean-pub";
    theme.name = "Ocean Pub";
    const payload: ThemeRequestPayload = { kind: "theme", theme };

    const req = await store.createRequest({
      type: "new_theme",
      title: "Add Ocean",
      rationale: "x",
      payload,
    });
    await store.setValidationResult(req.id, req.currentVersionId, {
      valid: true,
      checkedAt: new Date().toISOString(),
      issues: [],
      checks: [{ name: "theme", passed: true }],
    });
    await store.setReviewDecision(req.id, {
      decision: "approved",
      reviewer: "me",
      decidedAt: new Date().toISOString(),
    });

    const result = await publishRequest(store, req.id, {
      customThemesPath: customPath,
    });
    expect(result.ok).toBe(true);
    const file = JSON.parse(fs.readFileSync(customPath, "utf8"));
    expect(file.themes.some((t: { id: string }) => t.id === "ocean-pub")).toBe(
      true
    );
  });
});
