/**
 * Core MCP tool logic, decoupled from the transport so it can be unit tested.
 *
 * Read tools expose the published registry; request tools create/update
 * agent proposals through the `RequestStore` and attach validation results.
 * All inputs are treated as untrusted and validated before use.
 */
import {
  getComponent,
  getComponentSource,
  listComponents,
  searchComponents,
} from "@/lib/registry/components";
import { getTheme, listThemeSummaries, listThemes } from "@/lib/registry/themes";
import { validatePayload } from "@/lib/validation";
import { captureComponentBaseline } from "@/lib/requests/baseline";
import { readLibraryEntry } from "@/lib/library/store";
import {
  buildPromotionRequest,
  promotionBlocker,
  promotionState,
  type PromotionState,
} from "@/lib/library/promotion";
import { buildValidationResult } from "@/lib/contracts";
import type {
  ComponentMetaContract,
  ComponentRequest,
  ProposedFile,
  RequestOrigin,
  RequestValidationResult,
  ThemeContract,
} from "@/lib/contracts";
import type { RequestStore } from "@/lib/requests";

/** Thrown for invalid tool input; surfaced to the agent as a safe error. */
export class ToolInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolInputError";
  }
}

type Args = Record<string, unknown>;

function requireString(args: Args, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ToolInputError(`"${key}" is required and must be a non-empty string.`);
  }
  return value;
}

function optionalString(args: Args, key: string): string | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new ToolInputError(`"${key}" must be a string.`);
  }
  return value;
}

function requireObject<T>(args: Args, key: string): T {
  const value = args[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ToolInputError(`"${key}" is required and must be an object.`);
  }
  return value as T;
}

function requireFiles(args: Args): ProposedFile[] {
  const value = args.files;
  if (!Array.isArray(value)) {
    throw new ToolInputError(`"files" is required and must be an array.`);
  }
  return value.map((entry, idx) => {
    if (typeof entry !== "object" || entry === null) {
      throw new ToolInputError(`files[${idx}] must be an object.`);
    }
    const file = entry as Record<string, unknown>;
    if (typeof file.path !== "string" || typeof file.contents !== "string") {
      throw new ToolInputError(`files[${idx}] must have string "path" and "contents".`);
    }
    return { path: file.path, contents: file.contents };
  });
}

/** Validate the current version of a request and persist the result. */
async function validateAndAttach(
  store: RequestStore,
  request: ComponentRequest
): Promise<{ request: ComponentRequest; validation: RequestValidationResult }> {
  const current = request.versions.find(
    (v) => v.id === request.currentVersionId
  );
  if (!current) {
    throw new ToolInputError("Request has no current version to validate.");
  }
  const { issues, checks } = validatePayload(
    request.type,
    current.payload,
    request.targetId
  );
  const validation = buildValidationResult(
    checks,
    issues,
    new Date().toISOString()
  );
  const updated = await store.setValidationResult(
    request.id,
    current.id,
    validation
  );
  return { request: updated, validation };
}

/**
 * Compact API-compatibility summary for the create/update response, so a
 * requesting agent immediately sees which existing props its proposal drops and
 * can self-correct. Undefined for non-update requests (no `api-compatibility`
 * check ran).
 */
function summarizeApiCompatibility(validation: RequestValidationResult) {
  const check = validation.checks.find((c) => c.name === "api-compatibility");
  if (!check) return undefined;
  const apiIssues = validation.issues.filter((i) => i.code.startsWith("api."));
  return {
    passed: check.passed,
    lostProps: apiIssues
      .filter((i) => i.code === "api.prop_removed")
      .map((i) => ({ prop: i.path, severity: i.severity })),
    issues: apiIssues.map((i) => ({
      code: i.code,
      severity: i.severity,
      message: i.message,
    })),
  };
}

interface ComponentRequestArgs {
  title: string;
  rationale: string;
  meta: ComponentMetaContract;
  files: ProposedFile[];
  targetId?: string;
  type?: string;
  authorAgent?: string;
  idempotencyKey?: string;
  origin?: RequestOrigin;
}

/**
 * Create (or idempotently update) a component request and validate it. Shared
 * by `create_component_request` and library promotion, so both go through the
 * same store, validation and review path.
 */
async function createComponentRequest(store: RequestStore, input: ComponentRequestArgs) {
  const type =
    input.type === "component_update" || (!input.type && input.targetId)
      ? "component_update"
      : "new_component";

  const baseline =
    type === "component_update" && input.targetId
      ? captureComponentBaseline(input.targetId)
      : undefined;

  const request = await store.createRequest({
    type,
    title: input.title,
    targetId: input.targetId,
    rationale: input.rationale,
    payload: { kind: "component", meta: input.meta, files: input.files },
    authorAgent: input.authorAgent,
    idempotencyKey: input.idempotencyKey,
    baseline,
    origin: input.origin,
  });
  const result = await validateAndAttach(store, request);
  return {
    ...result,
    baseline: result.request.baseline,
    apiCompatibility: summarizeApiCompatibility(result.validation),
  };
}

