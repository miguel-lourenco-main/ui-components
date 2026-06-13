/**
 * Browser-safe presentation helpers for rendering requests in the review UI.
 * No filesystem/node dependencies so this is safe to import from client
 * components.
 */
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Clock,
  PencilLine,
  XCircle,
} from "lucide-react";
import type {
  ProposedFile,
  RequestPayload,
  RequestStatus,
  RequestVersion,
} from "@/lib/contracts";

/** Human-friendly label for each status. */
export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Draft",
  validation_failed: "Validation failed",
  pending_review: "Pending review",
  needs_changes: "Needs changes",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

/**
 * Icon shown alongside each status label so state isn't conveyed by color
 * alone.
 */
export const STATUS_ICONS: Record<RequestStatus, LucideIcon> = {
  draft: PencilLine,
  validation_failed: XCircle,
  pending_review: Clock,
  needs_changes: AlertTriangle,
  approved: CheckCircle2,
  rejected: Ban,
  published: BadgeCheck,
};

/**
 * Tailwind classes for a status badge. Uses neutral utility colors so it works
 * across the app's light/dark themes.
 */
export const STATUS_BADGE_CLASSES: Record<RequestStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  validation_failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  pending_review: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  needs_changes:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

/** List proposed files for a component payload (empty for theme payloads). */
export function payloadFiles(payload: RequestPayload): ProposedFile[] {
  return payload.kind === "component" ? payload.files ?? [] : [];
}

/**
 * The primary source string used for previews and diffs:
 * - component: the main `<Name>.tsx` (excluding examples), else meta.code
 * - theme: pretty-printed theme JSON
 */
export function primarySource(payload: RequestPayload): string {
  if (payload.kind === "theme") {
    return JSON.stringify(payload.theme, null, 2);
  }
  const files = payloadFiles(payload);
  const main = files.find(
    (f) => f.path.endsWith(".tsx") && !f.path.endsWith(".examples.tsx")
  );
  if (main) return main.contents;
  return payload.meta?.code ?? "";
}

/** Convenience: primary source of a version. */
export function versionSource(version: RequestVersion): string {
  return primarySource(version.payload);
}

/** Find the version immediately before the given version id (or undefined). */
export function previousVersion(
  versions: RequestVersion[],
  versionId: string
): RequestVersion | undefined {
  const idx = versions.findIndex((v) => v.id === versionId);
  return idx > 0 ? versions[idx - 1] : undefined;
}
