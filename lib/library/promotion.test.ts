import { describe, expect, it } from "vitest";
import type { ComponentRequest, LibraryComponent, RequestStatus } from "@/lib/contracts";
import {
  buildPromotionRequest,
  promotionBlocker,
  promotionKey,
  promotionState,
  registryIdsFrom,
} from "./promotion";

const entry: LibraryComponent = {
  id: "my-cv--button",
  name: "Button",
  description: "",
  category: "actions",
  tags: ["cta"],
  props: [
    { name: "variant", type: "enum", options: ["a", "b"], required: false, defaultValue: "a", tsType: '"a" | "b"' },
    { name: "onClick", type: "function", required: false, tsType: "() => void", defaultExpression: "noop" },
  ],
  propsExtends: ['React.ComponentProps<"button">'],
  dependencies: ["class-variance-authority"],
  localImports: ["../../lib/utils"],
  source: {
    project: "my-cv",
    repo: "https://gitlab.com/public-work4/my-cv",
    path: "components/ui/button.tsx",
    commit: "c706fb8a0000",
    exportKind: "named",
  },
  code: "export function Button() { return <button /> }\n",
  contentHash: "abcdef0123456789",
  importedAt: "2026-10-16T00:00:00.000Z",
  updatedAt: "2026-10-16T00:00:00.000Z",
};

function request(status: RequestStatus, overrides: Partial<ComponentRequest> = {}): ComponentRequest {
  return {
    id: `req-${status}`,
    type: "new_component",
    status,
    title: "t",
    currentVersionId: "v1",
    versions: [],
    createdAt: "2026-10-17T00:00:00.000Z",
    updatedAt: "2026-10-17T00:00:00.000Z",
    idempotencyKey: promotionKey(entry),
    origin: { kind: "library", libraryId: entry.id, project: "my-cv", path: entry.source.path, contentHash: entry.contentHash },
    ...overrides,
  };
}

describe("buildPromotionRequest", () => {
  it("pre-fills a new_component request from the entry: source, props contract and provenance", () => {
    const input = buildPromotionRequest(entry);
    expect(input.title).toBe("Promote Button from my-cv");
    expect(input.idempotencyKey).toBe("library:my-cv--button@abcdef012345");
    expect(input.origin).toEqual({
      kind: "library",
      libraryId: "my-cv--button",
      project: "my-cv",
      repo: "https://gitlab.com/public-work4/my-cv",
      path: "components/ui/button.tsx",
      commit: "c706fb8a0000",
      contentHash: "abcdef0123456789",
    });
    expect(input.meta).toMatchObject({
      id: "my-cv--button",
      name: "Button",
      category: "actions",
      description: "Button from my-cv:components/ui/button.tsx.",
      tags: ["library", "cta"],
      author: "my-cv",
      code: entry.code,
      dependencies: ["class-variance-authority"],
    });
    // Library-only prop fields are dropped from the registry contract.
    expect(input.meta.props[1]).toEqual({ name: "onClick", type: "function", required: false });
    expect(input.files.map((f) => f.path)).toEqual([
      "components/display-components/library/my-cv/Button/Button.tsx",
      "components/display-components/library/my-cv/Button/Button.meta.json",
    ]);
    expect(input.files[0].contents).toBe(entry.code);
    expect(JSON.parse(input.files[1].contents)).toEqual(input.meta);
    expect(input.rationale).toContain("my-cv--button");
    expect(input.rationale).toContain("../../lib/utils");
  });
});

describe("promotionState", () => {
  it("is available when nothing references the entry", () => {
    expect(promotionState(entry, [], ["button"])).toEqual({ state: "available" });
    expect(promotionBlocker({ state: "available" })).toBeUndefined();
  });

  it.each<RequestStatus>(["draft", "validation_failed", "pending_review", "needs_changes", "approved"])(
    "blocks while a request is %s",
    (status) => {
      const state = promotionState(entry, [request(status)], []);
      expect(state).toEqual({ state: "pending", requestId: `req-${status}`, status });
      expect(promotionBlocker(state)).toMatch(/Already requested/);
    }
  );

  it("matches requests by origin or by idempotency key", () => {
    expect(promotionState(entry, [request("draft", { origin: undefined })], []).state).toBe("pending");
    expect(promotionState(entry, [request("draft", { idempotencyKey: undefined })], []).state).toBe("pending");
    expect(
      promotionState(entry, [request("draft", { origin: undefined, idempotencyKey: "library:my-cv--card@x" })], []).state
    ).toBe("available");
  });

  it("is promoted once a request was published or the registry has the id", () => {
    expect(promotionState(entry, [request("published")], [])).toEqual({
      state: "promoted",
      componentId: "my-cv--button",
      requestId: "req-published",
    });
    expect(promotionState(entry, [], ["my-cv--button"])).toEqual({ state: "promoted", componentId: "my-cv--button" });
  });

  it("blocks a rejected source until the source changes", () => {
    expect(promotionState(entry, [request("rejected")], [])).toEqual({ state: "rejected", requestId: "req-rejected" });
    expect(promotionState({ ...entry, contentHash: "fedcba9876543210" }, [request("rejected")], [])).toEqual({
      state: "available",
    });
  });

  it("refuses names the registry cannot hold", () => {
    expect(promotionState({ ...entry, name: "My_Button" }, [], []).state).toBe("unsupported");
  });

  it("reads registry ids from the components index", () => {
    expect(registryIdsFrom({ components: [{ id: "Button", name: "Button", path: "./b/" }] })).toEqual(["button"]);
  });
});
