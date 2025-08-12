import type { CSSProperties } from "react"
import type { Theme } from "@/lib/themes"

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace(/^#/, "").trim()
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16)
    const g = parseInt(normalized[1] + normalized[1], 16)
    const b = parseInt(normalized[2] + normalized[2], 16)
    return { r, g, b }
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.substring(0, 2), 16)
    const g = parseInt(normalized.substring(2, 4), 16)
    const b = parseInt(normalized.substring(4, 6), 16)
    return { r, g, b }
  }
  return null
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
  const r01 = r / 255
  const g01 = g / 255
  const b01 = b / 255

  const max = Math.max(r01, g01, b01)
  const min = Math.min(r01, g01, b01)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r01:
        h = (g01 - b01) / d + (g01 < b01 ? 6 : 0)
        break
      case g01:
        h = (b01 - r01) / d + 2
        break
      case b01:
        h = (r01 - g01) / d + 4
        break
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hexToHslVarValue(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return "0 0% 0%"
  const { h, s, l } = rgbToHsl(rgb)
  return `${h} ${s}% ${l}%`
}

export function computeThemeCssVars(theme: Theme, mode: "light" | "dark"): CSSProperties {
  const c = theme.colors[mode]
  const vars: CSSProperties = {
    // Core background/text
    ["--background" as any]: hexToHslVarValue(c.background),
    ["--foreground" as any]: hexToHslVarValue(c.foreground),
    // Cards and popovers follow background by default
    ["--card" as any]: hexToHslVarValue(c.background),
    ["--card-foreground" as any]: hexToHslVarValue(c.foreground),
    ["--popover" as any]: hexToHslVarValue(c.background),
    ["--popover-foreground" as any]: hexToHslVarValue(c.foreground),
    // Brand/system
    ["--primary" as any]: hexToHslVarValue(c.primary),
    ["--primary-foreground" as any]: hexToHslVarValue(c.foreground),
    ["--secondary" as any]: hexToHslVarValue(c.secondary),
    ["--secondary-foreground" as any]: hexToHslVarValue(c.foreground),
    ["--accent" as any]: hexToHslVarValue(c.accent),
    ["--accent-foreground" as any]: hexToHslVarValue(c.foreground),
    ["--muted" as any]: hexToHslVarValue(c.muted),
    ["--muted-foreground" as any]: hexToHslVarValue(c.foreground),
    // Inputs/borders
    ["--border" as any]: hexToHslVarValue(c.border),
    ["--input" as any]: hexToHslVarValue(c.border),
    // Rings reuse primary
    ["--ring" as any]: hexToHslVarValue(c.primary),
  }
  return vars
}


