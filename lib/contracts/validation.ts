/**
 * Canonical contracts for validation results.
 *
 * These describe the structured validation output stored on requests and shown
 * in the review UI. This is distinct from `lib/utils/codeValidation.ts`, which
 * is the browser-side prop editor validator; this contract is the
 * request/registry-level result that is persisted and serialized.
 */

export type ValidationSeverity = "error" | "warning";

/** A single problem found during validation. */
export interface ValidationIssue {
  /** Stable machine-readable code, e.g. "schema.invalid", "path.traversal". */
  code: string;
  message: string;
  severity: ValidationSeverity;
  /** Optional file or JSON pointer the issue relates to. */
  path?: string;
  location?: {
    line: number;
    column: number;
  };
}

/** Result of a single named validation check. */
export interface ValidationCheck {
  name: string;
  passed: boolean;
  details?: string;
}

/** Aggregate, serializable validation result persisted on a request version. */
export interface RequestValidationResult {
  valid: boolean;
  /** ISO-8601 timestamp of when validation ran. */
  checkedAt: string;
  issues: ValidationIssue[];
  checks: ValidationCheck[];
}

/** Convenience constructor for an empty/passing result. */
export function emptyValidationResult(checkedAt: string): RequestValidationResult {
  return { valid: true, checkedAt, issues: [], checks: [] };
}

/** Derive overall validity and merge issues into a result. */
export function buildValidationResult(
  checks: ValidationCheck[],
  issues: ValidationIssue[],
  checkedAt: string
): RequestValidationResult {
  const hasError = issues.some((issue) => issue.severity === "error");
  return {
    valid: !hasError && checks.every((check) => check.passed),
    checkedAt,
    issues,
    checks,
  };
}