export type PromoteResult =
  | { ok: true; request: ComponentRequest; validation: RequestValidationResult }
  | { ok: false; code: "not_found" | "blocked"; message: string; state?: PromotionState };

/**
 * Promote a library entry into the playground: create a `new_component`
 * request pre-filled from the entry (source, props contract, provenance).
 * Refuses when the entry is unknown, already promoted, or already requested.
 */
export async function promoteLibraryEntry(
  store: RequestStore,
  id: string,
  options: { libraryDir?: string; registryIds?: string[] } = {}
): Promise<PromoteResult> {
  const entry = readLibraryEntry(id, options.libraryDir);
  if (!entry) return { ok: false, code: "not_found", message: `Library entry "${id}" not found.` };
  const registryIds = options.registryIds ?? listComponents().map((c) => c.id);
  const state = promotionState(entry, await store.listRequests(), registryIds);
  const blocker = promotionBlocker(state);
  if (blocker) return { ok: false, code: "blocked", message: blocker, state };
  const { request, validation } = await createComponentRequest(store, {
    ...buildPromotionRequest(entry),
    type: "new_component",
  });
  return { ok: true, request, validation };
}

export interface McpHandlers {
  [tool: string]: (args: Args) => Promise<unknown>;
}

/** Build the handler map bound to a specific request store. */
export function createHandlers(store: RequestStore): McpHandlers {
  return {
    // --- read tools ---
    list_components: async () => ({ components: listComponents() }),

    search_components: async (args) => ({
      components: searchComponents(requireString(args, "query")),
    }),

    get_component: async (args) => {
      const id = requireString(args, "id");
      const component = getComponent(id);
      if (!component) throw new ToolInputError(`Component "${id}" not found.`);
      return component;
    },

    get_component_code: async (args) => {
      const id = requireString(args, "id");
      const source = getComponentSource(id);
      if (!source) throw new ToolInputError(`Component "${id}" not found.`);
      return source;
    },

    list_themes: async () => ({ themes: listThemeSummaries() }),

    get_theme: async (args) => {
      const id = requireString(args, "id");
      const theme = getTheme(id);
      if (!theme) throw new ToolInputError(`Theme "${id}" not found.`);
      return theme;
    },

    // --- request tools ---
    list_requests: async () => ({ requests: await store.listRequests() }),

    get_request: async (args) => {
      const id = requireString(args, "id");
      const request = await store.getRequest(id);
      if (!request) throw new ToolInputError(`Request "${id}" not found.`);
      return request;
    },

    get_validation_result: async (args) => {
      const id = requireString(args, "id");
      const request = await store.getRequest(id);
      if (!request) throw new ToolInputError(`Request "${id}" not found.`);
      const current = request.versions.find(
        (v) => v.id === request.currentVersionId
      );
      return {
        requestId: id,
        versionId: request.currentVersionId,
        validation: current?.validation ?? null,
      };
    },

    create_component_request: async (args) =>
      createComponentRequest(store, {
        title: requireString(args, "title"),
        rationale: requireString(args, "rationale"),
        meta: requireObject<ComponentMetaContract>(args, "meta"),
        files: requireFiles(args),
        targetId: optionalString(args, "targetId"),
        type: optionalString(args, "type"),
        authorAgent: optionalString(args, "authorAgent"),
        idempotencyKey: optionalString(args, "idempotencyKey"),
      }),

    promote_library_entry: async (args) => {
      const result = await promoteLibraryEntry(store, requireString(args, "id"));
      if (!result.ok) throw new ToolInputError(result.message);
      return { request: result.request, validation: result.validation };
    },

    update_component_request: async (args) => {
      const id = requireString(args, "id");
      const rationale = requireString(args, "rationale");
      const meta = requireObject<ComponentMetaContract>(args, "meta");
      const files = requireFiles(args);
      const request = await store.updateRequest(id, {
        rationale,
        payload: { kind: "component", meta, files },
        authorAgent: optionalString(args, "authorAgent"),
      });
      const result = await validateAndAttach(store, request);
      return {
        ...result,
        baseline: result.request.baseline,
        apiCompatibility: summarizeApiCompatibility(result.validation),
      };
    },

    create_theme_request: async (args) => {
      const title = requireString(args, "title");
      const rationale = requireString(args, "rationale");
      const theme = requireObject<ThemeContract>(args, "theme");
      const explicitType = optionalString(args, "type");
      const type = explicitType === "theme_update" ? "theme_update" : "new_theme";

      const request = await store.createRequest({
        type,
        title,
        targetId: type === "theme_update" ? theme.id : undefined,
        rationale,
        payload: { kind: "theme", theme },
        authorAgent: optionalString(args, "authorAgent"),
        idempotencyKey: optionalString(args, "idempotencyKey"),
      });
      return validateAndAttach(store, request);
    },

    update_theme_request: async (args) => {
      const id = requireString(args, "id");
      const rationale = requireString(args, "rationale");
      const theme = requireObject<ThemeContract>(args, "theme");
      const request = await store.updateRequest(id, {
        rationale,
        payload: { kind: "theme", theme },
        authorAgent: optionalString(args, "authorAgent"),
      });
      return validateAndAttach(store, request);
    },
  };
}
