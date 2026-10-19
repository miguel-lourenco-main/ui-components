import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "@babel/parser";
import { describe, expect, it, vi } from "vitest";
import type { ComponentRequest } from "@/lib/contracts";
import { validateModuleSyntax } from "@/lib/validation/code";
import { compileProposedComponent, prepareProposedSource } from "./compile-proposed-component";

/** The shadcn `button.tsx` that used to come out as invalid JSX. */
const SHADCN_BUTTON = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border bg-background",
      },
      size: { default: "h-9 px-4", sm: "h-8 px-3" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
`;

function parsesAsTsx(source: string): boolean {
  try {
    parse(source, { sourceType: "script", plugins: ["jsx", "typescript"] });
    return true;
  } catch {
    return false;
  }
}

describe("prepareProposedSource", () => {
  it("keeps nested cn(...) calls intact so the JSX stays valid", () => {
    const prepared = prepareProposedSource(SHADCN_BUTTON);
    expect(prepared).toContain("className={cn(buttonVariants({ variant, size, className }))}");
    expect(parsesAsTsx(prepared)).toBe(true);
  });

  it("removes multi-line imports and re-export lists", () => {
    const prepared = prepareProposedSource(
      `import {\n  a,\n  b,\n} from "x";\nimport "./styles.css";\nconst A = () => <div />;\nexport { A };\nexport type { P } from "./p";\n`
    );
    expect(prepared).not.toMatch(/import|export|from "x"/);
    expect(parsesAsTsx(prepared)).toBe(true);
  });
});

describe("compileProposedComponent", () => {
  it("renders the shadcn button with its variant classes", () => {
    const Button = compileProposedComponent(SHADCN_BUTTON, "Button");
    expect(Button).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(Button!, { variant: "outline", className: "w-full" }, "Go")
    );
    expect(html).toContain('data-slot="button"');
    expect(html).toContain("border bg-background");
    expect(html).toContain("w-full");
    expect(html).toContain(">Go</button>");
  });

  it("lets a source declare its own cn without clashing with the injected one", () => {
    const Tag = compileProposedComponent(
      `function cn(...c: string[]) { return c.join("+"); }\nexport default function Tag() { return <span className={cn("a", "b")} />; }`,
      "Tag"
    );
    expect(renderToStaticMarkup(React.createElement(Tag!))).toBe('<span class="a+b"></span>');
  });

  it("still compiles every syntactically valid proposal on the Requests page", () => {
    const dir = path.resolve(__dirname, "../../data/requests");
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const proposals = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith("req-") && f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as ComponentRequest)
      .flatMap((request) =>
        request.versions.flatMap((version) =>
          version.payload.kind === "component"
            ? version.payload.files
                .filter((f) => f.path.endsWith(`/${version.payload.kind === "component" ? version.payload.meta.name : ""}.tsx`))
                .map((f) => ({ name: (version.payload as { meta: { name: string } }).meta.name, source: f.contents }))
            : []
        )
      );
    // Seeds include a deliberately broken version (validation_failed); skip those.
    const valid = proposals.filter(({ source }) => validateModuleSyntax(source).length === 0);
    expect(valid.length).toBeGreaterThan(0);
    for (const { name, source } of valid) {
      expect(compileProposedComponent(source, name), `${name} should compile`).not.toBeNull();
    }
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
