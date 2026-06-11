/**
 * RequestStore: storage abstraction for agent-proposed component/theme requests.
 *
 * The interface is backend-agnostic so a database implementation can replace the
 * file-backed default without changing the MCP server or UI. Every content
 * update appends a new immutable `RequestVersion` (version history is never
 * overwritten).
 */
import type {
  ComponentRequest,
  RequestPayload,
  RequestStatus,
  RequestType,
  RequestValidationResult,
  ReviewDecision,
} from "@/lib/contracts";

/** Input for creating a new request (or resolving via idempotency key). */
export interface CreateRequestInput {
  type: RequestType;
  title: string;
  targetId?: string;
  rationale: string;
  payload: RequestPayload;
  authorAgent?: string;
  idempotencyKey?: string;
}

/** Input for appending a new version to an existing request. */
export interface UpdateRequestInput {
  rationale: string;
  payload: RequestPayload;
  authorAgent?: string;
}

/** Error thrown for invalid store operations (safe to surface to callers). */
export class RequestStoreError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "RequestStoreError";
  }
}

export interface RequestStore {
  /** All requests, newest first. */
  listRequests(): Promise<ComponentRequest[]>;
  /** A single request by id, or undefined. */
  getRequest(id: string): Promise<ComponentRequest | undefined>;
  /**
   * Create a request. If `idempotencyKey` matches an existing editable request,
   * a new version is appended to it instead of creating a duplicate.
   */
  createRequest(input: CreateRequestInput): Promise<ComponentRequest>;
  /** Append a new version to an existing request (must be agent-editable). */
  updateRequest(
    id: string,
    input: UpdateRequestInput
  ): Promise<ComponentRequest>;
  /** Attach a validation result to a specific version and update status. */
  setValidationResult(
    id: string,
    versionId: string,
    result: RequestValidationResult
  ): Promise<ComponentRequest>;
  /** Apply an explicit status transition (validated against the lifecycle). */
  setStatus(id: string, status: RequestStatus): Promise<ComponentRequest>;
  /** Record a reviewer decision and move the request to the matching status. */
  setReviewDecision(
    id: string,
    decision: ReviewDecision
  ): Promise<ComponentRequest>;
}
