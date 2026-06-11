/**
 * File-backed implementation of `RequestStore`.
 *
 * Each request is stored as `data/requests/<id>.json`, and a generated
 * `data/requests/index.json` manifest aggregates all requests for static
 * consumption by the review UI. Treats all inputs as untrusted: validates
 * type/payload consistency, status transitions, and editability before writing.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type {
  ComponentRequest,
  RequestStatus,
  RequestsManifest,
  RequestValidationResult,
  RequestVersion,
  ReviewDecision,
} from "@/lib/contracts";
import { isAgentEditable, payloadKindForType } from "@/lib/contracts";
import { canTransition, isTerminalStatus } from "@/lib/contracts";
import { REQUESTS_DIR, REQUESTS_MANIFEST_PATH } from "@/lib/registry/paths";
import { buildRequestId, nextVersionId } from "./ids";
import {
  RequestStore,
  RequestStoreError,
  type CreateRequestInput,
  type UpdateRequestInput,
} from "./store";

const MANIFEST_VERSION = 1;

export interface FileRequestStoreOptions {
  /** Override the requests directory (used by tests for isolation). */
  dir?: string;
}

export class FileRequestStore implements RequestStore {
  private readonly dir: string;
  private readonly manifestPath: string;

  constructor(options: FileRequestStoreOptions = {}) {
    this.dir = options.dir ?? REQUESTS_DIR;
    this.manifestPath = path.join(this.dir, "index.json");
  }

  private requestPath(id: string): string {
    return path.join(this.dir, `${id}.json`);
  }

  private async ensureDir(): Promise<void> {
    await fsp.mkdir(this.dir, { recursive: true });
  }

