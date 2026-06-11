/**
 * JSON Schema validation built on ajv.
 *
 * Compiles the contract schemas once and exposes typed validators that return
 * structured `ValidationIssue[]` for the request/registry validation layer.
 */
import Ajv2020 from "ajv/dist/2020";
import type { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import type { ValidationIssue } from "@/lib/contracts";
import componentMetaSchema from "@/lib/contracts/schemas/component-meta.schema.json";
import themeSchema from "@/lib/contracts/schemas/theme.schema.json";
import componentRequestSchema from "@/lib/contracts/schemas/component-request.schema.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

export type SchemaName = "componentMeta" | "theme" | "componentRequest";

const validators: Record<SchemaName, ValidateFunction> = {
  componentMeta: ajv.compile(componentMetaSchema),
  theme: ajv.compile(themeSchema),
  componentRequest: ajv.compile(componentRequestSchema),
};

/**
 * Validate a value against a named schema. Returns an array of error-severity
 * issues (empty when valid).
 */
export function validateAgainstSchema(
  name: SchemaName,
  data: unknown
): ValidationIssue[] {
  const validate = validators[name];
  const valid = validate(data);
  if (valid) return [];
  return (validate.errors ?? []).map((err) => ({
    code: "schema.invalid",
    severity: "error" as const,
    message: `${err.instancePath || "/"} ${err.message ?? "is invalid"}`.trim(),
    path: err.instancePath || undefined,
  }));
}
