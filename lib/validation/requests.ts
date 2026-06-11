/**
 * Request validation entrypoint.
 *
 * Composes schema, file-safety, code-syntax, metadata, and theme checks into a
 * single serializable `RequestValidationResult` that is persisted on the request
 * version and shown in the review UI.
 */
import type {
  ComponentRequest,
  RequestPayload,
  RequestType,
  RequestValidationResult,
  ValidationCheck,
  ValidationIssue,
} from "@/lib/contracts";
import { buildValidationResult, payloadKindForType } from "@/lib/contracts";
import { getComponent } from "@/lib/registry/components";
import { validateAgainstSchema } from "./schema";
import { validateComponentMeta } from "./components";
import { validateProposedFiles } from "./files";
import { validateModuleSyntax } from "./code";
import { validateTheme } from "./themes";

/**
 * Validate a request payload for a given request type. Returns all issues
 * (errors and warnings) found across schema, files, code, metadata, and theme
 * checks.
 */
export function validatePayload(
  type: RequestType,
  payload: RequestPayload,
  targetId?: string
): { issues: ValidationIssue[]; checks: ValidationCheck[] } {
  const issues: ValidationIssue[] = [];
  const checks: ValidationCheck[] = [];

  const expectedKind = payloadKindForType(type);
  if (payload?.kind !== expectedKind) {
    issues.push({
      code: "payload.kind_mismatch",
      severity: "error",
      message: `Payload kind "${payload?.kind}" does not match request type "${type}".`,
    });
    checks.push({ name: "payload-kind", passed: false });
    return { issues, checks };
  }
  checks.push({ name: "payload-kind", passed: true });

  if (payload.kind === "component") {
    const metaIssues = validateComponentMeta(payload.meta);
    issues.push(...metaIssues);
    checks.push({
      name: "component-meta",
      passed: !metaIssues.some((i) => i.severity === "error"),
    });

    const fileIssues = validateProposedFiles(payload.files);
    issues.push(...fileIssues);
    checks.push({
      name: "proposed-files",
      passed: !fileIssues.some((i) => i.severity === "error"),
    });

    let codeOk = true;
    for (const file of payload.files ?? []) {
      if (file.path?.endsWith(".tsx") || file.path?.endsWith(".ts")) {
        const codeIssues = validateModuleSyntax(file.contents, file.path);
        issues.push(...codeIssues);
        if (codeIssues.some((i) => i.severity === "error")) codeOk = false;
      }
    }
    checks.push({ name: "file-syntax", passed: codeOk });

    if (type === "component_update") {
      const ok = !!targetId && !!getComponent(targetId);
      if (!ok) {
        issues.push({
          code: "target.missing",
          severity: "error",
          message: `component_update requires an existing targetId. Got: ${targetId ?? "(none)"}.`,
        });
      }
      checks.push({ name: "update-target", passed: ok });
    }
  } else {
    const themeIssues = validateTheme(payload.theme, {
      isNew: type === "new_theme",
    });
    issues.push(...themeIssues);
    checks.push({
      name: "theme",
      passed: !themeIssues.some((i) => i.severity === "error"),
    });
  }

  return { issues, checks };
}

/** Validate a full persisted request (structure + current version payload). */
export function validateRequest(
  request: ComponentRequest
): RequestValidationResult {
  const checkedAt = new Date().toISOString();
  const issues: ValidationIssue[] = [];
  const checks: ValidationCheck[] = [];

  const schemaIssues = validateAgainstSchema("componentRequest", request);
  issues.push(...schemaIssues);
  checks.push({
    name: "request-schema",
    passed: !schemaIssues.some((i) => i.severity === "error"),
  });

  const current = request.versions.find(
    (v) => v.id === request.currentVersionId
  );
  if (!current) {
    issues.push({
      code: "request.missing_current_version",
      severity: "error",
      message: `currentVersionId "${request.currentVersionId}" not found in versions.`,
    });
    checks.push({ name: "current-version", passed: false });
    return buildValidationResult(checks, issues, checkedAt);
  }
  checks.push({ name: "current-version", passed: true });

  const payloadResult = validatePayload(
    request.type,
    current.payload,
    request.targetId
  );
  issues.push(...payloadResult.issues);
  checks.push(...payloadResult.checks);

  return buildValidationResult(checks, issues, checkedAt);
}
