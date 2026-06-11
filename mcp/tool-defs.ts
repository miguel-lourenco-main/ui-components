/**
 * MCP tool definitions (name, description, JSON Schema input). Declared
 * separately so they can be advertised via ListTools and reused in docs/tests.
 */
export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const EMPTY_INPUT = { type: "object", properties: {}, additionalProperties: false };

const COMPONENT_META_INPUT = {
  type: "object",
  description: "Component metadata matching the component-meta contract.",
};

const PROPOSED_FILES_INPUT = {
  type: "array",
  description: "Proposed files to write under components/display-components/.",
  items: {
    type: "object",
    required: ["path", "contents"],
    properties: {
      path: { type: "string" },
      contents: { type: "string" },
    },
  },
};

const THEME_INPUT = {
  type: "object",
  description: "A theme object matching the theme contract.",
};

export const TOOL_DEFS: ToolDef[] = [
  {
    name: "list_components",
    description:
      "List all published components (id, name, description, category, tags, version). Use before proposing to avoid duplicates.",
    inputSchema: EMPTY_INPUT,
  },
  {
    name: "search_components",
    description:
      "Search published components by name, id, category, description, or tags.",
    inputSchema: {
      type: "object",
      required: ["query"],
      additionalProperties: false,
      properties: { query: { type: "string" } },
    },
  },
  {
    name: "get_component",
    description:
      "Get full detail for one component: props, embedded code, dependencies, examples flag.",
    inputSchema: {
      type: "object",
      required: ["id"],
      additionalProperties: false,
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "get_component_code",
    description:
      "Get the authoritative on-disk source (<Name>.tsx) plus the embedded meta code for a component.",
    inputSchema: {
      type: "object",
      required: ["id"],
      additionalProperties: false,
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "list_themes",
    description: "List all published themes (id, name, description, style tokens).",
    inputSchema: EMPTY_INPUT,
  },
  {
    name: "get_theme",
    description:
      "Get a full theme by id including color tokens and per-component class maps.",
    inputSchema: {
      type: "object",
      required: ["id"],
      additionalProperties: false,
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "list_requests",
    description: "List all component/theme requests with their status and versions.",
    inputSchema: EMPTY_INPUT,
  },
  {
    name: "get_request",
    description: "Get a single request by id, including full version history.",
    inputSchema: {
      type: "object",
      required: ["id"],
      additionalProperties: false,
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "get_validation_result",
    description:
      "Get the validation result for a request's current version (errors, warnings, checks).",
    inputSchema: {
      type: "object",
      required: ["id"],
      additionalProperties: false,
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "create_component_request",
    description:
      "Propose a new component or an update to an existing one. Provide an idempotencyKey to dedupe; calling again with the same key updates the existing request. Returns the request and its validation result.",
    inputSchema: {
      type: "object",
      required: ["title", "rationale", "meta", "files"],
      additionalProperties: false,
      properties: {
        type: { type: "string", enum: ["new_component", "component_update"] },
        title: { type: "string" },
        targetId: {
          type: "string",
          description: "Existing component id when updating.",
        },
        rationale: { type: "string" },
        meta: COMPONENT_META_INPUT,
        files: PROPOSED_FILES_INPUT,
        authorAgent: { type: "string" },
        idempotencyKey: { type: "string" },
      },
    },
  },
  {
    name: "update_component_request",
    description:
      "Append a new version to an existing component request (only when draft/validation_failed/needs_changes). Returns the request and its validation result.",
    inputSchema: {
      type: "object",
      required: ["id", "rationale", "meta", "files"],
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        rationale: { type: "string" },
        meta: COMPONENT_META_INPUT,
        files: PROPOSED_FILES_INPUT,
        authorAgent: { type: "string" },
      },
    },
  },
  {
    name: "create_theme_request",
    description:
      "Propose a new theme or an update to an existing theme. Returns the request and its validation result.",
    inputSchema: {
      type: "object",
      required: ["title", "rationale", "theme"],
      additionalProperties: false,
      properties: {
        type: { type: "string", enum: ["new_theme", "theme_update"] },
        title: { type: "string" },
        rationale: { type: "string" },
        theme: THEME_INPUT,
        authorAgent: { type: "string" },
        idempotencyKey: { type: "string" },
      },
    },
  },
  {
    name: "update_theme_request",
    description:
      "Append a new version to an existing theme request. Returns the request and its validation result.",
    inputSchema: {
      type: "object",
      required: ["id", "rationale", "theme"],
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        rationale: { type: "string" },
        theme: THEME_INPUT,
        authorAgent: { type: "string" },
      },
    },
  },
];
