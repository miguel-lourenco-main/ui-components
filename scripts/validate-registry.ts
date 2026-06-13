/**
 * CLI: validate the published component registry and all themes against the
 * shared contracts/schemas. Exits non-zero when any error-severity issue is
 * found (warnings are reported but do not fail). Wired into CI alongside lint,
 * typecheck, and build.
 *
 * Usage: pnpm validate:registry
 */
import type { ValidationIssue } from "@/lib/contracts";
import { validateRegistry } from "@/lib/validation/components";
import { validateTheme } from "@/lib/validation/themes";
import { listThemes } from "@/lib/registry/themes";

function printIssues(scope: string, issues: ValidationIssue[]): number {
  let errors = 0;
  for (const issue of issues) {
    if (issue.severity === "error") errors += 1;
    const marker = issue.severity === "error" ? "ERROR" : "warn ";
    const where = issue.path ? ` [${issue.path}]` : "";
    console.log(`  ${marker} ${scope}: ${issue.message}${where}`);
  }
  return errors;
}

function main(): void {
  let errorCount = 0;
  let warningCount = 0;

  console.log("Validating component registry...");
  const registryIssues = validateRegistry();
  errorCount += printIssues("registry", registryIssues);
  warningCount += registryIssues.filter((i) => i.severity === "warning").length;

  console.log("Validating themes...");
  for (const theme of listThemes()) {
    // Published themes already exist, so validate them as existing entries.
    const issues = validateTheme(theme, { isNew: false });
    errorCount += printIssues(`theme:${theme.id}`, issues);
    warningCount += issues.filter((i) => i.severity === "warning").length;
  }

  console.log(
    `\nDone. ${errorCount} error(s), ${warningCount} warning(s).`
  );
  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

main();
