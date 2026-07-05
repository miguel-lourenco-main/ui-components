"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { PageTransition } from "@/components/page-transition"
import { RequestInteractivePreview } from "@/components/request-interactive-preview"
import { RequestStatusBadge } from "@/components/request-status-badge"
import { RequestVersionHistory } from "@/components/request-version-history"
import { RequestDiffView } from "@/components/request-diff-view"
import { RequestsBrowser } from "@/components/requests-browser"
import { RelativeTime } from "@/components/relative-time"
import { EmptyState } from "@/components/empty-state"
import { FadeIn } from "@/components/motion/fade-in"
import {
  ArrowLeft,
  GitPullRequestArrow,
  CheckCircle2,
  Check,
  X,
  XCircle,
  AlertTriangle,
  User,
} from "lucide-react"
import { REQUESTS, getRequestById } from "@/lib/requests/manifest-data"
import { payloadFiles, primarySource } from "@/lib/requests/presentation"
import type {
  ComponentRequest,
  RequestType,
  RequestValidationResult,
  ValidationIssue,
} from "@/lib/contracts"

const TYPE_LABELS: Record<RequestType, string> = {
  new_component: "New component",
  component_update: "Component update",
  new_theme: "New theme",
  theme_update: "Theme update",
}

function ValidationIssueItem({ issue }: { issue: ValidationIssue }) {
  return (
    <li className="flex items-start gap-2">
      {issue.severity === "error" ? (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label="Error" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-label="Warning" />
      )}
      <span>
        <span className="font-mono text-xs text-muted-foreground">
          {issue.code}
        </span>{" "}
        {issue.message}
        {issue.path ? (
          <span className="text-muted-foreground"> ({issue.path})</span>
        ) : null}
      </span>
    </li>
  )
}

