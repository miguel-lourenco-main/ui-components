/**
 * CLI: publish an approved request into the repo.
 *
 * Usage:
 *   pnpm tsx scripts/publish-request.ts <requestId>            # dry run (default)
 *   pnpm tsx scripts/publish-request.ts <requestId> --apply    # write files + mark published
 *   pnpm tsx scripts/publish-request.ts <requestId> --apply --mr  # also open a GitLab MR
 *
 * Dry run is the default so publishing is always an explicit, reviewed action.
 */
import { FileRequestStore } from "@/lib/requests";
import { publishRequest, createMergeRequestForPublish } from "@/lib/publish";

async function main(): Promise<void> {
  const [id, ...flags] = process.argv.slice(2);
  if (!id) {
    console.error("Usage: tsx scripts/publish-request.ts <requestId> [--apply] [--mr]");
    process.exitCode = 1;
    return;
  }
  const apply = flags.includes("--apply");
  const openMr = flags.includes("--mr");
  const store = new FileRequestStore();

  const result = await publishRequest(store, id, { dryRun: !apply });
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exitCode = 1;
    return;
  }

  if (apply && openMr) {
    const mr = await createMergeRequestForPublish({
      files: result.written,
      branch: `publish/${id}`,
      title: `Publish ${id}`,
      description: `Automated publish of request ${id}.`,
    });
    console.log("Merge request:", JSON.stringify(mr, null, 2));
  } else if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write changes.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
