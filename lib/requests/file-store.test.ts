import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileRequestStore } from "./file-store";
import { RequestStoreError } from "./store";
import type {
  ComponentRequestPayload,
  RequestValidationResult,
} from "@/lib/contracts";

function componentPayload(id = "badge"): ComponentRequestPayload {
  return {
    kind: "component",
    meta: {
      id,
      name: "Badge",
      category: "data-display",
      description: "A small status descriptor.",
      props: [],
      tags: ["status"],
      version: "1.0.0",
      author: "Agent",
    },
    files: [
      { path: `components/display-components/data/Badge/Badge.tsx`, contents: "export default function Badge(){return null}" },
    ],
  };
}

function passingValidation(): RequestValidationResult {
  return {
    valid: true,
    checkedAt: new Date().toISOString(),
    issues: [],
    checks: [{ name: "schema", passed: true }],
  };
}

describe("FileRequestStore", () => {
  let dir: string;
  let store: FileRequestStore;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "req-store-"));
    store = new FileRequestStore({ dir });
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("creates a request in draft with a single version", async () => {
    const req = await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "We need a badge.",
      payload: componentPayload(),
    });
    expect(req.status).toBe("draft");
    expect(req.versions).toHaveLength(1);
    expect(req.currentVersionId).toBe("v1");
  });

  it("appends a new version on update instead of overwriting", async () => {
    const req = await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "v1",
      payload: componentPayload(),
    });
    const updated = await store.updateRequest(req.id, {
      rationale: "v2 tweaks",
      payload: componentPayload(),
    });
    expect(updated.versions).toHaveLength(2);
    expect(updated.currentVersionId).toBe("v2");
    expect(updated.versions[0].rationale).toBe("v1");
  });

  it("resolves idempotent create to an update of the same request", async () => {
    const a = await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "first",
      payload: componentPayload(),
      idempotencyKey: "badge-key",
    });
    const b = await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "second",
      payload: componentPayload(),
      idempotencyKey: "badge-key",
    });
    expect(b.id).toBe(a.id);
    expect(b.versions).toHaveLength(2);
  });

  it("rejects payload kind that does not match request type", async () => {
    await expect(
      store.createRequest({
        type: "new_theme",
        title: "Bad",
        rationale: "x",
        payload: componentPayload(),
      })
    ).rejects.toBeInstanceOf(RequestStoreError);
  });

  it("moves to pending_review on passing validation, and blocks edits after", async () => {
    const req = await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "x",
      payload: componentPayload(),
    });
    const validated = await store.setValidationResult(
      req.id,
      req.currentVersionId,
      passingValidation()
    );
    expect(validated.status).toBe("pending_review");
    await expect(
      store.updateRequest(req.id, { rationale: "late", payload: componentPayload() })
    ).rejects.toBeInstanceOf(RequestStoreError);
  });

  it("rejects illegal status transitions", async () => {
    const req = await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "x",
      payload: componentPayload(),
    });
    await expect(store.setStatus(req.id, "published")).rejects.toBeInstanceOf(
      RequestStoreError
    );
  });

  it("regenerates the manifest with all requests", async () => {
    await store.createRequest({
      type: "new_component",
      title: "Add Badge",
      rationale: "x",
      payload: componentPayload(),
    });
    const manifest = JSON.parse(
      fs.readFileSync(path.join(dir, "index.json"), "utf8")
    );
    expect(manifest.requests).toHaveLength(1);
    expect(manifest.version).toBe(1);
  });
});
