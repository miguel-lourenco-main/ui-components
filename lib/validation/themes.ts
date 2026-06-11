/**
 * Theme validation: schema plus semantic checks (token presence, non-empty
 * class strings, and id collisions for new themes).
 */
import type { ThemeContract, ValidationIssue } from "@/lib/contracts";
import {
  REQUIRED_COLOR_TOKENS,
  REQUIRED_COMPONENT_GROUPS,
} from "@/lib/contracts";
import { getTheme } from "@/lib/registry/themes";
import { validateAgainstSchema } from "./schema";

/**
 * Validate a theme object. When `isNew` is true, a colliding id with an existing
 * published theme is an error; for updates a missing target is an error.
 */
export function validateTheme(
  theme: ThemeContract,
  opts: { isNew: boolean } = { isNew: true }
): ValidationIssue[] {
  const issues = validateAgainstSchema("theme", theme);
  if (issues.some((i) => i.severity === "error")) {
    // Schema already failed hard; semantic checks below assume basic shape.
    return issues;
  }

  for (const mode of ["light", "dark"] as const) {
    for (const token of REQUIRED_COLOR_TOKENS) {
      const value = theme.colors?.[mode]?.[token];
      if (typeof value !== "string" || value.trim() === "") {
        issues.push({
          code: "theme.missing_color",
          severity: "error",
          message: `Missing color token "${token}" for ${mode} mode.`,
          path: `/colors/${mode}/${token}`,
        });
      }
    }
    for (const group of REQUIRED_COMPONENT_GROUPS) {
      const styles = theme.components?.[mode]?.[group] as
        | Record<string, string>
        | undefined;
      if (!styles) {
        issues.push({
          code: "theme.missing_component_group",
          severity: "error",
          message: `Missing component style group "${group}" for ${mode} mode.`,
          path: `/components/${mode}/${group}`,
        });
        continue;
      }
      for (const [variant, className] of Object.entries(styles)) {
        if (typeof className !== "string" || className.trim() === "") {
          issues.push({
            code: "theme.empty_class",
            severity: "warning",
            message: `Empty class string for ${group}.${variant} (${mode}).`,
            path: `/components/${mode}/${group}/${variant}`,
          });
        }
      }
    }
  }

  const existing = getTheme(theme.id);
  if (opts.isNew && existing) {
    issues.push({
      code: "theme.id_collision",
      severity: "error",
      message: `Theme id "${theme.id}" already exists. Use a theme update instead.`,
      path: "/id",
    });
  }
  if (!opts.isNew && !existing) {
    issues.push({
      code: "theme.target_missing",
      severity: "error",
      message: `Theme "${theme.id}" does not exist to update.`,
      path: "/id",
    });
  }

  return issues;
}
