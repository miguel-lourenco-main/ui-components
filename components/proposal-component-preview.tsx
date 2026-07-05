"use client";

import React, { useMemo } from "react";
import type { ComponentMetaContract } from "@/lib/contracts";
import { compileProposedComponent } from "@/lib/requests/compile-proposed-component";
import {
  buildFeaturePreviewProps,
  buildPreviewProps,
} from "@/lib/requests/preview-props";

interface ProposalComponentPreviewProps {
  source: string;
  meta: ComponentMetaContract;
  size?: "small" | "medium";
  /** When true, enables feature booleans (e.g. loading) for list-card previews. */
  highlightFeatures?: boolean;
  /** Controlled props override (detail interactive preview). */
  propsOverride?: Record<string, unknown>;
}

class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function CategoryFallback({ meta }: { meta: ComponentMetaContract }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2 text-center">
      <div className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium">
        {meta.name}
      </div>
      <span className="text-[10px] text-muted-foreground">{meta.category}</span>
    </div>
  );
}

function getScaleClass(size: "small" | "medium"): string {
  return size === "small" ? "scale-75" : "scale-100";
}

/**
 * Compiles and renders proposed component source for request previews.
 */
export function ProposalComponentPreview({
  source,
  meta,
  size = "small",
  highlightFeatures = false,
  propsOverride,
}: ProposalComponentPreviewProps) {
  const Component = useMemo(() => {
    if (typeof window === "undefined") return null;
    return compileProposedComponent(source, meta.name);
  }, [source, meta.name]);

  const fallback = <CategoryFallback meta={meta} />;

  if (typeof window === "undefined" || Component === null) {
    return Component === null && typeof window !== "undefined"
      ? fallback
      : (
          <div className="text-xs text-muted-foreground">Loading preview...</div>
        );
  }

  const previewProps =
    propsOverride ??
    (highlightFeatures ? buildFeaturePreviewProps(meta) : buildPreviewProps(meta));

  return (
    <PreviewErrorBoundary fallback={fallback}>
      <div
        className={`flex size-full items-center justify-center ${getScaleClass(size)} origin-center ${propsOverride ? "" : "pointer-events-none"}`}
      >
        <Component {...previewProps} />
      </div>
    </PreviewErrorBoundary>
  );
}
