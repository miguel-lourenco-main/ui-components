/**
 * Request status lifecycle and allowed transitions.
 *
 * Lifecycle:
 *   draft -> validation_failed | pending_review
 *   validation_failed -> pending_review | draft
 *   pending_review -> needs_changes | approved | rejected
 *   needs_changes -> pending_review | validation_failed | rejected
 *   approved -> published | needs_changes
 *   rejected -> (terminal)
 *   published -> (terminal)
 */
import type { RequestStatus } from "./requests";

const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  draft: ["validation_failed", "pending_review"],
  validation_failed: ["pending_review", "draft"],
  pending_review: ["needs_changes", "approved", "rejected"],
  needs_changes: ["pending_review", "validation_failed", "rejected"],
  approved: ["published", "needs_changes"],
  rejected: [],
  published: [],
};

/** Whether `to` is a legal next status from `from`. Same-status is allowed. */
export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Legal next statuses from a given status (excluding self). */
export function allowedNextStatuses(from: RequestStatus): RequestStatus[] {
  return TRANSITIONS[from] ?? [];
}

/** Terminal statuses cannot transition further. */
export function isTerminalStatus(status: RequestStatus): boolean {
  return (TRANSITIONS[status]?.length ?? 0) === 0;
}
