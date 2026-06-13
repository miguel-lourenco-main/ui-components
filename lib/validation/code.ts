/**
 * Lightweight TSX/TS syntax validation using @babel/parser.
 *
 * This reuses the same parser the browser prop editor relies on
 * (`lib/utils/codeValidation.ts`) but operates on full module source for
 * proposed component files. It checks parseability only (not type-correctness);
 * deeper checks happen via `pnpm typecheck`/`pnpm lint` in the publish/CI flow.
 */
import { parse as babelParse } from "@babel/parser";
import type { ValidationIssue } from "@/lib/contracts";

/** Parse TSX/TS source and return a syntax error issue if it fails. */
export function validateModuleSyntax(
  source: string,
  filePath?: string
): ValidationIssue[] {
  if (typeof source !== "string" || source.trim() === "") {
    return [
      {
        code: "code.empty",
        severity: "warning",
        message: `Source is empty${filePath ? `: ${filePath}` : ""}.`,
        path: filePath,
      },
    ];
  }

  try {
    babelParse(source, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    return [];
  } catch (error: unknown) {
    const err = error as { message?: string; loc?: { line: number; column: number } };
    return [
      {
        code: "code.syntax_error",
        severity: "error",
        message: (err.message ?? "Syntax error").replace(/\(\d+:\d+\)$/, "").trim(),
        path: filePath,
        location: err.loc
          ? { line: err.loc.line, column: err.loc.column + 1 }
          : undefined,
      },
    ];
  }
}
