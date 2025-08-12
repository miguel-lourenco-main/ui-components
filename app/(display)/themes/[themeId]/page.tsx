"use client"

import React, { useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTheme } from "@/lib/themes"
import { ThemedComponentPreview } from "@/components/themed-component-preview"
import ThemedPreviewSurface from "@/components/themed-preview-surface"
import { ArrowLeft, Palette, Sun, Moon } from "lucide-react"
// Component types are now loaded dynamically

interface ThemePageProps {
  params: { themeId: string }
  searchParams?: { component?: string }
}

export default function ThemePage({ params, searchParams }: ThemePageProps) {
  const { themeId } = params
  const { component } = searchParams ?? {}
  const [colorMode, setColorMode] = useState<"light" | "dark">("light")

  const theme = getTheme(themeId)
  if (!theme) {
    notFound()
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/themes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Themes
            </Link>
          </Button>
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex w-fit items-center space-x-2">
              <Palette className="h-6 w-6" />
              <h1 className="text-3xl font-bold">{theme.name} Theme</h1>
            </div>
            <p className="text-muted-foreground">{theme.description}</p>

          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">Mode:</span>
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setColorMode("light")}
                className={`px-2 py-1 flex items-center ${
                  colorMode === "light" ? "bg-muted text-foreground" : "hover:bg-muted/50"
                }`}
                aria-label="Light mode"
              >
                <Sun className="h-3.5 w-3.5" />
                <span className="sr-only">Light mode</span>
              </button>
              <button
                onClick={() => setColorMode("dark")}
                className={`px-2 py-1 flex items-center ${
                  colorMode === "dark" ? "bg-muted text-foreground" : "hover:bg-muted/50"
                }`}
                aria-label="Dark mode"
              >
                <Moon className="h-3.5 w-3.5" />
                <span className="sr-only">Dark mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Color Palette - {colorMode === "light" ? "Light" : "Dark"} Mode</CardTitle>
            <CardDescription>The color scheme used throughout this theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(theme.colors[colorMode]).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-white shadow-sm mx-auto mb-2"
                    style={{ backgroundColor: color }}
                  ></div>
                  <p className="text-sm font-medium capitalize">{name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{color}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Component Previews */}
        <div className="grid gap-6">
          {[
            { id: "button", name: "Buttons" },
            { id: "card", name: "Cards" },
            { id: "form", name: "Forms" },
            { id: "alert", name: "Alerts" },
            { id: "badge", name: "Badges" },
            { id: "table", name: "Tables" },
          ].map((componentType) => (
            <Card key={componentType.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {componentType.name}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{theme.name}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      {colorMode === "light" ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                      {colorMode}
                    </span>
                  </div>
                </CardTitle>
                <CardDescription>
                  {componentType.name} styled with the {theme.name} theme in {colorMode} mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemedPreviewSurface
                  themeId={theme.id}
                  component={componentType.id as any}
                  size="large"
                  mode={colorMode}
                  showModeToggle={false}
                  surfaceClassName="p-8"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Theme Properties */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Theme Properties</CardTitle>
            <CardDescription>Design system properties for this theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Border Radius</h3>
                <Badge variant="secondary">{theme.styles.borderRadius}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Font Weight</h3>
                <Badge variant="secondary">{theme.styles.fontWeight}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Spacing</h3>
                <Badge variant="secondary">{theme.styles.spacing}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
