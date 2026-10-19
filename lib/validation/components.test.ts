import { describe, expect, it } from "vitest";
import type { ComponentMetaContract } from "@/lib/contracts";
import { validateComponentMeta, validateRegistry } from "./components";

function metaWithProp(prop: Record<string, unknown>): ComponentMetaContract {
  return {
    id: "demo",
    name: "Demo",
    category: "form",
    description: "Demo component.",
    props: [prop as unknown as ComponentMetaContract["props"][number]],
    tags: [],
    version: "1.0.0",
    author: "Test",
  };
}

describe("prop preview contract", () => {
  it("accepts a non-visual prop with a reason", () => {
    const issues = validateComponentMeta(
      metaWithProp({
        name: "defaultValue",
        type: "string",
        required: false,
        preview: { visual: false, reason: "Read once on mount." },
      })
    );
    expect(issues).toHaveLength(0);
  });

  it("rejects a preview block without a reason", () => {
    const issues = validateComponentMeta(
      metaWithProp({ name: "id", type: "string", required: false, preview: { visual: false } })
    );
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("rejects visual: true (omit the block instead)", () => {
    const issues = validateComponentMeta(
      metaWithProp({ name: "id", type: "string", required: false, preview: { visual: true, reason: "x" } })
    );
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("leaves no initial-only prop unmarked in the published registry", () => {
    const unmarked = validateRegistry().filter((i) => i.code === "registry.initial_only_prop_unmarked");
    expect(unmarked).toHaveLength(0);
  });
});
