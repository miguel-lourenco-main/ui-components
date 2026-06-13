/**
 * Standalone MCP server for the UI components library.
 *
 * Exposes read tools for the published registry and request tools for
 * agent-proposed components/themes, all backed by the shared contracts,
 * registry readers, validation layer, and file-backed request store.
 *
 * Run with: pnpm mcp   (stdio transport)
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { FileRequestStore } from "@/lib/requests";
import { createHandlers, ToolInputError } from "./handlers";
import { TOOL_DEFS } from "./tool-defs";

const store = new FileRequestStore();
const handlers = createHandlers(store);

const server = new Server(
  { name: "ui-components", version: "0.1.0" },
  {
    capabilities: { tools: {} },
    instructions:
      "Access published UI components and themes, and propose new ones or updates. " +
      "Use list_components/get_component and list_themes/get_theme to reuse existing assets. " +
      "Use create_*_request / update_*_request to submit proposals; all proposals are validated and reviewed before publishing.",
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = handlers[name];
  if (!handler) {
    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
    };
  }

  try {
    const result = await handler((args ?? {}) as Record<string, unknown>);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    // Surface user-safe messages; log full detail to stderr for developers.
    const safeMessage =
      error instanceof ToolInputError || (error as Error)?.name === "RequestStoreError"
        ? (error as Error).message
        : "Internal error while handling the request.";
    console.error(`[mcp] tool "${name}" failed:`, error);
    return {
      isError: true,
      content: [{ type: "text", text: safeMessage }],
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcp] ui-components server ready (stdio)");
}

main().catch((error) => {
  console.error("[mcp] fatal:", error);
  process.exit(1);
});
