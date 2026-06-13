"use client";

import { Button } from "@/components/ui/button";
import type { ThemeContract } from "@/lib/contracts";
import { cn } from "@/lib/utils";

interface ProposalThemePreviewProps {
  theme: ThemeContract;
  mode?: "light" | "dark";
}

/**
 * Miniature preview for a proposed theme using palette swatches and a
 * primary button styled with the theme's component class maps.
 */
export function ProposalThemePreview({
  theme,
  mode = "light",
}: ProposalThemePreviewProps) {
  const colors = theme.colors[mode];
  const buttonPrimary = theme.components[mode].button.primary;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 p-3"
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        borderRadius: theme.styles.borderRadius,
      }}
    >
      <div className="flex items-center gap-1.5">
        {(["primary", "secondary", "accent"] as const).map((token) => (
          <div
            key={token}
            className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: colors[token] }}
            title={token}
          />
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        className={cn("pointer-events-none text-xs", buttonPrimary)}
      >
        Primary
      </Button>
    </div>
  );
}
