"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, CircleDashed, User } from "lucide-react";
import { RequestDiffView } from "@/components/request-diff-view";
import { RelativeTime } from "@/components/relative-time";
import {
  payloadFiles,
  previousVersion,
  primarySource,
} from "@/lib/requests/presentation";
import type { ComponentRequest, RequestVersion } from "@/lib/contracts";
import { cn } from "@/lib/utils";

interface FileDiff {
  path: string;
  before: string;
  after: string;
}

/**
 * Per-file diffs between a version and its predecessor. Component payloads diff
 * each proposed file matched by path (so meta.json-only changes surface, not
 * just the primary source); theme payloads diff the pretty-printed JSON. When
 * there is no previous version, everything diffs against empty (the initial
 * proposal reads as all-added).
 */
function fileDiffs(
  current: RequestVersion,
  previous: RequestVersion | undefined
): FileDiff[] {
  if (current.payload.kind === "theme") {
    return [
      {
        path: "theme.json",
        before: previous ? primarySource(previous.payload) : "",
        after: primarySource(current.payload),
      },
    ];
  }

  const afterFiles = payloadFiles(current.payload);
  const beforeFiles =
    previous && previous.payload.kind === "component"
      ? payloadFiles(previous.payload)
      : [];
  const paths = Array.from(
    new Set([
      ...beforeFiles.map((file) => file.path),
      ...afterFiles.map((file) => file.path),
    ])
  ).sort();

  return paths.map((path) => ({
    path,
    before: beforeFiles.find((file) => file.path === path)?.contents ?? "",
    after: afterFiles.find((file) => file.path === path)?.contents ?? "",
  }));
}

function ValidationPill({ version }: { version: RequestVersion }) {
  if (!version.validation) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <CircleDashed className="h-3 w-3" aria-hidden />
        Not validated
      </span>
    );
  }
  const valid = version.validation.valid;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        valid ? "text-success" : "text-danger"
      )}
    >
      {valid ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden />
      ) : (
        <XCircle className="h-3 w-3" aria-hidden />
      )}
      {valid ? "Valid" : "Invalid"}
    </span>
  );
}

/**
 * Version timeline for a request plus the diff of the selected version against
 * its predecessor. Reuses the shared diff utility and presentation helpers.
 */
export function RequestVersionHistory({
  request,
}: {
  request: ComponentRequest;
}) {
  const { versions } = request;
  const [selectedId, setSelectedId] = useState(request.currentVersionId);

  const selected =
    versions.find((version) => version.id === selectedId) ??
    versions[versions.length - 1];
  const previous = useMemo(
    () => previousVersion(versions, selected.id),
    [versions, selected.id]
  );
  const diffs = useMemo(
    () => fileDiffs(selected, previous).filter((d) => d.before !== d.after),
    [selected, previous]
  );

  const versionNumber = (id: string) =>
    versions.findIndex((version) => version.id === id) + 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <ol className="space-y-2">
        {versions
          .map((version, index) => ({ version, index }))
          .reverse()
          .map(({ version, index }) => {
            const isSelected = version.id === selected.id;
            return (
              <li key={version.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(version.id)}
                  aria-current={isSelected ? "true" : undefined}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    isSelected
                      ? "border-primary/50 bg-accent"
                      : "border-border hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium">
                      v{index + 1}
                      {version.id === request.currentVersionId && (
                        <span className="ml-1 text-muted-foreground">
                          (current)
                        </span>
                      )}
                    </span>
                    <ValidationPill version={version} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground">
                    {version.rationale}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    {version.authorAgent && (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" aria-hidden />
                        {version.authorAgent}
                      </span>
                    )}
                    <RelativeTime iso={version.createdAt} />
                  </div>
                </button>
              </li>
            );
          })}
      </ol>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="font-medium">
            {previous
              ? `Changes from v${versionNumber(previous.id)} → v${versionNumber(selected.id)}`
              : `Initial version (v${versionNumber(selected.id)})`}
          </span>
          <span className="text-muted-foreground">{selected.rationale}</span>
        </div>

        {diffs.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            No file changes between these versions.
          </p>
        ) : (
          diffs.map((diff) => (
            <div key={diff.path} className="space-y-1">
              <div className="font-mono text-xs text-muted-foreground">
                {diff.path}
              </div>
              <RequestDiffView before={diff.before} after={diff.after} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
