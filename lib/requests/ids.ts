/**
 * Deterministic and random ID helpers for requests.
 */
import { createHash, randomUUID } from "node:crypto";

/** Lowercase, hyphenated slug suitable for ids/filenames. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Build a request id. When an idempotency key is provided the id is a stable
 * hash of that key, so repeated create calls resolve to the same request.
 * Otherwise a short random id is generated.
 */
export function buildRequestId(opts: {
  idempotencyKey?: string;
  title?: string;
}): string {
  if (opts.idempotencyKey) {
    const hash = createHash("sha256")
      .update(opts.idempotencyKey)
      .digest("hex")
      .slice(0, 12);
    return `req-${hash}`;
  }
  const base = opts.title ? slugify(opts.title) : "request";
  const rand = randomUUID().split("-")[0];
  return `req-${base || "request"}-${rand}`;
}

/** Sequential version id based on existing version count (1-indexed). */
export function nextVersionId(existingCount: number): string {
  return `v${existingCount + 1}`;
}
