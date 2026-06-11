/**
 * Minimal line-based diff (LCS) used by the review UI to show what changed
 * between two request versions. Pure and dependency-free so it can run in the
 * browser bundle and in tests.
 */
export type DiffLineType = "context" | "add" | "remove";

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

/**
 * Compute a line diff between `before` and `after` using a longest-common-
 * subsequence table. Returns an ordered list of context/add/remove lines.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = length of LCS of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: "context", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ type: "remove", text: a[i] });
      i++;
    } else {
      result.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) result.push({ type: "remove", text: a[i++] });
  while (j < m) result.push({ type: "add", text: b[j++] });
  return result;
}

/** Summarize a diff as added/removed line counts. */
export function diffStats(lines: DiffLine[]): { added: number; removed: number } {
  return lines.reduce(
    (acc, line) => {
      if (line.type === "add") acc.added += 1;
      if (line.type === "remove") acc.removed += 1;
      return acc;
    },
    { added: 0, removed: 0 }
  );
}
