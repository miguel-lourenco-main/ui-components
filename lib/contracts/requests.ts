/**
 * Canonical contracts for agent-proposed component/theme requests.
 *
 * Requests are mutable proposals with a full version history. Every update
 * appends a new `RequestVersion` instead of overwriting prior content, so the
 * review UI can show diffs and auditability. See `transitions.ts` for the
 * allowed status lifecycle.
 */
import type { ComponentMetaContract } from "./components";
import type { ThemeContract } from "./themes";
import type { RequestValidationResult } from "./validation";

export type RequestType =
  | "new_component"
  | "component_update"
  | "new_theme"
  | "theme_update";

export type RequestStatus =
  | "draft"
  | "validation_failed"
  | "pending_review"
  | "needs_changes"
  | "approved"
  | "rejected"
  | "published";

/** A proposed file to be written when a component request is published. */
export interface ProposedFile {
  /** Target path relative to the repo root. Validated for safety. */
  path: string;
  contents: string;
}

/** Payload for component-related requests (new_component, component_update). */
export interface ComponentRequestPayload {
  kind: "component";
  meta: ComponentMetaContract;
  /** Proposed files (component source, meta, examples). */
  files: ProposedFile[];
}

/** Payload for theme-related requests (new_theme, theme_update). */
export interface ThemeRequestPayload {
  kind: "theme";
  theme: ThemeContract;
}

export type RequestPayload = ComponentRequestPayload | ThemeRequestPayload;

/** A single immutable version of a request's content. */
export interface RequestVersion {
  id: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** Identifier of the agent/author that produced this version. */
  authorAgent?: string;
  /** Why this version exists / what changed. */
  rationale: string;
  payload: RequestPayload;
  /** Validation result for this specific version, if it has been validated. */
  validation?: RequestValidationResult;
}

/** A human (or agent) review decision applied to the request. */
export interface ReviewDecision {
  decision: "approved" | "rejected" | "needs_changes";
  reviewer: string;
  notes?: string;
  /** ISO-8601 timestamp. */
  decidedAt: string;
}

/**
 * The top-level request record. `currentVersionId` always points at the latest
 * entry in `versions`. `targetId` references the published component/theme id
 * for update requests.
 */
export interface ComponentRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  title: string;
  /** Published component/theme id for `*_update` requests. */
  targetId?: string;
  currentVersionId: string;
  versions: RequestVersion[];
  reviewDecision?: ReviewDecision;
  /** ISO-8601 timestamps. */
  createdAt: string;
  updatedAt: string;
  /**
   * Stable key an agent can supply to deduplicate. Two create calls with the
   * same key resolve to the same request (the second becomes an update).
   */
  idempotencyKey?: string;
}

/** Manifest written for static consumption by the review UI. */
export interface RequestsManifest {
  version: number;
  generatedAt: string;
  requests: ComponentRequest[];
}

/** Statuses in which an agent is allowed to mutate a request's content. */
export const AGENT_EDITABLE_STATUSES: RequestStatus[] = [
  "draft",
  "validation_failed",
  "needs_changes",
];

/** Whether a request can currently be updated by an agent. */
export function isAgentEditable(status: RequestStatus): boolean {
  return AGENT_EDITABLE_STATUSES.includes(status);
}

/** Map request type to its expected payload kind. */
export function payloadKindForType(type: RequestType): RequestPayload["kind"] {
  return type === "new_theme" || type === "theme_update" ? "theme" : "component";
}
