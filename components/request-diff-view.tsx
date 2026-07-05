"use client";

import { useMemo } from "react";
import { diffLines, diffStats, type DiffLine } from "@/lib/requests/diff";
import { cn } from "@/lib/utils";

function DiffRow({ line }: { line: DiffLine }) {
  const marker = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
  const rowClass =
    line.type === "add"
      ? "bg-success/10"
      : line.type === "remove"
        ? "bg-danger/10"
        : "";
  const markerClass =
    line.type === "add"
      ? "text-success"
      : line.type === "remove"
        ? "text-danger"
        : "text-muted-foreground/40";

  return (
    <span className={cn("grid grid-cols-[1.5rem_1fr] whitespace-pre", rowClass)}>
      <span className={cn("select-none px-1 text-right", markerClass)}>
        {marker}
      </span>
      <span className="px-2">{line.text.length ? line.text : " "}</span>
    </span>
  );
}

/**
 * Renders a line-based diff between two source strings using the shared
 * `diffLines`/`diffStats` utility, with a +added / −removed summary header.
 */
export function RequestDiffView({
  before,
  after,
  className,
}: {
  before: string;
  after: string;
  className?: string;
}) {
  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const stats = useMemo(() => diffStats(lines), [lines]);
  const unchanged = stats.added === 0 && stats.removed === 0;

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <div className="flex items-center gap-3 border-b bg-muted/40 px-3 py-1.5 font-mono text-xs">
        <span className="text-success">+{stats.added}</span>
        <span className="text-danger">−{stats.removed}</span>
        {unchanged && (
          <span className="text-muted-foreground">No changes</span>
        )}
      </div>
      <pre className="max-h-96 overflow-auto py-1 text-xs leading-relaxed">
        <code className="block">
          {lines.map((line, index) => (
            <DiffRow key={index} line={line} />
          ))}
        </code>
      </pre>
    </div>
  );
}
