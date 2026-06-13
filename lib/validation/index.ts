/**
 * Validation layer entrypoint.
 *
 * Schema, file-safety, code-syntax, metadata, theme, and request validation used
 * by the MCP server, the `validate:registry` script, and tests.
 */
export * from "./limits";
export * from "./schema";
export * from "./code";
export * from "./files";
export * from "./components";
export * from "./themes";
export * from "./requests";
