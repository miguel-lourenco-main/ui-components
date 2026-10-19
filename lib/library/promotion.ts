/**
 * Promoting a library entry into the playground (browser-safe, pure).
 *
 * Promotion does not publish anything by itself: it creates an ordinary
 * `new_component` request, pre-filled from the entry, which then goes through
 * the existing validate -> review -> `pnpm publish:request` path. This module
 * builds that request and decides whether an entry can be promoted; the MCP
 * handler `promote_library_entry` (Node) is the only writer.
 *
 * Duplicate guard: an entry cannot be promoted while a request for it is open
 * (draft / validation_failed / pending_review / needs_changes / approved), once
 * one was published or the registry already has its id, or when a request for
 * the same source was rejected. Changing the source (a new content hash) and
 * re-importing allows a new attempt after a rejection.
 */
import type {
  ComponentIndexFile,
  ComponentMetaContract,
  ComponentRequest,
  LibraryComponent,
  ProposedFile,
  RequestOrigin,
  RequestStatus,
} from "@/lib/contracts";

/** Directory (under the registry) that promoted library components land in. */
export const PROMOTED_DIR = "components/display-components/library";

/** `authorAgent` recorded on promotion requests. */
export const PROMOTION_AUTHOR = "library-promote";

const REGISTRY_NAME = /^[A-Za-z][A-Za-z0-9]*$/;
const OPEN_STATUSES: RequestStatus[] = ["draft", "validation_failed", "pending_review", "needs_changes", "approved"];

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Registry id and target directory for a promoted entry. */
export function promotionTarget(entry: Pick<LibraryComponent, "id" | "name" | "source">) {
  // The library id is unique across projects, so it cannot collide with a
  // hand-registered component of the same name (e.g. my-cv's Button vs Button).
  return {
    componentId: entry.id,
    dir: `${PROMOTED_DIR}/${slug(entry.source.project) || "project"}/${entry.name}`,
  };
}

/** One idempotency key per entry and source version. */
export function promotionKey(entry: Pick<LibraryComponent, "id" | "contentHash">): string {
  return `library:${entry.id}@${entry.contentHash.slice(0, 12)}`;
}

export function promotionOrigin(entry: LibraryComponent): RequestOrigin {
  const { project, repo, path, commit } = entry.source;
  return {
    kind: "library",
    libraryId: entry.id,
    project,
    ...(repo ? { repo } : {}),
    path,
    ...(commit ? { commit } : {}),
    contentHash: entry.contentHash,
  };
}

export interface PromotionRequestInput {
  title: string;
  rationale: string;
  meta: ComponentMetaContract;
  files: ProposedFile[];
  idempotencyKey: string;
  authorAgent: string;
  origin: RequestOrigin;
}

/** The `new_component` request a promotion creates: source, props contract and provenance. */
export function buildPromotionRequest(entry: LibraryComponent): PromotionRequestInput {
  const { componentId, dir } = promotionTarget(entry);
  const where = `${entry.source.project}:${entry.source.path}`;
  const meta: ComponentMetaContract = {
    id: componentId,
    name: entry.name,
    category: entry.category,
    description: entry.description || `${entry.name} from ${where}.`,
    props: entry.props.map(({ tsType: _ts, defaultExpression: _expr, ...prop }) => prop),
    tags: Array.from(new Set(["library", ...entry.tags])),
    version: "1.0.0",
    author: entry.source.project,
    code: entry.code,
    dependencies: entry.dependencies,
  };
  const at = entry.source.commit ? ` @ ${entry.source.commit.slice(0, 8)}` : "";
  const lines = [
    `Promoted from the component library entry ${entry.id} (${where}${at}).`,
    entry.source.repo ? `Source: ${entry.source.repo}` : undefined,
    entry.localImports.length > 0
      ? `Review: the source imports project-local modules that must resolve in this repo before publishing: ${entry.localImports.join(", ")}.`
      : undefined,
    entry.propsExtends.length > 0
      ? `Props also extend ${entry.propsExtends.join(", ")}; those props are not listed in the contract.`
      : undefined,
  ].filter(Boolean);
  return {
    title: `Promote ${entry.name} from ${entry.source.project}`,
    rationale: lines.join("\n"),
    meta,
    files: [
      { path: `${dir}/${entry.name}.tsx`, contents: entry.code },
      { path: `${dir}/${entry.name}.meta.json`, contents: `${JSON.stringify(meta, null, 2)}\n` },
    ],
    idempotencyKey: promotionKey(entry),
    authorAgent: PROMOTION_AUTHOR,
    origin: promotionOrigin(entry),
  };
}

export type PromotionState =
  | { state: "available" }
  | { state: "pending"; requestId: string; status: RequestStatus }
  | { state: "promoted"; componentId: string; requestId?: string }
  | { state: "rejected"; requestId: string }
  | { state: "unsupported"; reason: string };

/** Requests created from this library entry, newest first. */
export function requestsForEntry(entryId: string, requests: ComponentRequest[]): ComponentRequest[] {
  return requests
    .filter(
      (r) => r.origin?.libraryId === entryId || r.idempotencyKey?.startsWith(`library:${entryId}@`)
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Whether an entry can be promoted, given the current requests and the
 * registry's component ids.
 */
export function promotionState(
  entry: Pick<LibraryComponent, "id" | "name" | "source" | "contentHash">,
  requests: ComponentRequest[],
  registryIds: string[]
): PromotionState {
  const { componentId } = promotionTarget(entry);
  const related = requestsForEntry(entry.id, requests);
  const published = related.find((r) => r.status === "published");
  if (published || registryIds.some((id) => id.toLowerCase() === componentId)) {
    return { state: "promoted", componentId, ...(published ? { requestId: published.id } : {}) };
  }
  const open = related.find((r) => OPEN_STATUSES.includes(r.status));
  if (open) return { state: "pending", requestId: open.id, status: open.status };
  const key = promotionKey(entry);
  const rejected = related.find((r) => r.status === "rejected" && r.idempotencyKey === key);
  if (rejected) return { state: "rejected", requestId: rejected.id };
  if (!REGISTRY_NAME.test(entry.name)) {
    return { state: "unsupported", reason: `"${entry.name}" is not a valid registry component name.` };
  }
  return { state: "available" };
}

/** Registry ids from `components/display-components/index.json`. */
export function registryIdsFrom(index: Pick<ComponentIndexFile, "components">): string[] {
  return index.components.map((c) => c.id.toLowerCase());
}

/** Human-readable reason an entry cannot be promoted right now, or undefined. */
export function promotionBlocker(state: PromotionState): string | undefined {
  switch (state.state) {
    case "available":
      return undefined;
    case "pending":
      return `Already requested: ${state.requestId} is ${state.status.replace(/_/g, " ")}.`;
    case "promoted":
      return `Already in the playground as "${state.componentId}"${state.requestId ? ` (${state.requestId})` : ""}.`;
    case "rejected":
      return `Request ${state.requestId} for this exact source was rejected. Change the source and re-import to try again.`;
    case "unsupported":
      return state.reason;
  }
}
