/**
 * Seed example requests into `data/requests/` so the review UI and tests have
 * realistic content. Runs the real store + validation pipeline end-to-end.
 *
 * Usage: pnpm tsx scripts/seed-requests.ts
 *
 * This regenerates seed data deterministically: it removes existing `req-*.json`
 * files first, then recreates a small fixed set.
 */
import fs from "node:fs";
import { FileRequestStore } from "@/lib/requests";
import { validatePayload } from "@/lib/validation";
import { getTheme } from "@/lib/registry/themes";
import { REQUESTS_DIR } from "@/lib/registry/paths";
import { buildValidationResult } from "@/lib/contracts";
import type { CreateRequestInput } from "@/lib/requests";
import type {
  ComponentRequestPayload,
  ReviewDecision,
  ThemeRequestPayload,
} from "@/lib/contracts";

const BADGE_SOURCE = `import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const styles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium \${styles[variant]}\`}
      data-testid="rendered-component-badge"
    >
      {children}
    </span>
  );
}
`;

function badgePayload(): ComponentRequestPayload {
  return {
    kind: "component",
    meta: {
      id: "badge",
      name: "Badge",
      category: "data-display",
      description: "Compact status descriptor with semantic color variants.",
      props: [
        {
          name: "children",
          type: ["component", "function"],
          required: true,
          description: "Badge content.",
        },
        {
          name: "variant",
          type: "enum",
          required: false,
          defaultValue: "default",
          options: ["default", "success", "warning", "danger"],
          description: "Semantic color variant.",
        },
      ],
      tags: ["status", "data-display"],
      version: "1.0.0",
      author: "Agent",
      code: BADGE_SOURCE,
    },
    files: [
      {
        path: "components/display-components/data/Badge/Badge.tsx",
        contents: BADGE_SOURCE,
      },
      {
        path: "components/display-components/data/Badge/Badge.meta.json",
        contents: "{}",
      },
    ],
  };
}

function oceanThemePayload(): ThemeRequestPayload {
  const base = structuredClone(getTheme("modern")!);
  base.id = "ocean";
  base.name = "Ocean";
  base.description = "Cool blues and teals inspired by the sea.";
  return { kind: "theme", theme: base };
}

function buttonUpdatePayload(): ComponentRequestPayload {
  const source = `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode | (() => React.ReactNode);
  loading?: boolean;
  className?: string;
}

export default function Button({ variant = 'primary', children, loading = false }: ButtonProps) {
  return (
    <button disabled={loading} data-testid="rendered-component-button">
      {loading ? 'Loading...' : (typeof children === 'function' ? children() : children)}
    </button>
  );
}
`;
  return {
    kind: "component",
    meta: {
      id: "button",
      name: "Button",
      category: "form",
      description: "Button with an added loading state.",
      props: [
        { name: "loading", type: "boolean", required: false, defaultValue: false, description: "Shows a loading label and disables the button." },
      ],
      tags: ["interactive", "form", "action"],
      version: "1.1.0",
      author: "Agent",
      code: source,
    },
    files: [
      {
        path: "components/display-components/buttons/Button/Button.tsx",
        contents: source,
      },
    ],
  };
}

async function createValidated(
  store: FileRequestStore,
  input: CreateRequestInput
) {
  const request = await store.createRequest(input);
  const { issues, checks } = validatePayload(
    input.type,
    input.payload,
    input.targetId
  );
  const result = buildValidationResult(checks, issues, new Date().toISOString());
  return store.setValidationResult(request.id, request.currentVersionId, result);
}

function clearSeed(): void {
  if (!fs.existsSync(REQUESTS_DIR)) return;
  for (const file of fs.readdirSync(REQUESTS_DIR)) {
    if (file.endsWith(".json")) {
      fs.rmSync(`${REQUESTS_DIR}/${file}`, { force: true });
    }
  }
}

async function main(): Promise<void> {
  clearSeed();
  const store = new FileRequestStore();

  // 1. New component with version history -> pending_review.
  const badge = await store.createRequest({
    type: "new_component",
    title: "Add Badge component",
    rationale: "Initial proposal for a status badge.",
    payload: badgePayload(),
    authorAgent: "cursor-agent",
    idempotencyKey: "seed:badge",
  });
  await store.updateRequest(badge.id, {
    rationale: "Added semantic variants (success, warning, danger).",
    payload: badgePayload(),
    authorAgent: "cursor-agent",
  });
  {
    const { issues, checks } = validatePayload("new_component", badgePayload());
    const result = buildValidationResult(checks, issues, new Date().toISOString());
    const refreshed = await store.getRequest(badge.id);
    await store.setValidationResult(badge.id, refreshed!.currentVersionId, result);
  }

  // 2. New theme -> pending_review.
  await createValidated(store, {
    type: "new_theme",
    title: "Add Ocean theme",
    rationale: "A calming blue/teal palette derived from Modern.",
    payload: oceanThemePayload(),
    authorAgent: "cursor-agent",
    idempotencyKey: "seed:ocean",
  });

  // 3. Component update -> needs_changes (reviewer feedback).
  const buttonReq = await createValidated(store, {
    type: "component_update",
    title: "Add loading state to Button",
    targetId: "button",
    rationale: "Support an async loading state on Button.",
    payload: buttonUpdatePayload(),
    authorAgent: "cursor-agent",
    idempotencyKey: "seed:button-loading",
  });
  const decision: ReviewDecision = {
    decision: "needs_changes",
    reviewer: "maintainer",
    notes: "Keep the existing size/variant props; don't drop them in the update.",
    decidedAt: new Date().toISOString(),
  };
  await store.setReviewDecision(buttonReq.id, decision);

  const all = await store.listRequests();
  console.log(
    `Seeded ${all.length} requests:`,
    all.map((r) => `${r.id} [${r.status}]`)
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
