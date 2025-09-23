"use client"

import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { themes, getTheme } from "@/lib/themes"
import indexJson from "@/components/display-components/index.json"
import { ThemedComponentPreview } from "@/components/themed-component-preview"
import ThemedPreviewSurface from "@/components/themed-preview-surface"
import { computeThemeCssVars } from "@/lib/theme-css-vars"
import { Palette, Grid3X3, LayoutGrid, Sun, Moon, ArrowLeft } from "lucide-react"
import { StylishCarousel } from "@/components/ui/stylish-carousel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"

export default function ThemesPage() {
  const searchParams = useSearchParams()
  const selectedThemeId = searchParams.get('theme') || ''
  const selectedTheme = selectedThemeId ? getTheme(selectedThemeId) : undefined
  const [viewMode, setViewMode] = useState<"grid" | "gallery">("grid")
  const [colorMode, setColorMode] = useState<"light" | "dark">("light")
  const [columns, setColumns] = useState(1)
  const [themeModes, setThemeModes] = useState<Record<string, "light" | "dark">>({})

  const router = useRouter()

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

  if (selectedTheme) {
    return (
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <div className="flex w-fit items-center space-x-2">
              <Palette className="h-6 w-6" />
              <h1 className="text-3xl font-bold">{selectedTheme.name} Theme</h1>
            </div>
            <p className="text-muted-foreground">{selectedTheme.description}</p>
          </div>

          <Card className="mb-8">
            <CardContent>
              <Tabs defaultValue="preview">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col items-start gap-2 py-6">
                    <CardTitle>Color Palettes</CardTitle>
                    <CardDescription>The color scheme used throughout this theme</CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="preview">
                  <div className="flex flex-col xl:flex-row gap-8">
                    {(["light", "dark"] as const).map((mode) => {
                      const isSelected = colorMode === mode
                      return (
                        <div
                          onClick={() => setColorMode(mode)}
                          key={mode}
                          className={`hover:cursor-pointer relative rounded-lg border p-4 transition-all duration-300 transform ${
                            isSelected
                              ? "ring-2 ring-primary shadow-xl scale-105"
                              : "scale-100 hover:scale-[1.03] hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                              {mode === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                              {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                            </h3>
                            {isSelected && <Badge variant="secondary">Selected</Badge>}
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                            {Object.entries(selectedTheme.colors[mode]).map(([name, color]) => (
                              <div key={name} className="text-center">
                                <div
                                  className="w-16 h-16 rounded-lg border-2 border-white shadow-sm mx-auto mb-2"
                                  style={{ backgroundColor: color }}
                                ></div>
                                <p className="lg:block hidden text-sm font-medium capitalize">{name}</p>
                                <p className="lg:block hidden stext-xs text-muted-foreground font-mono">{color}</p>
                              </div>
                            ))}
                          </div>
                          {!isSelected && (
                            <div className="pointer-events-none absolute inset-0 rounded-lg bg-white/50 dark:bg-black/50" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="css">
                  {(() => {
                    const lightVars = computeThemeCssVars(selectedTheme, "light")
                    const darkVars = computeThemeCssVars(selectedTheme, "dark")
                    const toLines = (vars: CSSProperties) =>
                      Object.entries(vars as Record<string, string | number>)
                        .map(([k, v]) => `  ${k}: ${String(v)};`)
                        .join("\n")
                    const lightCss = `/* Light mode variables for ${selectedTheme.name} */\n:root {\n${toLines(lightVars)}\n}`
                    const darkCss = `/* Dark mode variables for ${selectedTheme.name} */\n.dark {\n${toLines(darkVars)}\n}`
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <CodeBlock code={lightCss} language="css" className="max-h-72 overflow-y-auto"/>
                        </div>
                        <div>
                          <CodeBlock code={darkCss} language="css" className="max-h-72 overflow-y-auto"/>
                        </div>
                      </div>
                    )
                  })()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {(
              () => {
                const blacklist = (indexJson.blacklist || []) as string[]
                const componentMap: Record<string, string> = {
                  button: "Buttons",
                  card: "Cards",
                  input: "Input",
                  slider: "Slider",
                  switch: "Switch",
                  textarea: "Textarea",
                  toggle: "Toggle",
                  form: "Forms",
                  alert: "Alerts",
                  badge: "Badges",
                }
                const allowed = (indexJson.components || [])
                  .map((c: any) => c.id)
                  .filter((id: string) => !blacklist.includes(id))
                  .filter((id: string) => componentMap[id])
                const uniqueOrdered = Array.from(new Set(allowed))
                return uniqueOrdered.map((id: string) => ({ id, name: componentMap[id] }))
              }
            )().map((componentType) => (
              <Link href={`/components/?component=${componentType.id}`} key={componentType.id}>
                <Card
                  className={`transition-all duration-200 cursor-pointer group hover:shadow-lg dark:hover:shadow-[0_14px_24px_-6px_rgba(255,255,255,0.18),_0_6px_10px_-4px_rgba(255,255,255,0.12),_0_0_0_1px_rgba(255,255,255,0.06)]`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {componentType.name}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{selectedTheme.name}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          {colorMode === "light" ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                          {colorMode}
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {componentType.name} styled with the {selectedTheme.name} theme in {colorMode} mode
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ThemedPreviewSurface
                      themeId={selectedTheme.id}
                      component={componentType.id as any}
                      size="large"
                      mode={colorMode}
                      showModeToggle={false}
                      surfaceClassName="p-8"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Theme Properties</CardTitle>
              <CardDescription>Design system properties for this theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Border Radius</h3>
                  <Badge variant="secondary">{selectedTheme.styles.borderRadius}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Font Weight</h3>
                  <Badge variant="secondary">{selectedTheme.styles.fontWeight}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Spacing</h3>
                  <Badge variant="secondary">{selectedTheme.styles.spacing}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex w-full items-center justify-center mb-4 space-x-2">
            <Palette className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Design Themes</h1>
          </div>
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
              <Link key={theme.id} href={`/themes?theme=${theme.id}`}>
                <Card
                  className={`transition-all duration-200 border-none cursor-pointer group hover:shadow-lg dark:hover:shadow-[0_14px_24px_-6px_rgba(255,255,255,0.18),_0_6px_10px_-4px_rgba(255,255,255,0.12),_0_0_0_1px_rgba(255,255,255,0.06)]`}
                >
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
                      className="rounded-md pointer-events-none select-none"
                      aria-disabled={true}
                      aria-hidden={true}
                      tabIndex={-1}
                      style={{ ...cssVars, backgroundColor: bg, color: fg }}
                    >
                      <StylishCarousel
                        className="py-8"
                        speedMs={60000}
                        reverse={idx % 2 === 1}
                        fadeColor={bg}
                      >
                        {(() => {
                          const blacklist = (indexJson.blacklist || []) as string[]
                          const allowed = (indexJson.components || [])
                            .map((c: any) => c.id as string)
                            .filter((id: string) => !blacklist.includes(id))
                          return allowed.map((id: any) => (
                            <ThemedComponentPreview key={id} seamless themeId={theme.id} component={id} size="medium" mode={localMode} />
                          ))
                        })()}
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
          <div className="space-y-4">
            {themes.map((theme, idx) => {
              const localMode = themeModes[theme.id] ?? colorMode
              const bg = theme.colors[localMode].background
              const fg = theme.colors[localMode].foreground
              const cssVars = computeThemeCssVars(theme, localMode)
              return (
              <section onClick={() => router.push(`/themes?theme=${theme.id}`)} key={theme.id} className="hover:cursor-pointer rounded-lg p-6 space-y-6 hover:shadow-lg dark:hover:shadow-[0_14px_24px_-6px_rgba(255,255,255,0.18),_0_6px_10px_-4px_rgba(255,255,255,0.12),_0_0_0_1px_rgba(255,255,255,0.06)]">
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
                  </div>
                </header>

                <p className="text-muted-foreground text-lg truncate" title={theme.description}>
                  {theme.description}
                </p>

                {/* Seamless wide carousel across components for this theme */}
                <div
                  className="rounded-md pointer-events-none select-none"
                  aria-disabled={true}
                  aria-hidden={true}
                  tabIndex={-1}
                  style={{ ...cssVars, backgroundColor: bg, color: fg }}
                >
                  <StylishCarousel className="py-8" speedMs={65000} reverse={idx % 2 === 1} fadeColor={bg}>
                    {(() => {
                      const blacklist = (indexJson.blacklist || []) as string[]
                      const allowed = (indexJson.components || [])
                        .map((c: any) => c.id as string)
                        .filter((id: string) => !blacklist.includes(id))
                      return allowed.map((id: any) => (
                        <ThemedComponentPreview key={id} seamless themeId={theme.id} component={id} size="large" mode={localMode} />
                      ))
                    })()}
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
