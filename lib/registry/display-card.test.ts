import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Card from "@/components/display-components/cards/Card/Card";

function classesOf(props: Record<string, unknown>): string[] {
  const html = renderToStaticMarkup(React.createElement(Card, props as never, "body"));
  const match = html.match(/class="([^"]*)"/);
  return match ? match[1].split(/\s+/) : [];
}

describe("display Card padding", () => {
  it("keeps the default look (p-6) with neither size nor padding", () => {
    expect(classesOf({})).toContain("p-6");
  });

  it("applies size when padding is not given", () => {
    expect(classesOf({ size: "sm" })).toContain("p-4");
    expect(classesOf({ size: "lg" })).toContain("p-8");
  });

  it("lets an explicit padding override size", () => {
    const classes = classesOf({ size: "lg", padding: "sm" });
    expect(classes).toContain("p-3");
    expect(classes).not.toContain("p-8");
    expect(classesOf({ size: "lg", padding: "none" })).toContain("p-0");
  });
});
