import { describe, expect, it } from "vitest";
import { diffComponentApi } from "./api-compat";
import type { ComponentPropContract } from "@/lib/contracts";

const prop = (
  over: Partial<ComponentPropContract> & { name: string }
): ComponentPropContract => ({
  type: "string",
  required: false,
  ...over,
});

describe("diffComponentApi", () => {
  it("returns no issues when the proposal preserves the prop surface", () => {
    const existing = [
      prop({ name: "children", required: true }),
      prop({ name: "variant", type: "enum", options: ["a", "b"] }),
    ];
    const proposed = [
      ...existing,
      prop({ name: "loading", type: "boolean" }),
    ];
    expect(diffComponentApi(existing, proposed)).toEqual([]);
  });

  it("errors when a required prop is removed", () => {
    const issues = diffComponentApi([prop({ name: "children", required: true })], []);
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("api.prop_removed");
    expect(issues[0].severity).toBe("error");
    expect(issues[0].path).toBe("children");
  });

  it("warns when an optional prop is removed", () => {
    const issues = diffComponentApi([prop({ name: "title" })], []);
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("api.prop_removed");
    expect(issues[0].severity).toBe("warning");
  });

  it("warns on a prop type change", () => {
    const issues = diffComponentApi(
      [prop({ name: "value", type: "string", required: true })],
      [prop({ name: "value", type: "number", required: true })]
    );
    expect(issues.some((i) => i.code === "api.prop_type_changed")).toBe(true);
  });

  it("warns when enum options are narrowed", () => {
    const issues = diffComponentApi(
      [prop({ name: "variant", type: "enum", options: ["primary", "ghost"] })],
      [prop({ name: "variant", type: "enum", options: ["primary"] })]
    );
    expect(issues.some((i) => i.code === "api.enum_narrowed")).toBe(true);
  });

  it("treats string[] union types order-insensitively", () => {
    const existing = [
      prop({ name: "children", type: ["component", "function"], required: true }),
    ];
    const proposed = [
      prop({ name: "children", type: ["function", "component"], required: true }),
    ];
    expect(diffComponentApi(existing, proposed)).toEqual([]);
  });
});
