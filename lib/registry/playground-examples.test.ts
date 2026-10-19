import { describe, expect, it } from "vitest";
import { readComponentMeta, readRegistry, resolveComponentFiles } from "./components";
import { hasVisualEffect } from "@/lib/utils/propPreview";

/**
 * The playground keeps the preview mounted when you switch examples, so an
 * example that sets a non-visual prop (e.g. an initial-only defaultValue)
 * would not change the preview. Examples must use props that do.
 */
describe("playground examples", () => {
  const { entries } = readRegistry();

  for (const entry of entries) {
    it(`${entry.name} examples only set props with a visual effect`, async () => {
      const meta = readComponentMeta(entry);
      const nonVisual = new Set(meta.props.filter((p) => !hasVisualEffect(p)).map((p) => p.name));
      const mod = await import(/* @vite-ignore */ resolveComponentFiles(entry).examples);
      const examples: Array<{ name: string; props?: Record<string, unknown> }> =
        mod[`${entry.id}Examples`] ?? mod.examples ?? [];
      const offending = examples.flatMap((ex) =>
        Object.keys(ex.props ?? {})
          .filter((key) => nonVisual.has(key))
          .map((key) => `${ex.name}: ${key}`)
      );
      expect(offending).toEqual([]);
    });
  }
});
