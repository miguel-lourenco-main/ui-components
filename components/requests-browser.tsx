"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequestCard } from "@/components/request-card";
import { EmptyState } from "@/components/empty-state";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import {
  STATUS_BADGE_CLASSES,
  STATUS_ICONS,
  STATUS_LABELS,
} from "@/lib/requests/presentation";
import type {
  ComponentRequest,
  RequestStatus,
  RequestType,
} from "@/lib/contracts";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<RequestType, string> = {
  new_component: "New component",
  component_update: "Component update",
  new_theme: "New theme",
  theme_update: "Theme update",
};

/** Statuses that most need a reviewer's attention come first. */
const ATTENTION_ORDER: RequestStatus[] = [
  "pending_review",
  "needs_changes",
  "validation_failed",
  "draft",
  "approved",
  "published",
  "rejected",
];

type SortKey = "attention" | "newest" | "oldest" | "title";

const SORT_LABELS: Record<SortKey, string> = {
  attention: "Needs attention",
  newest: "Newest",
  oldest: "Oldest",
  title: "Title",
};

function comparator(sort: SortKey) {
  const newest = (a: ComponentRequest, b: ComponentRequest) =>
    Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  switch (sort) {
    case "newest":
      return newest;
    case "oldest":
      return (a: ComponentRequest, b: ComponentRequest) =>
        Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
    case "title":
      return (a: ComponentRequest, b: ComponentRequest) =>
        a.title.localeCompare(b.title);
    case "attention":
    default:
      return (a: ComponentRequest, b: ComponentRequest) => {
        const delta =
          ATTENTION_ORDER.indexOf(a.status) - ATTENTION_ORDER.indexOf(b.status);
        return delta !== 0 ? delta : newest(a, b);
      };
  }
}

/**
 * Review-queue browser: a status summary, text search, a status segmented
 * filter, and a sort control over the request grid. All derivation is done with
 * memoized, deterministic comparisons (no "now"), so it is safe to prerender.
 */
export function RequestsBrowser({
  requests,
}: {
  requests: ComponentRequest[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RequestStatus>("all");
  const [sort, setSort] = useState<SortKey>("attention");

  const statusCounts = useMemo(() => {
    const counts = {} as Record<RequestStatus, number>;
    for (const request of requests) {
      counts[request.status] = (counts[request.status] ?? 0) + 1;
    }
    return counts;
  }, [requests]);

  const presentStatuses = useMemo(
    () => ATTENTION_ORDER.filter((s) => statusCounts[s]),
    [statusCounts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = requests.filter((request) => {
      if (status !== "all" && request.status !== status) return false;
      if (!q) return true;
      return (
        request.title.toLowerCase().includes(q) ||
        (request.targetId?.toLowerCase().includes(q) ?? false) ||
        TYPE_LABELS[request.type].toLowerCase().includes(q)
      );
    });
    return matches.sort(comparator(sort));
  }, [requests, query, status, sort]);

  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {requests.length} total
        </span>
        {presentStatuses.map((s) => {
          const Icon = STATUS_ICONS[s];
          return (
            <span
              key={s}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                STATUS_BADGE_CLASSES[s]
              )}
            >
              <Icon className="h-3 w-3" aria-hidden />
              {statusCounts[s]} {STATUS_LABELS[s]}
            </span>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          type="text"
          icon={<Search className="h-4 w-4" />}
          placeholder="Search by title, target, or type..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="lg:max-w-xs"
          aria-label="Search requests"
        />
        <ToggleGroup
          type="single"
          value={status}
          onValueChange={(value) =>
            setStatus((value || "all") as "all" | RequestStatus)
          }
          variant="outline"
          size="sm"
          className="flex-wrap justify-start"
        >
          <ToggleGroupItem value="all">All ({requests.length})</ToggleGroupItem>
          {presentStatuses.map((s) => (
            <ToggleGroupItem key={s} value={s}>
              {STATUS_LABELS[s]} ({statusCounts[s]})
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="lg:ml-auto">
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger className="w-full lg:w-[180px]" aria-label="Sort requests">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching requests"
          description="Try a different search term or clear the status filter."
        />
      ) : (
        <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((request) => (
            <StaggerItem key={request.id} className="h-full">
              <RequestCard request={request} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
