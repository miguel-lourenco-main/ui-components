import type { RequestStatus } from "@/lib/contracts";
import {
  STATUS_BADGE_CLASSES,
  STATUS_ICONS,
  STATUS_LABELS,
} from "@/lib/requests/presentation";

/**
 * Shared status pill for requests: icon + label so the state is readable
 * without relying on color alone.
 */
export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
