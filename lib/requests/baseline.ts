/**
 * Capture a snapshot of the component a `component_update` targets, so the
 * request record carries the "before" state into the static manifest (the
 * browser has no filesystem access) and the review UI can diff it against the
 * proposal. Node/filesystem only — call from the MCP server, seed script, or
 * other server-side create paths.
 */
import { getComponent, getComponentSource } from "@/lib/registry/components";
import type { RequestBaseline } from "@/lib/contracts";

/**
 * Build a `RequestBaseline` for the given published component id. Returns
 * undefined when the component is not registered (the request will simply carry
 * no baseline).
 */
export function captureComponentBaseline(
  targetId: string
): RequestBaseline | undefined {
  const detail = getComponent(targetId);
  const source = getComponentSource(targetId);
  if (!detail || !source) return undefined;

  return {
    targetId: detail.id,
    capturedAt: new Date().toISOString(),
    sourcePath: `components/display-components/${detail.path}/${detail.name}.tsx`,
    source: source.source,
    props: detail.props,
  };
}
