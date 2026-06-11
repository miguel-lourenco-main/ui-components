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
import {
  ArrowLeft,
  GitPullRequestArrow,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { REQUESTS, getRequestById } from "@/lib/requests/manifest-data"
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  payloadFiles,
  primarySource,
  versionSource,
  previousVersion,
} from "@/lib/requests/presentation"
import { diffLines, diffStats } from "@/lib/requests/diff"
import type {
  ComponentRequest,
  RequestType,
  RequestValidationResult,
} from "@/lib/contracts"

const TYPE_LABELS: Record<RequestType, string> = {
  new_component: "New component",
  component_update: "Component update",
  new_theme: "New theme",
  theme_update: "Theme update",
}

function StatusBadge({ request }: { request: ComponentRequest }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[request.status]}`}
    >
      {STATUS_LABELS[request.status]}
    </span>
  )
}

function ValidationSummary({ result }: { result: RequestValidationResult }) {
  const errors = result.issues.filter((i) => i.severity === "error")
  const warnings = result.issues.filter((i) => i.severity === "warning")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.valid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
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
              className="text-xs"
            >
              {check.passed ? "✓" : "✗"} {check.name}
            </Badge>
          ))}
        </div>
        {result.issues.length > 0 && (
          <ul className="space-y-1 text-sm">
            {result.issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                {issue.severity === "error" ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
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
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function DiffView({ request }: { request: ComponentRequest }) {
  const current = request.versions.find((v) => v.id === request.currentVersionId)
  const prev = current
    ? previousVersion(request.versions, current.id)
    : undefined

  if (!current || !prev) {
    return (
      <p className="text-sm text-muted-foreground">
        No previous version to compare. This is the first version of the request.
      </p>
    )
  }

  const lines = diffLines(versionSource(prev), versionSource(current))
  const stats = diffStats(lines)

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        Comparing {prev.id} → {current.id} ·{" "}
        <span className="text-green-600">+{stats.added}</span>{" "}
        <span className="text-red-600">-{stats.removed}</span>
      </div>
      <pre className="w-full max-w-full overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={
              line.type === "add"
                ? "bg-green-500/15 text-green-700 dark:text-green-300"
                : line.type === "remove"
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : ""
            }
          >
            <span className="select-none pr-2 text-muted-foreground">
              {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
            </span>
            {line.text || " "}
          </div>
        ))}
      </pre>
    </div>
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
            <h1 className="text-3xl font-bold">{request.title}</h1>
            <StatusBadge request={request} />
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
            <span>· {request.versions.length} version(s)</span>
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

        <Tabs defaultValue="source">
          <TabsList>
            <TabsTrigger value="source">Source</TabsTrigger>
            {files.length > 0 && (
              <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
            )}
            <TabsTrigger value="diff">Diff</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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

          <TabsContent value="diff" className="mt-4">
            <DiffView request={request} />
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-3">
            {[...request.versions].reverse().map((version) => (
              <Card key={version.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>
                      {version.id}
                      {version.id === request.currentVersionId && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          current
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                  </CardTitle>
                  <CardDescription>{version.rationale}</CardDescription>
                </CardHeader>
                {version.authorAgent && (
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    by {version.authorAgent}
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>
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
          <p className="mt-6 text-sm text-muted-foreground">
            Request not found.
          </p>
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
        <div className="mb-12 text-center">
          <div className="mb-4 flex w-full items-center justify-center space-x-2">
            <GitPullRequestArrow className="size-9" />
            <h1 className="text-4xl font-bold">Component Requests</h1>
          </div>
          <p className="mb-8 text-xl text-muted-foreground">
            Agent-proposed components and themes awaiting review
          </p>
        </div>

        {REQUESTS.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-muted-foreground">
              No requests yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Requests submitted by agents through the MCP server will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REQUESTS.map((request) => {
              const current = request.versions.find(
                (v) => v.id === request.currentVersionId
              )
              return (
                <Link key={request.id} href={`/requests?request=${request.id}`}>
                  <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="transition-colors group-hover:text-primary">
                          {request.title}
                        </CardTitle>
                        <StatusBadge request={request} />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {current?.rationale}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-y-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[request.type]}
                        </Badge>
                        {request.targetId && (
                          <Badge variant="secondary" className="text-xs">
                            {request.targetId}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.versions.length} version(s) · updated{" "}
                        {new Date(request.updatedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
