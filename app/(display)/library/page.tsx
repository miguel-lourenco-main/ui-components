"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ExternalLink, FolderGit2, StickyNote, Package, Puzzle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CodeBlock } from "@/components/code-block"
import { EmptyState } from "@/components/empty-state"
import { FadeIn } from "@/components/motion/fade-in"
import { PageTransition } from "@/components/page-transition"
import { ProposalComponentPreview } from "@/components/proposal-component-preview"
import { LibraryBrowser } from "@/components/library-browser"
import { RelativeTime } from "@/components/relative-time"
import { LIBRARY, getLibraryComponent, sourceUrl, toPreviewMeta } from "@/lib/library/manifest-data"
import type { LibraryComponent, LibraryProp } from "@/lib/contracts"

function formatDefault(prop: LibraryProp): string {
  if (prop.defaultExpression) return prop.defaultExpression
  if (prop.defaultValue === undefined) return "—"
  return JSON.stringify(prop.defaultValue)
}

function PropsTable({ entry }: { entry: LibraryComponent }) {
  if (entry.props.length === 0) {
    return <p className="text-sm text-muted-foreground">No props found in the source.</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prop</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entry.props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell className="whitespace-nowrap font-mono text-xs">
                {prop.name}
                {prop.required && <span className="text-danger" aria-label="required"> *</span>}
              </TableCell>
              <TableCell className="max-w-[16rem] font-mono text-xs text-muted-foreground">
                <span className="line-clamp-3 break-words" title={prop.tsType}>{prop.tsType}</span>
              </TableCell>
              <TableCell className="font-mono text-xs">{formatDefault(prop)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{prop.description ?? ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function LibraryDetail({ entry }: { entry: LibraryComponent }) {
  const meta = useMemo(() => toPreviewMeta(entry), [entry])
  // The preview compiles source in the browser; render it only after mount so
  // server and client markup agree.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const url = sourceUrl(entry)
  const siblings = LIBRARY.filter(
    (c) => c.id !== entry.id && c.source.project === entry.source.project && c.source.path === entry.source.path
  )

  return (
    <PageTransition>
      <div className="space-y-6">
        <Link
          href="/library"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Library
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-display font-mono text-3xl font-bold">{entry.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <FolderGit2 className="h-3 w-3" aria-hidden />
              {entry.source.project}
            </Badge>
            <Badge variant="secondary">{entry.category}</Badge>
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal">
                {tag}
              </Badge>
            ))}
            <span>
              · synced <RelativeTime iso={entry.updatedAt} />
            </span>
          </div>
          {entry.description && (
            <p className="max-w-3xl whitespace-pre-line text-muted-foreground">{entry.description}</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Source</CardTitle>
                <CardDescription className="break-all font-mono text-xs">
                  {entry.source.path}
                  {entry.source.commit && <> @ {entry.source.commit.slice(0, 8)}</>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline hover:text-foreground"
                  >
                    Open in repository <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
                <div className="text-muted-foreground">
                  {entry.source.exportKind === "default" ? "Default export" : "Named export"}
                  {siblings.length > 0 && (
                    <>
                      {" "}· same file as{" "}
                      {siblings.map((s, i) => (
                        <span key={s.id}>
                          {i > 0 && ", "}
                          <Link href={`/library?id=${s.id}`} className="font-mono underline hover:text-foreground">
                            {s.name}
                          </Link>
                        </span>
                      ))}
                    </>
                  )}
                </div>
                {entry.dependencies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" aria-label="Packages" />
                    {entry.dependencies.map((dep) => (
                      <Badge key={dep} variant="outline" className="font-mono text-xs font-normal">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                )}
                {entry.localImports.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Needs from its project:{" "}
                    <span className="font-mono">{entry.localImports.join(", ")}</span>
                  </div>
                )}
                {entry.propsExtends.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Props also extend:{" "}
                    <span className="font-mono">{entry.propsExtends.join(", ")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription>
                  Best effort: imports are stripped, so components that rely on
                  project-local modules fall back to a placeholder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-6">
                  {mounted ? (
                    <ProposalComponentPreview source={entry.code} meta={meta} size="medium" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Loading preview…</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0">
            <Tabs defaultValue="props">
              <TabsList>
                <TabsTrigger value="props">Props ({entry.props.length})</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="notes">Notes ({entry.notes.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="props" className="mt-4">
                <PropsTable entry={entry} />
              </TabsContent>
              <TabsContent value="code" className="mt-4">
                <CodeBlock code={entry.code} language="tsx" className="max-h-[36rem]" />
              </TabsContent>
              <TabsContent value="notes" className="mt-4 space-y-3">
                {entry.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No vault notes link this component. Add{" "}
                    <code className="font-mono">component: {entry.name}</code> to a note&apos;s
                    frontmatter and re-import with <code className="font-mono">--vault</code>.
                  </p>
                ) : (
                  entry.notes.map((note) => (
                    <Card key={note.path}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <StickyNote className="h-4 w-4" aria-hidden />
                          {note.title}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs">{note.path}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">{note.excerpt}</CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

function LibraryPageInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const selected = id ? getLibraryComponent(id) : undefined

  if (id) {
    return (
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {selected ? (
            <LibraryDetail entry={selected} />
          ) : (
            <>
              <Link
                href="/library"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Library
              </Link>
              <EmptyState
                icon={Puzzle}
                title="Component not found"
                description="It may have been removed from the library, or the link is out of date."
                action={{ label: "Browse the library", href: "/library" }}
                className="mt-6"
              />
            </>
          )}
        </div>
      </div>
    )
  }

  const projectCount = new Set(LIBRARY.map((c) => c.source.project)).size
  const stats = [
    { value: LIBRARY.length, label: "Components" },
    { value: projectCount, label: projectCount === 1 ? "Project" : "Projects" },
    { value: LIBRARY.filter((c) => c.notes.length > 0).length, label: "With notes" },
  ]

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-10">
          <div className="ed-mono flex flex-wrap items-center justify-between gap-2 pb-4 text-muted-foreground">
            <span>Library</span>
            <span className="text-type-accent">Ingested from source</span>
            <span className="hidden sm:inline">Across projects</span>
          </div>
          <div className="ed-rule" />
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-display text-4xl font-bold md:text-5xl">Component Library</h1>
              <p className="mt-3 max-w-xl text-lg text-muted-foreground">
                Every component you have built, imported from the projects it lives in and
                linked to your notes.
              </p>
            </div>
            {LIBRARY.length > 0 && (
              <div className="flex gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <span className="text-display text-3xl font-bold tabular-nums">{stat.value}</span>
                    <span className="ed-mono ml-2 text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        <LibraryBrowser components={LIBRARY} />
      </div>
    </div>
  )
}

/**
 * Library route: the ingested-component browser, or one entry's detail when
 * `?id=<id>` is present. Wrapped in Suspense because it reads
 * `useSearchParams` (required by Next for static generation).
 */
export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="container px-4 py-8">
          <div className="mx-auto max-w-6xl text-muted-foreground">Loading library…</div>
        </div>
      }
    >
      <LibraryPageInner />
    </Suspense>
  )
}
