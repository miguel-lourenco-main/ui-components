/**
 * Shared limits and allowlists for validating agent-proposed content.
 * Centralized so the MCP server, scripts, and tests agree on the same bounds.
 */

/** Maximum number of proposed files in a single component request. */
export const MAX_PROPOSED_FILES = 12;

/** Maximum size (bytes) of a single proposed file's contents. */
export const MAX_FILE_BYTES = 200_000;

/** Repo-relative path prefixes a component request is allowed to write to. */
export const ALLOWED_COMPONENT_PATH_PREFIXES = [
  "components/display-components/",
];

/** Allowed file extensions for proposed component files. */
export const ALLOWED_COMPONENT_FILE_EXTENSIONS = [
  ".tsx",
  ".ts",
  ".json",
  ".css",
  ".md",
];
