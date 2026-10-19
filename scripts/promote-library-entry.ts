/**
 * CLI: promote a component library entry into the playground.
 *
 * Usage: pnpm library:promote <library-entry-id>
 *
 * Creates a `new_component` request pre-filled from the entry (source, props
 * contract, provenance) in data/requests/, validated like any agent proposal.
 * Review it on /requests, then publish with `pnpm publish:request <id> --apply`.
 * Refuses when the entry is already in the playground or already requested.
 * The same action is the `promote_library_entry` MCP tool and, in `pnpm dev`,
 * the "Promote to playground" button on /library.
 */
import { FileRequestStore } from "@/lib/requests";
import { promoteLibraryEntry } from "@/mcp/handlers";

async function main(): Promise<void> {
  const [id] = process.argv.slice(2);
  if (!id) {
    console.error("Usage: pnpm library:promote <library-entry-id>");
    process.exitCode = 1;
    return;
  }
  const result = await promoteLibraryEntry(new FileRequestStore(), id);
  if (!result.ok) {
    console.error(result.message);
    process.exitCode = 1;
    return;
  }
  const { request, validation } = result;
  console.log(`Created ${request.id} (${request.status}): ${request.title}`);
  for (const issue of validation.issues) {
    console.log(`  ${issue.severity === "error" ? "ERROR" : "warn "} ${issue.message}`);
  }
  console.log(`\nReview it on /requests?request=${request.id}, then: pnpm publish:request ${request.id} --apply`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