function ValidationSummary({ result }: { result: RequestValidationResult }) {
  const errors = result.issues.filter((i) => i.severity === "error")
  const warnings = result.issues.filter((i) => i.severity === "warning")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" role="status">
          {result.valid ? (
            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
          ) : (
            <XCircle className="h-5 w-5 text-danger" aria-hidden />
          )}
          Validation {result.valid ? "passed" : "failed"}
        </CardTitle>
        <CardDescription>
          {errors.length} error(s), {warnings.length} warning(s) · checked{" "}
          {new Date(result.checkedAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {result.checks.map((check) => (
            <Badge
              key={check.name}
              variant={check.passed ? "secondary" : "destructive"}
              className="gap-1 text-xs"
            >
              {check.passed ? (
                <Check className="h-3 w-3" aria-label="Passed" />
              ) : (
                <X className="h-3 w-3" aria-label="Failed" />
              )}
              {check.name}
            </Badge>
          ))}
        </div>
        {result.issues.length > 0 && (
          <ul className="space-y-1 text-sm">
            {errors.map((issue, idx) => (
              <ValidationIssueItem key={`error-${idx}`} issue={issue} />
            ))}
            {warnings.map((issue, idx) => (
              <ValidationIssueItem key={`warning-${idx}`} issue={issue} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function RequestDetail({ request }: { request: ComponentRequest }) {
  const current = request.versions.find((v) => v.id === request.currentVersionId)
  const files = current ? payloadFiles(current.payload) : []
  const source = current ? primarySource(current.payload) : ""
  const language = current?.payload.kind === "theme" ? "json" : "tsx"

  return (
    <PageTransition>
      <div className="space-y-6">
        <Link
          href="/requests"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-display text-3xl font-bold">{request.title}</h1>
            <RequestStatusBadge status={request.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{TYPE_LABELS[request.type]}</Badge>
            {request.targetId && (
              <Link
                href={
                  request.type === "theme_update"
                    ? `/themes?theme=${request.targetId}`
                    : `/components?component=${request.targetId}`
                }
                className="underline hover:text-foreground"
              >
                Targets: {request.targetId}
              </Link>
            )}
            {current?.authorAgent && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" aria-hidden />
                {current.authorAgent}
              </span>
            )}
            <span>
              · updated <RelativeTime iso={request.updatedAt} />
            </span>
          </div>
        </div>

        {request.reviewDecision && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review decision</CardTitle>
              <CardDescription>
                {request.reviewDecision.decision} by{" "}
                {request.reviewDecision.reviewer} ·{" "}
                {new Date(request.reviewDecision.decidedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            {request.reviewDecision.notes && (
              <CardContent className="text-sm">
                {request.reviewDecision.notes}
              </CardContent>
            )}
          </Card>
        )}

        {current?.validation && <ValidationSummary result={current.validation} />}

        <div className="grid gap-6 lg:grid-cols-2">
          {current && (
            <div className="flex flex-col h-full space-y-2 lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-lg font-semibold">Preview</h2>
              <RequestInteractivePreview payload={current.payload} />
            </div>
          )}

          <div className="min-w-0">
            <Tabs defaultValue={request.baseline ? "baseline" : "source"}>
              <TabsList>
            {request.baseline && (
              <TabsTrigger value="baseline">Changes vs current</TabsTrigger>
            )}
            <TabsTrigger value="source">Source</TabsTrigger>
            {files.length > 0 && (
              <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
            )}
            {request.versions.length > 1 && (
              <TabsTrigger value="history">
                History ({request.versions.length})
              </TabsTrigger>
            )}
          </TabsList>

          {request.baseline && (
            <TabsContent value="baseline" className="mt-4 space-y-1">
              <div className="font-mono text-xs text-muted-foreground">
                {request.baseline.sourcePath} · current → proposed
              </div>
              <RequestDiffView before={request.baseline.source} after={source} />
            </TabsContent>
          )}

          <TabsContent value="source" className="mt-4">
            <CodeBlock code={source} language={language} className="max-h-[32rem]" />
          </TabsContent>

          {files.length > 0 && (
            <TabsContent value="files" className="mt-4 space-y-4">
              {files.map((file) => (
                <div key={file.path}>
                  <div className="mb-1 font-mono text-xs text-muted-foreground">
                    {file.path}
                  </div>
                  <CodeBlock
                    code={file.contents}
                    language={file.path.endsWith(".json") ? "json" : "tsx"}
                    className="max-h-96"
                  />
                </div>
              ))}
            </TabsContent>
          )}

              {request.versions.length > 1 && (
                <TabsContent value="history" className="mt-4">
                  <RequestVersionHistory request={request} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

function RequestsPageInner() {
  const searchParams = useSearchParams()
  const requestId = searchParams.get("request")
  const selected = requestId ? getRequestById(requestId) : undefined

  if (requestId && !selected) {
    return (
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/requests"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All requests
          </Link>
          <EmptyState
            icon={GitPullRequestArrow}
            title="Request not found"
            description="This request may have been removed, or the link is out of date."
            action={{ label: "View all requests", href: "/requests" }}
            className="mt-6"
          />
        </div>
      </div>
    )
  }

  if (selected) {
    return (
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <RequestDetail request={selected} />
        </div>
      </div>
    )
  }

  const stats = [
    { value: REQUESTS.length, label: "Total" },
    {
      value: REQUESTS.filter((r) => r.status === "pending_review").length,
      label: "Pending",
    },
    {
      value: REQUESTS.filter((r) => r.status === "needs_changes").length,
      label: "Needs changes",
    },
  ]

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-10">
          <div className="ed-mono flex flex-wrap items-center justify-between gap-2 pb-4 text-muted-foreground">
            <span>Review Queue</span>
            <span className="text-type-accent">Agent proposals</span>
            <span className="hidden sm:inline">Est. 2026</span>
          </div>
          <div className="ed-rule" />
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-display text-4xl font-bold md:text-5xl">
                Component Requests
              </h1>
              <p className="mt-3 max-w-xl text-lg text-muted-foreground">
                Components and themes proposed by agents over MCP, awaiting human
                review.
              </p>
            </div>
            {REQUESTS.length > 0 && (
              <div className="flex gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <span className="text-display text-3xl font-bold tabular-nums">
                      {stat.value}
                    </span>
                    <span className="ed-mono ml-2 text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {REQUESTS.length === 0 ? (
          <EmptyState
            icon={GitPullRequestArrow}
            title="No requests yet"
            description="Requests submitted by agents through the MCP server will appear here."
          />
        ) : (
          <RequestsBrowser requests={REQUESTS} />
        )}
      </div>
    </div>
  )
}

/**
 * Requests review route. Mirrors the components catalog: a queue of request
 * cards, or a detailed view when `?request=<id>` is present. Wrapped in Suspense
 * because it reads `useSearchParams` (required by Next for static generation).
 */
export default function RequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="container px-4 py-8">
          <div className="mx-auto max-w-6xl text-muted-foreground">
            Loading requests…
          </div>
        </div>
      }
    >
      <RequestsPageInner />
    </Suspense>
  )
}