  async listRequests(): Promise<ComponentRequest[]> {
    if (!fs.existsSync(this.dir)) return [];
    const files = await fsp.readdir(this.dir);
    const requests: ComponentRequest[] = [];
    for (const file of files) {
      if (!file.endsWith(".json") || file === "index.json") continue;
      try {
        const raw = await fsp.readFile(path.join(this.dir, file), "utf8");
        const parsed = JSON.parse(raw) as ComponentRequest;
        // Only accept objects that look like requests; ignore any other JSON
        // that may share the directory.
        if (
          parsed &&
          typeof parsed.id === "string" &&
          typeof parsed.updatedAt === "string" &&
          Array.isArray(parsed.versions)
        ) {
          requests.push(parsed);
        }
      } catch {
        // Ignore unreadable/corrupt entries so listing stays resilient.
      }
    }
    return requests.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getRequest(id: string): Promise<ComponentRequest | undefined> {
    const file = this.requestPath(id);
    if (!fs.existsSync(file)) return undefined;
    const raw = await fsp.readFile(file, "utf8");
    return JSON.parse(raw) as ComponentRequest;
  }

  async createRequest(input: CreateRequestInput): Promise<ComponentRequest> {
    this.assertTypePayload(input.type, input.payload.kind);
    this.assertNonEmpty("title", input.title);
    this.assertNonEmpty("rationale", input.rationale);

    const id = buildRequestId({
      idempotencyKey: input.idempotencyKey,
      title: input.title,
    });

    const existing = await this.getRequest(id);
    if (existing) {
      // Idempotent create resolves to an update of the existing request.
      if (!isAgentEditable(existing.status)) {
        throw new RequestStoreError(
          `Request ${id} exists with status "${existing.status}" and cannot be updated. Create a new request.`,
          "not_editable"
        );
      }
      return this.updateRequest(id, {
        rationale: input.rationale,
        payload: input.payload,
        authorAgent: input.authorAgent,
      });
    }

    const now = new Date().toISOString();
    const versionId = nextVersionId(0);
    const version: RequestVersion = {
      id: versionId,
      createdAt: now,
      authorAgent: input.authorAgent,
      rationale: input.rationale,
      payload: input.payload,
    };
    const request: ComponentRequest = {
      id,
      type: input.type,
      status: "draft",
      title: input.title,
      targetId: input.targetId,
      currentVersionId: versionId,
      versions: [version],
      createdAt: now,
      updatedAt: now,
      idempotencyKey: input.idempotencyKey,
    };
    await this.persist(request);
    return request;
  }

  async updateRequest(
    id: string,
    input: UpdateRequestInput
  ): Promise<ComponentRequest> {
    const request = await this.requireRequest(id);
    if (!isAgentEditable(request.status)) {
      throw new RequestStoreError(
        `Request ${id} has status "${request.status}" and is not editable.`,
        "not_editable"
      );
    }
    this.assertTypePayload(request.type, input.payload.kind);
    this.assertNonEmpty("rationale", input.rationale);

    const versionId = nextVersionId(request.versions.length);
    const now = new Date().toISOString();
    const version: RequestVersion = {
      id: versionId,
      createdAt: now,
      authorAgent: input.authorAgent,
      rationale: input.rationale,
      payload: input.payload,
    };
    const updated: ComponentRequest = {
      ...request,
      versions: [...request.versions, version],
      currentVersionId: versionId,
      // A new version invalidates a prior failed validation; reset to draft
      // unless the request is awaiting changes (kept so reviewers see context).
      status: request.status === "validation_failed" ? "draft" : request.status,
      updatedAt: now,
    };
    await this.persist(updated);
    return updated;
  }

  async setValidationResult(
    id: string,
    versionId: string,
    result: RequestValidationResult
  ): Promise<ComponentRequest> {
    const request = await this.requireRequest(id);
    const version = request.versions.find((v) => v.id === versionId);
    if (!version) {
      throw new RequestStoreError(
        `Version ${versionId} not found on request ${id}.`,
        "version_not_found"
      );
    }
    version.validation = result;

    let status = request.status;
    if (versionId === request.currentVersionId) {
      const desired: RequestStatus = result.valid
        ? "pending_review"
        : "validation_failed";
      if (canTransition(request.status, desired)) {
        status = desired;
      }
    }

    const updated: ComponentRequest = {
      ...request,
      status,
      updatedAt: new Date().toISOString(),
    };
    await this.persist(updated);
    return updated;
  }

  async setStatus(
    id: string,
    status: RequestStatus
  ): Promise<ComponentRequest> {
    const request = await this.requireRequest(id);
    if (!canTransition(request.status, status)) {
      throw new RequestStoreError(
        `Illegal status transition: ${request.status} -> ${status}.`,
        "illegal_transition"
      );
    }
    const updated: ComponentRequest = {
      ...request,
      status,
      updatedAt: new Date().toISOString(),
    };
    await this.persist(updated);
    return updated;
  }

  async setReviewDecision(
    id: string,
    decision: ReviewDecision
  ): Promise<ComponentRequest> {
    const request = await this.requireRequest(id);
    if (isTerminalStatus(request.status)) {
      throw new RequestStoreError(
        `Request ${id} is in terminal status "${request.status}".`,
        "terminal_status"
      );
    }
    const targetStatus = decision.decision; // approved | rejected | needs_changes
    if (!canTransition(request.status, targetStatus)) {
      throw new RequestStoreError(
        `Cannot apply decision "${decision.decision}" from status "${request.status}".`,
        "illegal_transition"
      );
    }
    const updated: ComponentRequest = {
      ...request,
      status: targetStatus,
      reviewDecision: decision,
      updatedAt: new Date().toISOString(),
    };
    await this.persist(updated);
    return updated;
  }

  // --- internals ---

  private async requireRequest(id: string): Promise<ComponentRequest> {
    const request = await this.getRequest(id);
    if (!request) {
      throw new RequestStoreError(`Request ${id} not found.`, "not_found");
    }
    return request;
  }

  private assertTypePayload(
    type: ComponentRequest["type"],
    payloadKind: string
  ): void {
    const expected = payloadKindForType(type);
    if (expected !== payloadKind) {
      throw new RequestStoreError(
        `Payload kind "${payloadKind}" does not match request type "${type}" (expected "${expected}").`,
        "payload_mismatch"
      );
    }
  }

  private assertNonEmpty(field: string, value: unknown): void {
    if (typeof value !== "string" || value.trim() === "") {
      throw new RequestStoreError(
        `Field "${field}" must be a non-empty string.`,
        "invalid_input"
      );
    }
  }

  private async persist(request: ComponentRequest): Promise<void> {
    await this.ensureDir();
    await this.writeJson(this.requestPath(request.id), request);
    await this.regenerateManifest();
  }

  private async regenerateManifest(): Promise<void> {
    const requests = await this.listRequests();
    const manifest: RequestsManifest = {
      version: MANIFEST_VERSION,
      generatedAt: new Date().toISOString(),
      requests,
    };
    await this.writeJson(this.manifestPath, manifest);
  }

  private async writeJson(file: string, data: unknown): Promise<void> {
    const tmp = `${file}.tmp`;
    await fsp.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await fsp.rename(tmp, file);
  }
}
