/**
 * Browser-safe helpers for rendering proposed component previews with
 * sensible default prop values derived from metadata contracts.
 */
import type { ComponentMetaContract, ComponentPropContract } from "@/lib/contracts";

function isBooleanProp(prop: ComponentPropContract): boolean {
  const t = prop.type;
  return t === "boolean" || (Array.isArray(t) && t.includes("boolean"));
}

function isStringProp(prop: ComponentPropContract): boolean {
  const t = prop.type;
  return t === "string" || (Array.isArray(t) && t.includes("string"));
}

function defaultChildrenLabel(meta: ComponentMetaContract): string {
  if (meta.id === "button" || meta.name === "Button") return "Submit";
  if (meta.id === "badge" || meta.name === "Badge") return "New";
  return "Preview";
}

/** Build preview props from metadata defaults and common prop-name fallbacks. */
export function buildPreviewProps(meta: ComponentMetaContract): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const prop of meta.props) {
    if (prop.defaultValue !== undefined) {
      props[prop.name] = prop.defaultValue;
      continue;
    }

    if (prop.name === "children") {
      props[prop.name] = defaultChildrenLabel(meta);
      continue;
    }

    if (prop.name === "title") {
      props[prop.name] = meta.name;
      continue;
    }

    if (isBooleanProp(prop)) {
      props[prop.name] = false;
      continue;
    }

    if (isStringProp(prop)) {
      props[prop.name] = "";
    }
  }

  const declaresChildren =
    meta.props.some((p) => p.name === "children") ||
    /\bchildren\b/.test(meta.code ?? "");

  if (!("children" in props) && declaresChildren) {
    props.children = defaultChildrenLabel(meta);
  }

  return props;
}

/**
 * Props for list-card previews that surface proposed features (e.g. loading=true).
 * Turns on optional boolean props that default to false.
 */
export function buildFeaturePreviewProps(
  meta: ComponentMetaContract
): Record<string, unknown> {
  const props = buildPreviewProps(meta);

  for (const prop of meta.props) {
    if (!isBooleanProp(prop)) continue;
    const defaultsFalse =
      prop.defaultValue === false || prop.defaultValue === undefined;
    if (!prop.required && defaultsFalse) {
      props[prop.name] = true;
    }
  }

  return props;
}
