"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderGit2, StickyNote, Puzzle, Search, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { GlowCard, cardLinkClassName } from "@/components/glow-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import type { LibraryEntryView } from "@/lib/contracts";

const ALL = "__all__";

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function matches(entry: LibraryEntryView, q: string): boolean {
  if (!q) return true;
  return [
    entry.name,
    entry.description,
    entry.category,
    entry.source.project,
    entry.source.path,
    ...entry.tags,
    ...entry.props.map((p) => p.name),
  ].some((value) => value.toLowerCase().includes(q));
}

function LibraryCard({ entry }: { entry: LibraryEntryView }) {
  return (
    <Link href={`/library?id=${entry.id}`} className={`${cardLinkClassName} h-full`} data-testid="library-card">
      <GlowCard className="group h-full cursor-pointer">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-mono text-lg transition-colors group-hover:text-primary-accent">
              {entry.name}
            </CardTitle>
            <Badge variant="outline" className="shrink-0 gap-1 text-xs">
              <FolderGit2 className="h-3 w-3" aria-hidden />
              {entry.source.project}
            </Badge>
          </div>
          <div className="truncate font-mono text-xs text-muted-foreground" title={entry.source.path}>
            {entry.source.path}
          </div>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {entry.description || "No description in source yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-1.5 pt-0 text-xs">
          <Badge variant="secondary">{entry.category}</Badge>
          <span className="text-muted-foreground">
            {entry.props.length} prop{entry.props.length === 1 ? "" : "s"}
          </span>
          {entry.notes.length > 0 && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <StickyNote className="h-3 w-3" aria-hidden />
              {entry.notes.length}
            </span>
          )}
          {entry.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </GlowCard>
    </Link>
  );
}

/**
 * Library browser: free-text search plus project and category filters over
 * the ingested components. Pure derivation from the static manifest, so it is
 * safe to prerender.
 */
export function LibraryBrowser({ components }: { components: LibraryEntryView[] }) {
  const [query, setQuery] = useState("");
  const [project, setProject] = useState(ALL);
  const [category, setCategory] = useState(ALL);

  const projects = useMemo(() => uniqueSorted(components.map((c) => c.source.project)), [components]);
  const categories = useMemo(() => uniqueSorted(components.map((c) => c.category)), [components]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return components.filter(
      (entry) =>
        (project === ALL || entry.source.project === project) &&
        (category === ALL || entry.category === category) &&
        matches(entry, q)
    );
  }, [components, query, project, category]);

  if (components.length === 0) {
    return (
      <EmptyState
        icon={Puzzle}
        title="The library is empty"
        description="Run `pnpm library:import <path-to-a-project>` to ingest components from your other projects."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          type="text"
          icon={<Search className="h-4 w-4" />}
          placeholder="Search name, prop, tag, path..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="lg:max-w-xs"
          aria-label="Search library"
        />
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="w-full lg:w-[180px]" aria-label="Filter by project">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full lg:w-[180px]" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="whitespace-nowrap text-sm text-muted-foreground lg:ml-auto" aria-live="polite">
          {filtered.length} of {components.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching components"
          description="Try a different search term or clear the filters."
        />
      ) : (
        <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <StaggerItem key={entry.id} className="h-full">
              <LibraryCard entry={entry} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
