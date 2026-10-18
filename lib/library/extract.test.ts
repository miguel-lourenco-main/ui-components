import { describe, expect, it } from "vitest";
import { extractComponents } from "./extract";

describe("extractComponents", () => {
  it("extracts a default-exported function component with interface props, defaults, and JSDoc", () => {
    const source = `
"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Foo } from "some-types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style */
  variant?: "solid" | "outline";
  /** Label shown inside */
  label: string;
  count?: number;
  icon?: React.ReactNode;
  onDismiss?: (id: string) => void;
}

/**
 * Small status pill.
 * @param props unused tag
 */
export default function Badge({ variant = "solid", label, count = -1, className = cn("a") }: BadgeProps) {
  return <motion.span className={className}>{label}{count}</motion.span>;
}
`;
    const result = extractComponents(source, "Badge.tsx");
    expect(result.dependencies).toEqual(["framer-motion"]);
    expect(result.localImports).toEqual(["@/lib/utils"]);
    expect(result.components).toHaveLength(1);

    const [badge] = result.components;
    expect(badge.name).toBe("Badge");
    expect(badge.exportKind).toBe("default");
    expect(badge.description).toBe("Small status pill.");
    expect(badge.propsExtends).toEqual(["React.HTMLAttributes<HTMLSpanElement>"]);

    const byName = Object.fromEntries(badge.props.map((p) => [p.name, p]));
    expect(byName.variant).toMatchObject({
      type: "enum",
      options: ["solid", "outline"],
      required: false,
      defaultValue: "solid",
      description: "Visual style",
      tsType: '"solid" | "outline"',
    });
    expect(byName.label).toMatchObject({ type: "string", required: true });
    expect(byName.count).toMatchObject({ type: "number", defaultValue: -1 });
    expect(byName.icon).toMatchObject({ type: "component" });
    expect(byName.onDismiss).toMatchObject({
      type: "function",
      functionSignature: { params: "id: string", returnType: "void" },
    });
    // Non-literal default is kept as an expression, prop only known from destructuring.
    expect(byName.className).toMatchObject({ defaultExpression: 'cn("a")', required: false });
  });

  it("handles forwardRef with generic props, named exports via specifiers, and skips non-components", () => {
    const source = `
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = { asChild?: boolean } & { size: "sm" | "lg" };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, size }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} data-size={size} />;
});
Button.displayName = "Button";

const CONSTANT = 3;
function helper() { return 1; }
export const useThing = () => null;
export const NotAComponent = () => 42;

export { Button, helper, CONSTANT };
`;
    const result = extractComponents(source, "button.tsx");
    expect(result.dependencies).toEqual(["@radix-ui/react-slot"]);
    expect(result.components.map((c) => c.name)).toEqual(["Button"]);
    const [button] = result.components;
    expect(button.exportKind).toBe("named");
    expect(button.props.map((p) => p.name).sort()).toEqual(["asChild", "size"]);
    expect(button.props.find((p) => p.name === "asChild")).toMatchObject({ type: "boolean", defaultValue: false });
    expect(button.props.find((p) => p.name === "size")).toMatchObject({ type: "enum", required: true });
  });

  it("reads props from a React.FC annotation and arrow components", () => {
    const source = `
import React from "react";
interface CardProps { title: string; children?: React.ReactNode }
/** A card. */
export const Card: React.FC<CardProps> = ({ title, children }) => (
  <div><h3>{title}</h3>{children}</div>
);
`;
    const { components } = extractComponents(source, "Card.tsx");
    expect(components).toHaveLength(1);
    expect(components[0]).toMatchObject({ name: "Card", exportKind: "named", description: "A card." });
    expect(components[0].props.map((p) => [p.name, p.type])).toEqual([
      ["title", "string"],
      ["children", "component"],
    ]);
  });

  it("resolves `export default Name` and memo-wrapped components", () => {
    const source = `
import { memo } from "react";
const List = memo(function List({ items }: { items: string[] }) {
  return <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>;
});
export default List;
`;
    const { components } = extractComponents(source, "List.tsx");
    expect(components).toHaveLength(1);
    expect(components[0]).toMatchObject({ name: "List", exportKind: "default" });
    expect(components[0].props[0]).toMatchObject({ name: "items", type: "array", tsType: "string[]" });
  });

  it("returns nothing for files without exported JSX components", () => {
    expect(extractComponents("export const x = 1;", "x.ts").components).toEqual([]);
  });
});
