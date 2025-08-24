"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, AlertCircle, RefreshCw, Pencil, Play } from "lucide-react"
import { CodeBlock } from "@/components/code-block"
import { ComponentThemeList } from "@/components/component-theme-list"
import { ComponentSidebar } from "@/components/component-sidebar"
import { SectionHeader } from "@/components/section-header"
import { useComponentData } from "@/lib/hooks/use-component-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ComponentType } from "@/lib/componentTypes"
import { ComponentPreview } from "@/components/component-preview"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ImprovedDynamicComponentProps {
  componentId: string
  navRef: React.RefObject<HTMLDivElement>
}

export default function ImprovedDynamicComponent({ componentId, navRef }: ImprovedDynamicComponentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showStickySidebar, setShowStickySidebar] = useState(false)
  const [tocPosition, setTocPosition] = useState<'absolute' | 'fixed'>('absolute')
  const tocRef = useRef<HTMLDivElement | null>(null)
  const [variantRevealMap, setVariantRevealMap] = useState<Record<string, boolean>>({})
  
  const {
    meta,
    componentCode,
    variants,
    themes,
    loading,
    errors,
    retry,
    isAllLoaded
  } = useComponentData(componentId)

  const router = useRouter()

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current || !tocRef.current) return
      
      const navRect = navRef.current.getBoundingClientRect()
      // const tocRect = tocRef.current.getBoundingClientRect()
      
      // When nav top reaches window top, switch to fixed
      if (navRect.top <= 0 && tocPosition === 'absolute') {
        setTocPosition('fixed')
      }
      // When scrolling up and nav top is back in view, switch to absolute
      else if (navRect.top > 0 && tocPosition === 'fixed') {
        setTocPosition('absolute')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocPosition, navRef])

  // IntersectionObserver to toggle sidebar when the top carousel is fully gone
  useEffect(() => {
    const target = navRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const fullyGone = entry.boundingClientRect.bottom <= 0
          setShowStickySidebar(fullyGone)
        }
      },
      { threshold: [0, 1] }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [navRef])

  // Error component for individual sections
  const ErrorSection = ({ 
    title, 
    error, 
    onRetry 
  }: { 
    title: string; 
    error: string; 
    onRetry: () => void 
  }) => (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          Failed to load {title.toLowerCase()}: {error}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="ml-2 text-orange-600 border-orange-300 hover:bg-orange-100"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )

  // Loading skeleton
  const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )

  return (
    <div className="container px-4 py-8">
      <div className="relative max-w-6xl mx-auto">
        <div className="mb-8">
          {/* Header Section */}
          {loading.meta ? (
            <div className="space-y-4 mb-8">
              <LoadingSkeleton className="h-10 w-64" />
              <LoadingSkeleton className="h-6 w-96" />
              <div className="flex gap-2">
                <LoadingSkeleton className="h-6 w-20" />
                <LoadingSkeleton className="h-6 w-16" />
                <LoadingSkeleton className="h-6 w-24" />
              </div>
            </div>
          ) : errors.meta ? (
            <ErrorSection 
              title="Component metadata" 
              error={errors.meta} 
              onRetry={retry.meta}
            />
          ) : meta ? (
            <>
              <div className="flex w-full justify-between items-center gap-2">
                <h1 className="text-4xl font-bold mb-4">{meta.name}</h1>
                <Button variant="secondary" size="sm" onClick={() => {
                  router.push(`/playground?component=${componentId}&example=0`)
                }}>
                  <Play className="h-4 w-4" />
                  Open in Playground
                </Button>
              </div>
              <p className="text-xl text-muted-foreground mb-6">{meta.description}</p>

              {/* Component Metadata */}
              <div className="flex flex-wrap gap-2 mb-6">
                {/* Category removed */}
                <Badge variant="outline">Version: {meta.version}</Badge>
                {meta.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h1 className="text-4xl font-bold mb-4">Component: {componentId}</h1>
              <p className="text-xl text-muted-foreground mb-6">Loading component information...</p>
            </div>
          )}

          {/* Tabs like shadcn: Preview and Code */}
          <div className="mb-8" id="section-preview">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4">
                <div className="rounded-lg border p-8 min-h-[280px] flex items-center justify-center">
                  {loading.variants ? (
                    <div className="text-muted-foreground">Loading preview...</div>
                  ) : (
                    <div className="w-full flex items-center justify-center">
                      <ComponentPreview componentId={componentId} context="componentPage" />
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="code" className="mt-4" id="section-code">
                {loading.componentCode ? (
                  <LoadingSkeleton className="h-64 w-full" />
                ) : errors.componentCode ? (
                  <ErrorSection 
                    title="Component source code" 
                    error={errors.componentCode} 
                    onRetry={retry.componentCode}
                  />
                ) : componentCode ? (
                  <div className="rounded-lg border p-4">
                    <div className="max-h-[60vh] overflow-auto">
                      <CodeBlock code={componentCode} language="tsx" reveal={false} />
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No component code available</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Component Variants Section */}
        <div className="mb-8">
          <SectionHeader
            title="Examples & Variants"
            description="Different styles and configurations"
            icon={<Pencil className="h-6 w-6" />}
          />
          <div>
            {loading.variants ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <LoadingSkeleton className="h-6 w-32" />
                    <LoadingSkeleton className="h-32 w-full" />
                  </div>
                ))}
              </div>
            ) : errors.variants ? (
              <ErrorSection 
                title="Component examples" 
                error={errors.variants} 
                onRetry={retry.variants}
              />
            ) : variants && variants.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {variants.filter(variant => variant.id !== "preview-small").map((variant) => (
                  <div key={variant.id} className="rounded-lg border p-4">
                    <div className="mb-3">
                      <h3 className="font-medium flex items-center gap-2">
                        {variant.name}
                        <Badge variant="outline" className={themes?.[variant.theme] || ""}>{variant.theme}</Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground">{variant.description}</p>
                    </div>
                    <Tabs defaultValue="preview" className="w-full">
                      <TabsList>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                      </TabsList>
                      <TabsContent value="preview" className="mt-4">
                        <div className="p-4 border rounded-lg bg-background">
                          {variant.preview || (
                            <div className="text-muted-foreground text-center py-8">Preview component loading...</div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="code" className="mt-4">
                        <CodeBlock code={variant.code} language="tsx" reveal={false} className={`max-h-[220px] relative overflow-auto rounded-md border transition-all duration-300 ${
                          variantRevealMap[variant.id] && "ring-1 ring-primary/20"
                        }`} /> 
                      </TabsContent>
                    </Tabs>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No examples available for this component
              </div>
            )}
          </div>
        </div>

        {/* Theme List Section (lighter styling) */}
        <div id="section-themes">
          
          {loading.themes ? (
            <LoadingSkeleton className="h-32 w-full" />
          ) : errors.themes ? (
            <ErrorSection 
              title="Component themes" 
              error={errors.themes} 
              onRetry={retry.themes}
            />
          ) : (
            <ComponentThemeList 
              componentType={componentId as ComponentType} 
              componentName={meta?.name || componentId} 
            />
          )}
        </div>
      </div>
      {/* Sticky sidebar that shows after carousel disappears */}
      <div
        className={`fixed left-4 top-24 z-30 hidden lg:block transform transition-all duration-300 ${
          showStickySidebar ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
        }`}
      >
        <ComponentSidebar currentComponent={componentId} />
      </div>
    </div>
  )
} 