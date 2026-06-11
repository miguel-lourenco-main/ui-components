/**
 * Shared contract layer for the MCP feature.
 *
 * Canonical, serializable data shapes for components, themes, requests, request
 * versions, and validation results. Imported by the catalog UI, the registry
 * readers, the request store, the validation layer, and the MCP server so all
 * surfaces agree on a single source of truth.
 */
export * from "./components";
export * from "./themes";
export * from "./validation";
export * from "./requests";
export * from "./transitions";
