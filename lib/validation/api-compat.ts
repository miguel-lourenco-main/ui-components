/**
 * API-compatibility checks for `component_update` requests.
 *
 * Compares a proposed component's public prop surface against the currently
 * published one so an update cannot silently drop features. Removing a required
 * prop is a breaking change (error); removing an optional prop, changing a prop
 * type, or narrowing an enum's options is a regression worth flagging (warning).
 */
import type {
  ComponentPropContract,
  MetaPropType,
  ValidationIssue,
} from "@/lib/contracts";

/** Order-insensitive key for a prop type (string or string[] union). */
function typeKey(type: MetaPropType): string {
  return Array.isArray(type) ? [...type].sort().join("|") : type;
}

/**
 * Diff the existing vs proposed prop contracts and return compatibility issues.
 * Empty when the proposal preserves every existing prop's shape.
 */
export function diffComponentApi(
  existing: ComponentPropContract[],
  proposed: ComponentPropContract[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const proposedByName = new Map(proposed.map((prop) => [prop.name, prop]));

  for (const prev of existing) {
    const next = proposedByName.get(prev.name);

    if (!next) {
      issues.push({
        code: "api.prop_removed",
        severity: prev.required ? "error" : "warning",
        message: prev.required
          ? `Update removes required prop "${prev.name}" present in the current component.`
          : `Update removes prop "${prev.name}" present in the current component.`,
        path: prev.name,
      });
      continue;
    }

    if (typeKey(prev.type) !== typeKey(next.type)) {
      issues.push({
        code: "api.prop_type_changed",
        severity: "warning",
        message: `Prop "${prev.name}" changes type from ${JSON.stringify(
          prev.type
        )} to ${JSON.stringify(next.type)}.`,
        path: prev.name,
      });
    }

    const prevOptions = prev.options ?? [];
    if (prevOptions.length > 0) {
      const nextOptions = new Set((next.options ?? []).map(String));
      const removed = prevOptions.filter((opt) => !nextOptions.has(String(opt)));
      if (removed.length > 0) {
        issues.push({
          code: "api.enum_narrowed",
          severity: "warning",
          message: `Prop "${prev.name}" drops option(s): ${removed.join(", ")}.`,
          path: prev.name,
        });
      }
    }
  }

  return issues;
}
