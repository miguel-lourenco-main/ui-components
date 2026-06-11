/**
 * Optional GitLab merge-request creation for published requests.
 *
 * Mirrors the repository's existing infra pattern (GitLab Repository Commits API
 * + Merge Requests API). Disabled unless the required env vars are present, so it
 * is safe to call unconditionally. Treats all responses defensively.
 *
 * Required env:
 * - GITLAB_TOKEN       (api scope)
 * - GITLAB_PROJECT_ID  (numeric or url-encoded path)
 * Optional env:
 * - GITLAB_API_URL     (default https://gitlab.com/api/v4)
 * - GITLAB_TARGET_BRANCH (default main)
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "@/lib/registry/paths";

export interface MergeRequestInput {
  /** Repo-relative paths to include in the commit. */
  files: string[];
  branch: string;
  title: string;
  description?: string;
}

export interface MergeRequestResult {
  created: boolean;
  reason?: string;
  mrUrl?: string;
  branch?: string;
}

interface GitLabEnv {
  token: string;
  projectId: string;
  apiUrl: string;
  targetBranch: string;
}

function readEnv(): GitLabEnv | undefined {
  const token = process.env.GITLAB_TOKEN;
  const projectId = process.env.GITLAB_PROJECT_ID;
  if (!token || !projectId) return undefined;
  return {
    token,
    projectId: encodeURIComponent(projectId),
    apiUrl: process.env.GITLAB_API_URL ?? "https://gitlab.com/api/v4",
    targetBranch: process.env.GITLAB_TARGET_BRANCH ?? "main",
  };
}

/**
 * Create a branch + commit with the given files and open a merge request.
 * Returns `{ created: false, reason }` when GitLab is not configured.
 */
export async function createMergeRequestForPublish(
  input: MergeRequestInput,
  repoRoot: string = REPO_ROOT
): Promise<MergeRequestResult> {
  const env = readEnv();
  if (!env) {
    return {
      created: false,
      reason: "GitLab not configured (set GITLAB_TOKEN and GITLAB_PROJECT_ID).",
    };
  }

  // GitLab's commits API uses "create" for new files and "update" for existing
  // ones. We default to "create"; callers publishing updates to existing files
  // should review the resulting MR.
  const actions = input.files.map((rel) => ({
    action: "create" as const,
    file_path: rel,
    content: fs.readFileSync(path.resolve(repoRoot, rel), "utf8"),
  }));

  const headers = {
    "PRIVATE-TOKEN": env.token,
    "Content-Type": "application/json",
  };

  // 1. Create a commit on a new branch (update action if file already exists).
  const commitRes = await fetch(
    `${env.apiUrl}/projects/${env.projectId}/repository/commits`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        branch: input.branch,
        start_branch: env.targetBranch,
        commit_message: input.title,
        actions,
      }),
    }
  );
  if (!commitRes.ok) {
    return {
      created: false,
      reason: `Commit failed (${commitRes.status}): ${await safeText(commitRes)}`,
    };
  }

  // 2. Open the merge request.
  const mrRes = await fetch(
    `${env.apiUrl}/projects/${env.projectId}/merge_requests`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_branch: input.branch,
        target_branch: env.targetBranch,
        title: input.title,
        description: input.description ?? "",
        remove_source_branch: true,
      }),
    }
  );
  if (!mrRes.ok) {
    return {
      created: false,
      reason: `MR creation failed (${mrRes.status}): ${await safeText(mrRes)}`,
      branch: input.branch,
    };
  }

  const mr = (await mrRes.json()) as { web_url?: string };
  return { created: true, mrUrl: mr.web_url, branch: input.branch };
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "<no body>";
  }
}
