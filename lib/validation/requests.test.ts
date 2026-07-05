import { describe, expect, it } from "vitest";
import { validatePayload } from "./requests";
import { validateRegistry } from "./components";
import type {
  ComponentRequestPayload,
  ThemeRequestPayload,
} from "@/lib/contracts";
import { getTheme } from "@/lib/registry/themes";

function goodComponentPayload(): ComponentRequestPayload {
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
      code: "export default function Badge(){ return null }",
    },
    files: [
      {
        path: "components/display-components/data/Badge/Badge.tsx",
        contents: "export default function Badge(){ return null }",
      },
      {
        path: "components/display-components/data/Badge/Badge.meta.json",
        contents: "{}",
      },
    ],
  };
}

describe("validatePayload (component)", () => {
  it("passes a well-formed component payload", () => {
    const { issues } = validatePayload("new_component", goodComponentPayload());
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("rejects path traversal", () => {
    const payload = goodComponentPayload();
    payload.files[0].path = "../../etc/passwd";
    const { issues } = validatePayload("new_component", payload);
    expect(issues.some((i) => i.code === "path.unsafe")).toBe(true);
  });

  it("rejects disallowed path prefixes", () => {
    const payload = goodComponentPayload();
    payload.files[0].path = "lib/themes.ts";
    const { issues } = validatePayload("new_component", payload);
    expect(issues.some((i) => i.code === "path.disallowed_prefix")).toBe(true);
  });

  it("flags syntax errors in proposed tsx", () => {
    const payload = goodComponentPayload();
    payload.files[0].contents = "export default function Broken( { return";
    const { issues } = validatePayload("new_component", payload);
    expect(issues.some((i) => i.code === "code.syntax_error")).toBe(true);
  });

  it("requires an existing target for component_update", () => {
    const { issues } = validatePayload(
      "component_update",
      goodComponentPayload(),
      "does-not-exist"
    );
    expect(issues.some((i) => i.code === "target.missing")).toBe(true);
  });

  it("flags removed props when updating a real component", () => {
    // The proposal declares no props, dropping every prop the published Button
    // exposes (including required ones).
    const { issues, checks } = validatePayload(
      "component_update",
      goodComponentPayload(),
      "button"
    );
    expect(
      issues.some(
        (i) => i.code === "api.prop_removed" && i.severity === "error"
      )
    ).toBe(true);
    expect(
      checks.some((c) => c.name === "api-compatibility" && !c.passed)
    ).toBe(true);
  });

  it("rejects mismatched payload kind for type", () => {
    const { issues } = validatePayload(
      "new_theme",
      goodComponentPayload() as unknown as ThemeRequestPayload
    );
    expect(issues.some((i) => i.code === "payload.kind_mismatch")).toBe(true);
  });
});

describe("validatePayload (theme)", () => {
  it("rejects a new theme that collides with an existing id", () => {
    const existing = getTheme("minimal")!;
    const payload: ThemeRequestPayload = { kind: "theme", theme: existing };
    const { issues } = validatePayload("new_theme", payload);
    expect(issues.some((i) => i.code === "theme.id_collision")).toBe(true);
  });

  it("flags missing color tokens", () => {
    const existing = structuredClone(getTheme("minimal")!);
    existing.id = "brand-new";
    // Remove a required token to trigger schema/semantic error.
    delete (existing.colors.light as Record<string, unknown>).primary;
    const payload: ThemeRequestPayload = { kind: "theme", theme: existing };
    const { issues } = validatePayload("new_theme", payload);
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });
});

describe("validateRegistry", () => {
  it("reports no errors for the current published registry", () => {
    const issues = validateRegistry();
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });
});
