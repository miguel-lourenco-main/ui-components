/**
 * Backfill `baseline` + refreshed validation onto existing `component_update`
 * requests, so the review UI can diff existing-vs-proposed and the
 * API-compatibility check runs against manifests created before those features
 * existed.
 *
 * Idempotent and non-destructive: only touches component_update requests that
 * lack a baseline; leaves every other request untouched (unlike re-seeding,
 * which regenerates the whole set).
 *
 * Usage: pnpm tsx scripts/backfill-request-baselines.ts
 */
import fs from "node:fs";
import path from "node:path";
import { FileRequestStore } from "@/lib/requests";
import { captureComponentBaseline } from "@/lib/requests/baseline";
import { validateRequest } from "@/lib/validation";
import { REQUESTS_DIR } from "@/lib/registry/paths";
import type { ComponentRequest } from "@/lib/contracts";

async function main(): Promise<void> {
  const store = new FileRequestStore();
  const requests = await store.listRequests();
  let changed = 0;

  for (const request of requests) {
    if (request.type !== "component_update" || !request.targetId) continue;
    if (request.baseline) continue;

    const baseline = captureComponentBaseline(request.targetId);
    if (!baseline) {
      console.warn(
        `Skipped ${request.id}: target "${request.targetId}" not in the registry.`
      );
      continue;
    }

    // Persist the baseline, then refresh validation through the store so status
    // transitions stay legal and the manifest is regenerated.
    const withBaseline: ComponentRequest = { ...request, baseline };
    fs.writeFileSync(
      path.join(REQUESTS_DIR, `${request.id}.json`),
      `${JSON.stringify(withBaseline, null, 2)}\n`
    );
    const validation = validateRequest(withBaseline);
    const updated = await store.setValidationResult(
      request.id,
      request.currentVersionId,
      validation
    );
    changed++;
    console.log(
      `Backfilled ${request.id} (${request.title}): valid=${validation.valid}, status=${updated.status}`
    );
  }

  console.log(`Done. ${changed} of ${requests.length} request(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
