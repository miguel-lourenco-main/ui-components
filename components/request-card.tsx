"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, User, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlowCard, cardLinkClassName } from "@/components/glow-card";
import { RequestPreview } from "@/components/request-preview";
import { RequestStatusBadge } from "@/components/request-status-badge";
import { RelativeTime } from "@/components/relative-time";
import type { ComponentRequest, RequestType } from "@/lib/contracts";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<RequestType, string> = {
  new_component: "New component",
  component_update: "Component update",
  new_theme: "New theme",
  theme_update: "Theme update",
};

interface RequestCardProps {
  request: ComponentRequest;
}

/**
 * Standardized request list card: title, preview, description, tags, metadata.
 */
export function RequestCard({ request }: RequestCardProps) {
  const current = request.versions.find(
    (version) => version.id === request.currentVersionId
  );

  return (
    <Link href={`/requests?request=${request.id}`} className={`${cardLinkClassName} h-full`}>
      <GlowCard className="group h-full cursor-pointer">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="transition-colors group-hover:text-primary-accent">
              {request.title}
            </CardTitle>
            <RequestStatusBadge status={request.status} />
          </div>
          {current && (
            <RequestPreview
              payload={current.payload}
              highlightFeatures
              className="h-28 w-full overflow-hidden rounded-md border bg-muted/30"
            />
          )}
          <CardDescription className="line-clamp-2">
            {current?.rationale}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {TYPE_LABELS[request.type]}
            </Badge>
            {request.targetId && (
              <Badge variant="secondary" className="text-xs">
                {request.targetId}
              </Badge>
            )}
            {current?.validation && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  current.validation.valid
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                )}
              >
                {current.validation.valid ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                ) : (
                  <XCircle className="h-3 w-3" aria-hidden />
                )}
                {current.validation.valid ? "Valid" : "Invalid"}
              </span>
            )}
            {request.versions.length > 1 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <History className="h-3 w-3" aria-hidden />v
                {request.versions.length}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {current?.authorAgent && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden />
                {current.authorAgent}
              </span>
            )}
            <span>
              updated <RelativeTime iso={request.updatedAt} />
            </span>
          </div>
        </CardContent>
      </GlowCard>
    </Link>
  );
}
