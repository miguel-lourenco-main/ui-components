"use client"

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
import { RequestCard } from "@/components/request-card"
import { RequestInteractivePreview } from "@/components/request-interactive-preview"
import { RequestStatusBadge } from "@/components/request-status-badge"
import { EmptyState } from "@/components/empty-state"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger"
import {
  ArrowLeft,
  GitPullRequestArrow,
  CheckCircle2,
  Check,
  X,
  XCircle,
  AlertTriangle,
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
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-label="Error" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-label="Warning" />
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
            <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" aria-hidden />
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
            <span>· updated {new Date(request.updatedAt).toLocaleString()}</span>
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

        {current && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Preview</h2>
            <RequestInteractivePreview payload={current.payload} />
          </div>
        )}

        <Tabs defaultValue="source">
          <TabsList>
            <TabsTrigger value="source">Source</TabsTrigger>
            {files.length > 0 && (
              <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
            )}
          </TabsList>

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
        </Tabs>
      </div>
    </PageTransition>
  )
}

/**
 * Requests review route. Mirrors the components catalog: a grid of request
 * cards, or a detailed view when `?request=<id>` is present.
 */
export default function RequestsPage() {
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

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-12 text-center">
          <div className="mb-4 flex w-full items-center justify-center space-x-2">
            <GitPullRequestArrow className="size-9" aria-hidden />
            <h1 className="text-display text-4xl font-bold">Component Requests</h1>
          </div>
          <p className="mb-8 text-xl text-muted-foreground">
            Agent-proposed components and themes awaiting review
          </p>
        </FadeIn>

        {REQUESTS.length === 0 ? (
          <EmptyState
            icon={GitPullRequestArrow}
            title="No requests yet"
            description="Requests submitted by agents through the MCP server will appear here."
          />
        ) : (
          <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REQUESTS.map((request) => (
              <StaggerItem key={request.id} className="h-full">
                <RequestCard request={request} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  )
}
