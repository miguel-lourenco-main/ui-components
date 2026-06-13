"use client";

import Link from "next/link";
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
import type { ComponentRequest, RequestType } from "@/lib/contracts";

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
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {TYPE_LABELS[request.type]}
            </Badge>
            {request.targetId && (
              <Badge variant="secondary" className="text-xs">
                {request.targetId}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            updated {new Date(request.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>
      </GlowCard>
    </Link>
  );
}
