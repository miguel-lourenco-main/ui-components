"use client";

import { useEffect, useState } from "react";
import {
  formatAbsoluteDate,
  formatRelativeTime,
} from "@/lib/format/relative-time";

/**
 * Renders a timestamp as relative time ("3 days ago") without breaking
 * hydration. The first (server + initial client) render shows a deterministic
 * absolute date; the relative label is computed only after mount, where the
 * real "now" is available.
 */
export function RelativeTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const absolute = formatAbsoluteDate(iso);
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    setLabel(formatRelativeTime(iso));
  }, [iso]);

  return (
    <time dateTime={iso} title={absolute} className={className}>
      {label}
    </time>
  );
}
