import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileRequestStore } from "@/lib/requests";
import { createHandlers, ToolInputError, type McpHandlers } from "./handlers";
import type {
  ComponentRequest,
  RequestValidationResult,
} from "@/lib/contracts";
import { getTheme } from "@/lib/registry/themes";

const BADGE_SRC = "export default function Badge(){ return null }";

function goodComponentArgs() {
  return {
    title: "Add Badge",
    rationale: "Need a badge.",
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
      {
        path: "components/display-components/data/Badge/Badge.meta.json",
        contents: "{}",
      },
    ],
    idempotencyKey: "badge-test",
  };
}

type CreateResult = {
  request: ComponentRequest;
  validation: RequestValidationResult;
};

describe("MCP handlers", () => {
  let dir: string;
  let handlers: McpHandlers;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-"));
    handlers = createHandlers(new FileRequestStore({ dir }));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("lists published components", async () => {
    const res = (await handlers.list_components({})) as {
      components: Array<{ id: string }>;
    };
    expect(res.components.map((c) => c.id)).toContain("button");
  });

  it("returns component code for a known id", async () => {
    const res = (await handlers.get_component_code({ id: "button" })) as {
      source: string;
    };
    expect(res.source.length).toBeGreaterThan(0);
  });

  it("throws a safe error for an unknown component", async () => {
    await expect(handlers.get_component({ id: "nope" })).rejects.toBeInstanceOf(
      ToolInputError
    );
  });

  it("creates a valid component request and marks it pending_review", async () => {
    const res = (await handlers.create_component_request(
      goodComponentArgs()
    )) as CreateResult;
    expect(res.validation.valid).toBe(true);
    expect(res.request.status).toBe("pending_review");
  });

  it("creates an invalid request (path traversal) as validation_failed", async () => {
    const args = goodComponentArgs();
    args.files[0].path = "../../etc/passwd";
    const res = (await handlers.create_component_request(args)) as CreateResult;
    expect(res.validation.valid).toBe(false);
    expect(res.request.status).toBe("validation_failed");
  });

  it("updates an existing request by appending a version", async () => {
    const created = (await handlers.create_component_request(
      goodComponentArgs()
    )) as CreateResult;
    // Force back to editable by re-creating via idempotency is blocked once
    // pending_review; instead update a fresh draft request.
    const draftArgs = { ...goodComponentArgs(), idempotencyKey: "draft-key" };
    const draft = (await handlers.create_component_request(
      // give it a syntax error so it stays editable (validation_failed)
      { ...draftArgs, files: [{ path: draftArgs.files[0].path, contents: "function(" }, draftArgs.files[1]] }
    )) as CreateResult;
    expect(draft.request.status).toBe("validation_failed");

    const updated = (await handlers.update_component_request({
      id: draft.request.id,
      rationale: "Fix syntax",
      meta: draftArgs.meta,
      files: draftArgs.files,
    })) as CreateResult;
    expect(updated.request.versions.length).toBe(2);
    expect(updated.validation.valid).toBe(true);
    expect(created.request.id).not.toBe(updated.request.id);
  });

  it("creates a theme request and validates token completeness", async () => {
    const theme = structuredClone(getTheme("modern")!);
    theme.id = "ocean-test";
    theme.name = "Ocean Test";
    const res = (await handlers.create_theme_request({
      title: "Add Ocean",
      rationale: "Blue palette",
      theme,
    })) as CreateResult;
    expect(res.validation.valid).toBe(true);
    expect(res.request.type).toBe("new_theme");
  });
});
