import { describe, expect, it } from "vitest";
import { diffLines, diffStats } from "./diff";

describe("diffLines", () => {
  it("returns all context lines for identical input", () => {
    const lines = diffLines("a\nb\nc", "a\nb\nc");
    expect(lines.every((l) => l.type === "context")).toBe(true);
    expect(diffStats(lines)).toEqual({ added: 0, removed: 0 });
  });

  it("detects an added line", () => {
    const lines = diffLines("a\nc", "a\nb\nc");
    expect(diffStats(lines)).toEqual({ added: 1, removed: 0 });
    expect(lines.find((l) => l.type === "add")?.text).toBe("b");
  });

  it("detects a removed line", () => {
    const lines = diffLines("a\nb\nc", "a\nc");
    expect(diffStats(lines)).toEqual({ added: 0, removed: 1 });
    expect(lines.find((l) => l.type === "remove")?.text).toBe("b");
  });

  it("detects a replaced line as remove + add", () => {
    const lines = diffLines("a\nx\nc", "a\ny\nc");
    expect(diffStats(lines)).toEqual({ added: 1, removed: 1 });
  });
});
