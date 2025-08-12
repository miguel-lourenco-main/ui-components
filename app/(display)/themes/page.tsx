"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { themes } from "@/lib/themes"
import { ThemedComponentPreview } from "@/components/themed-component-preview"
import { computeThemeCssVars } from "@/lib/theme-css-vars"
import { Palette, Grid3X3, LayoutGrid, Sun, Moon } from "lucide-react"
import { StylishCarousel } from "@/components/ui/stylish-carousel"

export default function ThemesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "gallery">("grid")
  const [colorMode, setColorMode] = useState<"light" | "dark">("light")
  const [columns, setColumns] = useState(1)
  const [themeModes, setThemeModes] = useState<Record<string, "light" | "dark">>({})

  // Track responsive grid columns to alternate carousel direction per row
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width >= 1024) setColumns(3) // lg:grid-cols-3
      else if (width >= 768) setColumns(2) // md:grid-cols-2
      else setColumns(1)
    }
    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  return (
    <div className="container px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Design Themes</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore consistent design themes that span across all components
          </p>

          <div className="flex justify-center gap-6 mb-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>View:</span>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2 py-1 flex items-center ${
                    viewMode === "grid" ? "bg-muted text-foreground" : "hover:bg-muted/50"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-3.5 w-3.5 mr-1" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("gallery")}
                  className={`px-2 py-1 flex items-center ${
                    viewMode === "gallery" ? "bg-muted text-foreground" : "hover:bg-muted/50"
                  }`}
                  aria-label="Gallery view"
                >
                  <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                  Gallery
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Mode:</span>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => {
                    setColorMode("light")
                    // Set all themes to light
                    setThemeModes(Object.fromEntries(themes.map((t) => [t.id, "light"])) as Record<string, "light" | "dark">)
                  }}
                  className={`px-2 py-1 flex items-center ${
                    colorMode === "light" ? "bg-muted text-foreground" : "hover:bg-muted/50"
                  }`}
                  aria-label="Light mode"
                >
                  <Sun className="h-3.5 w-3.5 mr-1" />
                  Light
                </button>
                <button
                  onClick={() => {
                    setColorMode("dark")
                    // Set all themes to dark
                    setThemeModes(Object.fromEntries(themes.map((t) => [t.id, "dark"])) as Record<string, "light" | "dark">)
                  }}
                  className={`px-2 py-1 flex items-center ${
                    colorMode === "dark" ? "bg-muted text-foreground" : "hover:bg-muted/50"
                  }`}
                  aria-label="Dark mode"
                >
                  <Moon className="h-3.5 w-3.5 mr-1" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          // Grid Layout
          <div className="grid md:grid-cols-2 gap-6">
            {themes.map((theme, idx) => {
              const localMode = themeModes[theme.id] ?? colorMode
              const bg = theme.colors[localMode].background
              const fg = theme.colors[localMode].foreground
              const cssVars = computeThemeCssVars(theme, localMode)
              return (
              <Link key={theme.id} href={`/themes/${theme.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        {theme.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: theme.colors[localMode].primary }}
                        ></div>
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: theme.colors[localMode].secondary }}
                        ></div>
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: theme.colors[localMode].accent }}
                        ></div>
                      </div>
                    </div>
                    <CardDescription className="truncate" title={theme.description}>
                      {theme.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Per-theme light/dark toggle */}
                    <div className="flex items-center justify-end mb-1 gap-1 text-xs text-muted-foreground">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setThemeModes((prev) => ({ ...prev, [theme.id]: "light" }))
                        }}
                        className={`px-2 py-0.5 rounded border ${localMode === "light" ? "bg-muted" : "hover:bg-muted/50"}`}
                        aria-label="Set light mode for theme"
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setThemeModes((prev) => ({ ...prev, [theme.id]: "dark" }))
                        }}
                        className={`px-2 py-0.5 rounded border ${localMode === "dark" ? "bg-muted" : "hover:bg-muted/50"}`}
                        aria-label="Set dark mode for theme"
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div
                      className="rounded-md"
                      style={{ ...cssVars, backgroundColor: bg, color: fg }}
                    >
                      <StylishCarousel
                        className="py-8"
                        speedMs={60000}
                        reverse={idx % 2 === 1}
                        fadeColor={bg}
                      >
                      {/* Render key components directly with no visible container styling for seamless look */}
                        <ThemedComponentPreview seamless themeId={theme.id} component="button" size="medium" mode={localMode} />
                        <ThemedComponentPreview seamless themeId={theme.id} component="card" size="medium" mode={localMode} />
                        <ThemedComponentPreview seamless themeId={theme.id} component="form" size="medium" mode={localMode} />
                        <ThemedComponentPreview seamless themeId={theme.id} component="alert" size="medium" mode={localMode} />
                        <ThemedComponentPreview seamless themeId={theme.id} component="badge" size="medium" mode={localMode} />
                        <ThemedComponentPreview seamless themeId={theme.id} component="mixed" size="medium" mode={localMode} />
                      </StylishCarousel>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-4">
                      <Badge variant="outline" className="text-xs">
                        {theme.styles.borderRadius}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {theme.styles.fontWeight}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {theme.styles.spacing}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )})}
          </div>
        ) : (
          // Gallery Layout
          <div className="space-y-12">
            {themes.map((theme, idx) => {
              const localMode = themeModes[theme.id] ?? colorMode
              const bg = theme.colors[localMode].background
              const fg = theme.colors[localMode].foreground
              const cssVars = computeThemeCssVars(theme, localMode)
              return (
              <section key={theme.id} className="space-y-6">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Palette className="h-6 w-6" />
                      <h2 className="text-2xl font-bold">{theme.name}</h2>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors[localMode].primary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors[localMode].secondary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors[localMode].accent }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Per-theme light/dark toggle for gallery view */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setThemeModes((prev) => ({ ...prev, [theme.id]: "light" }))}
                        className={`px-2 py-0.5 rounded border ${localMode === "light" ? "bg-muted" : "hover:bg-muted/50"}`}
                        aria-label="Set light mode for theme"
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setThemeModes((prev) => ({ ...prev, [theme.id]: "dark" }))}
                        className={`px-2 py-0.5 rounded border ${localMode === "dark" ? "bg-muted" : "hover:bg-muted/50"}`}
                        aria-label="Set dark mode for theme"
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/themes/${theme.id}`}>View Details</Link>
                    </Button>
                  </div>
                </header>

                <p className="text-muted-foreground text-lg truncate" title={theme.description}>
                  {theme.description}
                </p>

                {/* Seamless wide carousel across components for this theme */}
                <div
                  className="rounded-md"
                  style={{ ...cssVars, backgroundColor: bg, color: fg }}
                >
                  <StylishCarousel className="py-8" speedMs={65000} reverse={idx % 2 === 1} fadeColor={bg}>
                    <ThemedComponentPreview seamless themeId={theme.id} component="button" size="large" mode={localMode} />
                    <ThemedComponentPreview seamless themeId={theme.id} component="card" size="large" mode={localMode} />
                    <ThemedComponentPreview seamless themeId={theme.id} component="form" size="large" mode={localMode} />
                    <ThemedComponentPreview seamless themeId={theme.id} component="alert" size="large" mode={localMode} />
                    <ThemedComponentPreview seamless themeId={theme.id} component="badge" size="large" mode={localMode} />
                    <ThemedComponentPreview seamless themeId={theme.id} component="mixed" size="large" mode={localMode} />
                  </StylishCarousel>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(theme.styles).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              </section>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}
