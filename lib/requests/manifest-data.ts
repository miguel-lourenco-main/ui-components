/**
 * Browser-safe accessor for the generated requests manifest.
 *
 * Imports the static `data/requests/index.json` produced by the file-backed
 * store (no filesystem access), so it is safe for client components and the
 * static export build.
 */
import manifest from "@/data/requests/index.json";
import type { ComponentRequest, RequestsManifest } from "@/lib/contracts";

const data = manifest as unknown as RequestsManifest;

/** All requests from the manifest, newest first (as persisted). */
export const REQUESTS: ComponentRequest[] = data.requests ?? [];

/** Look up a single request by id. */
export function getRequestById(id: string): ComponentRequest | undefined {
  return REQUESTS.find((r) => r.id === id);
}
