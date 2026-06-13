import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest configuration for unit tests of the MCP feature (contracts, registry,
 * request store, validation). Browser/e2e tests remain in Playwright (`e2e/`).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "mcp/**/*.test.ts", "scripts/**/*.test.ts"],
    exclude: ["node_modules", "out", ".next", "e2e"],
  },
});
