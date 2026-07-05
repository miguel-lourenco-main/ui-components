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
import { MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [mode, setMode] = useState<"light" | "dark">("light");
  return (
    <div className="flex flex-col flex-1 space-y-3">
      <div className="inline-flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={mode === "light"}
            onClick={() => setMode("light")}
            className={cn(
              "h-8 gap-1.5 rounded-md px-3 text-xs transition-colors",
              mode === "light"
                ? "bg-amber-100 text-amber-950 shadow-sm hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/20"
                : "text-muted-foreground hover:bg-amber-50 hover:text-amber-900 dark:hover:bg-amber-500/10 dark:hover:text-amber-200"
            )}
          >
            <SunIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            Light mode
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={mode === "dark"}
            onClick={() => setMode("dark")}
            className={cn(
              "h-8 gap-1.5 rounded-md px-3 text-xs transition-colors",
              mode === "dark"
                ? "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-800 dark:bg-indigo-950 dark:text-indigo-100 dark:hover:bg-indigo-950"
                : "text-muted-foreground hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
            )}
          >
            <MoonIcon className="h-4 w-4 text-slate-500 dark:text-indigo-300" />
            Dark mode
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <ProposalThemePreview theme={payload.theme} mode={mode} />
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
    <div className="flex flex-col flex-1 space-y-4">
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
