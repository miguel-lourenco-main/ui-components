/**
 * Component validation: metadata schema, embedded code syntax, and published
 * registry consistency (matching files, ids, and source presence).
 */
import fs from "node:fs";
import type {
  ComponentMetaContract,
  ValidationIssue,
} from "@/lib/contracts";
import {
  readComponentMeta,
  readRegistry,
  resolveComponentFiles,
} from "@/lib/registry/components";
import { validateAgainstSchema } from "./schema";
import { validateModuleSyntax } from "./code";

/** Validate a single component meta object (schema + embedded code syntax). */
export function validateComponentMeta(
  meta: ComponentMetaContract
): ValidationIssue[] {
  const issues = validateAgainstSchema("componentMeta", meta);
  if (typeof meta.code === "string" && meta.code.trim() !== "") {
    issues.push(...validateModuleSyntax(meta.code, `${meta.name ?? "component"}.meta.json#code`));
  }
  return issues;
}

/**
 * Validate the published component registry on disk: every active index entry
 * must have a readable meta whose id matches, an existing source file that
 * parses, and (warning) a non-empty embedded code string.
 */
export function validateRegistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let entries: ReturnType<typeof readRegistry>["entries"];

  try {
    ({ entries } = readRegistry());
  } catch (error) {
    return [
      {
        code: "registry.unreadable",
        severity: "error",
        message: `Failed to read components index: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ];
  }

  for (const entry of entries) {
    const files = resolveComponentFiles(entry);
    const label = `${entry.name} (${entry.id})`;

    // Meta must exist and be readable.
    let meta: ComponentMetaContract;
    try {
      meta = readComponentMeta(entry);
    } catch (error) {
      issues.push({
        code: "registry.meta_unreadable",
        severity: "error",
        message: `Cannot read meta for ${label}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        path: files.meta,
      });
      continue;
    }

    issues.push(...prefixIssues(validateComponentMeta(meta), files.meta));

    if (meta.id?.toLowerCase() !== entry.id.toLowerCase()) {
      issues.push({
        code: "registry.id_mismatch",
        severity: "error",
        message: `meta.id "${meta.id}" does not match index id "${entry.id}".`,
        path: files.meta,
      });
    }

    // Source file must exist and parse.
    if (!fs.existsSync(files.source)) {
      issues.push({
        code: "registry.missing_source",
        severity: "error",
        message: `Missing source file for ${label}.`,
        path: files.source,
      });
    } else {
      const source = fs.readFileSync(files.source, "utf8");
      issues.push(...validateModuleSyntax(source, files.source));
    }

    // Drift guard (warning): embedded code should be present for agents/copy.
    if (typeof meta.code !== "string" || meta.code.trim() === "") {
      issues.push({
        code: "registry.empty_meta_code",
        severity: "warning",
        message: `Component ${label} has no embedded "code" string in its meta.`,
        path: files.meta,
      });
    }
  }

  return issues;
}

function prefixIssues(issues: ValidationIssue[], path: string): ValidationIssue[] {
  return issues.map((issue) => ({ ...issue, path: issue.path ?? path }));
}
