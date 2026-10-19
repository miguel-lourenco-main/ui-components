/**
 * Dev-only endpoint behind the library's "Promote to playground" button.
 *
 * The `.dev.ts` extension is only registered by `next dev` (see
 * next.config.js), so this route does not exist in the static export. It
 * creates a `new_component` request through the same code as the
 * `promote_library_entry` MCP tool and `pnpm library:promote`.
 */
import { NextResponse } from "next/server";
import { FileRequestStore } from "@/lib/requests";
import { promoteLibraryEntry } from "@/mcp/handlers";

/** Same-origin JSON only: `next dev` listens on all interfaces. */
function rejectForeign(request: Request): NextResponse | undefined {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ ok: false, message: "Promotion is only available in local dev." }, { status: 404 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ ok: false, message: "Expected a JSON body." }, { status: 415 });
  }
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ ok: false, message: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  return undefined;
}

export async function POST(request: Request) {
  const rejected = rejectForeign(request);
  if (rejected) return rejected;
  const body = (await request.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  const result = await promoteLibraryEntry(new FileRequestStore(), id);
  if (!result.ok) {
    return NextResponse.json(result, { status: result.code === "not_found" ? 404 : 409 });
  }
  return NextResponse.json({
    ok: true,
    requestId: result.request.id,
    status: result.request.status,
    valid: result.validation.valid,
    issues: result.validation.issues,
  });
}
