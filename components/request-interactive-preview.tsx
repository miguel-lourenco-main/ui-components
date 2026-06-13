"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ComponentMetaContract } from "@/lib/contracts";
import { ProposalComponentPreview } from "@/components/proposal-component-preview";
import { ProposalThemePreview } from "@/components/proposal-theme-preview";
import { RequestPropsPanel } from "@/components/request-props-panel";
import { primarySource } from "@/lib/requests/presentation";
import {
  buildFeaturePreviewProps,
  buildPreviewProps,
} from "@/lib/requests/preview-props";
import type { RequestPayload } from "@/lib/contracts";

interface RequestInteractivePreviewProps {
  payload: RequestPayload;
}

function isBooleanProp(prop: { type: string | string[] }): boolean {
  const t = prop.type;
  return t === "boolean" || (Array.isArray(t) && t.includes("boolean"));
}

function featureBooleanProps(meta: ComponentMetaContract) {
  return meta.props.filter((prop) => {
    if (!isBooleanProp(prop)) return false;
    return prop.defaultValue === false || prop.defaultValue === undefined;
  });
}

/**
 * Detail-page preview with live prop controls and side-by-side feature comparisons.
 */
function ThemeInteractivePreview({ payload }: { payload: Extract<RequestPayload, { kind: "theme" }> }) {
  return (
    <div className="space-y-3">
      <div className="min-h-48 overflow-hidden rounded-lg border bg-muted/30">
        <ProposalThemePreview theme={payload.theme} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
            Light mode
          </div>
          <ProposalThemePreview theme={payload.theme} mode="light" />
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
            Dark mode
          </div>
          <ProposalThemePreview theme={payload.theme} mode="dark" />
        </div>
      </div>
    </div>
  );
}

function ComponentInteractivePreview({
  payload,
}: {
  payload: Extract<RequestPayload, { kind: "component" }>;
}) {
  const { meta } = payload;
  const source = primarySource(payload);
  const initialProps = useMemo(() => buildPreviewProps(meta), [meta]);
  const [props, setProps] = useState(initialProps);
  const features = featureBooleanProps(meta);

  useEffect(() => {
    setProps(initialProps);
  }, [initialProps]);

  return (
    <div className="space-y-4">
      <div className="flex min-h-48 items-center justify-center rounded-lg border bg-muted/30 p-8">
        <ProposalComponentPreview
          source={source}
          meta={meta}
          size="medium"
          propsOverride={props}
        />
      </div>

      <RequestPropsPanel
        props={meta.props}
        values={props}
        onChange={setProps}
      />

      {features.length > 0 && (
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">See the proposed change</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-md border p-4">
              <Badge variant="secondary" className="text-xs">
                Current defaults
              </Badge>
              <div className="flex min-h-24 items-center justify-center">
                <ProposalComponentPreview
                  source={source}
                  meta={meta}
                  size="medium"
                  propsOverride={buildPreviewProps(meta)}
                />
              </div>
            </div>
            <div className="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-4">
              <Badge className="text-xs">With new feature</Badge>
              <div className="flex min-h-24 items-center justify-center">
                <ProposalComponentPreview
                  source={source}
                  meta={meta}
                  size="medium"
                  propsOverride={buildFeaturePreviewProps(meta)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((prop) => (
              <Button
                key={prop.name}
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setProps((current) => ({
                    ...current,
                    [prop.name]: !current[prop.name],
                  }))
                }
              >
                Toggle {prop.name}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setProps(buildPreviewProps(meta))}
            >
              Reset props
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RequestInteractivePreview({
  payload,
}: RequestInteractivePreviewProps) {
  if (payload.kind === "theme") {
    return <ThemeInteractivePreview payload={payload} />;
  }
  return <ComponentInteractivePreview payload={payload} />;
}
