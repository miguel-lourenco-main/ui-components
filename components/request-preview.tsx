"use client";

import { ProposalComponentPreview } from "@/components/proposal-component-preview";
import { ProposalThemePreview } from "@/components/proposal-theme-preview";
import { primarySource } from "@/lib/requests/presentation";
import type { RequestPayload } from "@/lib/contracts";

interface RequestPreviewProps {
  payload: RequestPayload;
  size?: "small" | "medium";
  className?: string;
  /** Surface proposed feature booleans in list-card previews. */
  highlightFeatures?: boolean;
}

/**
 * Renders a catalog-style preview from the proposed request payload.
 * Always uses proposed source for components (not the published catalog).
 */
export function RequestPreview({
  payload,
  size = "small",
  className = "h-28 border rounded-md flex items-center justify-center bg-muted/30 overflow-hidden",
  highlightFeatures = false,
}: RequestPreviewProps) {
  if (payload.kind === "theme") {
    return (
      <div className={className}>
        <ProposalThemePreview theme={payload.theme} />
      </div>
    );
  }

  const { meta } = payload;
  const source = primarySource(payload);

  return (
    <div className={className}>
      <ProposalComponentPreview
        source={source}
        meta={meta}
        size={size}
        highlightFeatures={highlightFeatures}
      />
    </div>
  );
}
