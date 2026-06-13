/**
 * Static validation for proposed files in component requests: path safety,
 * allowed prefixes/extensions, size limits, and naming conventions.
 */
import type { ProposedFile, ValidationIssue } from "@/lib/contracts";
import { isSafeRelativePath } from "@/lib/registry/paths";
import {
  ALLOWED_COMPONENT_FILE_EXTENSIONS,
  ALLOWED_COMPONENT_PATH_PREFIXES,
  MAX_FILE_BYTES,
  MAX_PROPOSED_FILES,
} from "./limits";

function byteLength(s: string): number {
  return Buffer.byteLength(s, "utf8");
}

function hasAllowedPrefix(p: string): boolean {
  return ALLOWED_COMPONENT_PATH_PREFIXES.some((prefix) => p.startsWith(prefix));
}

function hasAllowedExtension(p: string): boolean {
  return ALLOWED_COMPONENT_FILE_EXTENSIONS.some((ext) => p.endsWith(ext));
}

/**
 * Validate a set of proposed files. Returns error issues for unsafe paths,
 * disallowed prefixes/extensions, oversize content, and too many files; plus
 * warnings for non-conventional component layouts.
 */
export function validateProposedFiles(files: ProposedFile[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!Array.isArray(files) || files.length === 0) {
    issues.push({
      code: "files.empty",
      severity: "error",
      message: "A component request must include at least one proposed file.",
    });
    return issues;
  }

  if (files.length > MAX_PROPOSED_FILES) {
    issues.push({
      code: "files.too_many",
      severity: "error",
      message: `Too many files (${files.length}); maximum is ${MAX_PROPOSED_FILES}.`,
    });
  }

  const seen = new Set<string>();
  for (const file of files) {
    const p = file?.path;
    if (typeof p !== "string" || p.trim() === "") {
      issues.push({
        code: "files.invalid_path",
        severity: "error",
        message: "Each file must have a non-empty path.",
      });
      continue;
    }

    if (seen.has(p)) {
      issues.push({
        code: "files.duplicate",
        severity: "error",
        message: `Duplicate file path: ${p}`,
        path: p,
      });
    }
    seen.add(p);

    if (!isSafeRelativePath(p)) {
      issues.push({
        code: "path.unsafe",
        severity: "error",
        message: `Unsafe path (absolute or traversal): ${p}`,
        path: p,
      });
      continue;
    }

    if (!hasAllowedPrefix(p)) {
      issues.push({
        code: "path.disallowed_prefix",
        severity: "error",
        message: `Path must start with one of: ${ALLOWED_COMPONENT_PATH_PREFIXES.join(", ")}. Got: ${p}`,
        path: p,
      });
    }

    if (!hasAllowedExtension(p)) {
      issues.push({
        code: "path.disallowed_extension",
        severity: "error",
        message: `File extension not allowed for: ${p}. Allowed: ${ALLOWED_COMPONENT_FILE_EXTENSIONS.join(", ")}`,
        path: p,
      });
    }

    if (typeof file.contents !== "string") {
      issues.push({
        code: "files.invalid_contents",
        severity: "error",
        message: `File contents must be a string: ${p}`,
        path: p,
      });
      continue;
    }

    if (byteLength(file.contents) > MAX_FILE_BYTES) {
      issues.push({
        code: "files.too_large",
        severity: "error",
        message: `File ${p} exceeds the ${MAX_FILE_BYTES}-byte limit.`,
        path: p,
      });
    }
  }

  // Convention check (warning only): a component request should include a
  // <Name>.tsx and a <Name>.meta.json under display-components.
  const hasTsx = files.some((f) => f.path?.endsWith(".tsx") && !f.path.endsWith(".examples.tsx"));
  const hasMeta = files.some((f) => f.path?.endsWith(".meta.json"));
  if (!hasTsx) {
    issues.push({
      code: "convention.missing_component",
      severity: "warning",
      message: "No component source (<Name>.tsx) found among proposed files.",
    });
  }
  if (!hasMeta) {
    issues.push({
      code: "convention.missing_meta",
      severity: "warning",
      message: "No metadata file (<Name>.meta.json) found among proposed files.",
    });
  }

  return issues;
}
