/**
 * Human-friendly time formatting for the review UI.
 *
 * `formatRelativeTime` is a pure function (pass `now` to keep it deterministic
 * in tests). Because it depends on the current time, render it through the
 * `RelativeTime` client component rather than directly in server/prerendered
 * markup, to avoid hydration mismatches — see `components/relative-time.tsx`.
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** Relative label like "just now", "3 hours ago", "in 2 days". */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diff = now - then;
  const abs = Math.abs(diff);
  if (abs < MINUTE) return "just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  // Past times are negative for Intl.RelativeTimeFormat ("2 days ago" = -2).
  const sign = diff < 0 ? 1 : -1;
  const format = (value: number, unit: Intl.RelativeTimeFormatUnit) =>
    rtf.format(sign * value, unit);

  if (abs < HOUR) return format(Math.floor(abs / MINUTE), "minute");
  if (abs < DAY) return format(Math.floor(abs / HOUR), "hour");
  if (abs < WEEK) return format(Math.floor(abs / DAY), "day");
  if (abs < MONTH) return format(Math.floor(abs / WEEK), "week");
  if (abs < YEAR) return format(Math.floor(abs / MONTH), "month");
  return format(Math.floor(abs / YEAR), "year");
}

/**
 * Deterministic `YYYY-MM-DD` (UTC) date, stable across server and client render.
 * Used as the hydration-safe fallback and in `title`/tooltip attributes.
 */
export function formatAbsoluteDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
