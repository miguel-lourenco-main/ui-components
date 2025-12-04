"use client"

import { useMemo, useState } from "react"
import { Sun, Moon } from "lucide-react"

import { ThemedComponentPreview } from "@/components/themed-component-preview"
import { getTheme } from "@/lib/themes"
import { ComponentType } from "@/lib/componentTypes"
import { computeThemeCssVars } from "@/lib/theme-css-vars"

interface ThemedPreviewSurfaceProps {
  themeId: string
  component: ComponentType
  size?: "small" | "medium" | "large"
  mode?: "light" | "dark"
  showModeToggle?: boolean
  className?: string
  heightClassName?: string
  surfaceClassName?: string
}

/**
 * Renders a theme-colored surface plus optional light/dark toggle around the miniature component preview.
 */
export function ThemedPreviewSurface({
  themeId,
  component,
  size = "large",
  mode,
  showModeToggle = true,
  className = "",
  heightClassName,
  surfaceClassName,
}: ThemedPreviewSurfaceProps) {
  const [localMode, setLocalMode] = useState<"light" | "dark">(mode || "light")
  const effectiveMode = mode ?? localMode

  const theme = useMemo(() => getTheme(themeId), [themeId])
  if (!theme) return null

  const colors = theme.colors[effectiveMode]
  const cssVars = computeThemeCssVars(theme, effectiveMode)

  const computedHeight = heightClassName || (size === "small" ? "h-24" : size === "medium" ? "h-28" : "h-32")

  return (
    <div className={className}>
      {showModeToggle && (
        <div className="flex items-center justify-end mb-2 gap-1 text-xs text-muted-foreground">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setLocalMode("light")
            }}
            className={`px-2 py-0.5 rounded border ${effectiveMode === "light" ? "bg-muted" : "hover:bg-muted/50"}`}
            aria-label="Light mode"
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setLocalMode("dark")
            }}
            className={`px-2 py-0.5 rounded border ${effectiveMode === "dark" ? "bg-muted" : "hover:bg-muted/50"}`}
            aria-label="Dark mode"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div
        className={`${computedHeight} border rounded-md flex items-center justify-center mb-1 ${surfaceClassName || ""} pointer-events-none select-none`}
        aria-disabled={true}
        aria-hidden={true}
        tabIndex={-1}
        style={{
          ...cssVars,
          backgroundColor: colors.background,
          color: colors.foreground,
          borderColor: colors.border,
        }}
      >
        <ThemedComponentPreview themeId={theme.id} component={component} size={size} mode={effectiveMode} seamless={true} />
      </div>
    </div>
  )
}

export default ThemedPreviewSurface


