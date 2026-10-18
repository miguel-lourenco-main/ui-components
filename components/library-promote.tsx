"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Check, Copy, Loader2, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RequestStatusBadge } from "@/components/request-status-badge"
import registryIndex from "@/components/display-components/index.json"
import { REQUESTS } from "@/lib/requests/manifest-data"
import {
  promotionBlocker,
  promotionState,
  registryIdsFrom,
  type PromotionState,
} from "@/lib/library/promotion"
import type { LibraryComponent, RequestStatus } from "@/lib/contracts"

/** Only `next dev` serves the promote endpoint (`app/api/library/promote/route.dev.ts`). */
const CAN_WRITE = process.env.NODE_ENV === "development"

const REGISTRY_IDS = registryIdsFrom(registryIndex)

type Outcome =
  | { kind: "created"; requestId: string; status: RequestStatus; valid: boolean }
  | { kind: "error"; message: string; state?: PromotionState }

function CommandLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
      <code className="min-w-0 flex-1 break-all font-mono text-xs">{command}</code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        aria-label="Copy command"
        onClick={() => {
          navigator.clipboard?.writeText(command).then(
            () => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            },
            () => undefined
          )
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}

function StateLine({ state }: { state: PromotionState }) {
  if (state.state === "pending" || state.state === "rejected") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <RequestStatusBadge status={state.state === "pending" ? state.status : "rejected"} />
        <Link
          href={`/requests?request=${state.requestId}`}
          className="inline-flex items-center gap-1 font-mono text-xs underline hover:text-foreground"
        >
          {state.requestId} <ArrowUpRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    )
  }
  if (state.state === "promoted") {
    return (
      <Link
        href={`/playground?component=${state.componentId}`}
        className="inline-flex items-center gap-1 text-sm underline hover:text-foreground"
      >
        Open in the playground <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    )
  }
  return null
}

/**
 * "Promote to playground": creates a `new_component` request pre-filled from
 * the entry, which then goes through the normal review and publish flow on
 * /requests. Writing needs the repo, so the button works in `pnpm dev`; the
 * public site shows the equivalent command instead.
 */
export function LibraryPromote({ entry }: { entry: LibraryComponent }) {
  const [pending, setPending] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const state = useMemo<PromotionState>(() => {
    if (outcome?.kind === "created") {
      return { state: "pending", requestId: outcome.requestId, status: outcome.status }
    }
    if (outcome?.kind === "error" && outcome.state) return outcome.state
    return promotionState(entry, REQUESTS, REGISTRY_IDS)
  }, [entry, outcome])
  const blocker = promotionBlocker(state)

  async function promote() {
    setPending(true)
    setOutcome(null)
    try {
      const response = await fetch("/api/library/promote/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: entry.id }),
      })
      const body = await response.json()
      setOutcome(
        body.ok
          ? { kind: "created", requestId: body.requestId, status: body.status, valid: body.valid }
          : { kind: "error", message: body.message ?? "Promotion failed.", state: body.state }
      )
    } catch {
      setOutcome({ kind: "error", message: "Could not reach the dev server." })
    } finally {
      setPending(false)
    }
  }

  return (
    <Card data-testid="library-promote">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Playground</CardTitle>
        <CardDescription>
          Promoting opens a component request with this source, its props and its provenance.
          It is published only after review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {outcome?.kind === "created" ? (
          <p role="status">
            Request created{outcome.valid ? " and sent to review" : ", but validation failed: fix it before review"}.
          </p>
        ) : outcome?.kind === "error" && !outcome.state ? (
          <p role="alert" className="text-danger">
            {outcome.message}
          </p>
        ) : null}

        {blocker ? (
          <>
            {outcome?.kind !== "created" && <p className="text-muted-foreground">{blocker}</p>}
            <StateLine state={state} />
          </>
        ) : CAN_WRITE ? (
          <Button type="button" onClick={promote} disabled={pending} className="gap-2">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />}
            Promote to playground
          </Button>
        ) : (
          <>
            <Button type="button" disabled className="gap-2">
              <Rocket className="h-4 w-4" aria-hidden />
              Promote to playground
            </Button>
            <p className="text-muted-foreground">
              Promotion writes a request into the repository, so it runs from a local checkout:
            </p>
            <CommandLine command={`pnpm library:promote ${entry.id}`} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
