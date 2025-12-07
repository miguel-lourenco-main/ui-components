"use client"

import React, { useEffect, useMemo, useState } from "react"
import indexJson from '@/components/display-components/index.json'
import { ThemedComponentPreview } from '@/components/themed-component-preview'

type PreviewContext = 'carousel' | 'themes' | 'componentPage'
type PreviewSize = 'small' | 'medium' | 'large'

interface ComponentPreviewProps {
  componentId: string
  context: PreviewContext
  themeId?: string
  overrideSize?: PreviewSize
}

/** Normalizes component ids into PascalCase so legacy preview exports can be resolved. */
function toPascalCase(input: string): string {
  return input
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase())
}

/** Maps the preview context (carousel/theme/page) to the default preview size. */
function getDesiredSize(context: PreviewContext, overrideSize?: PreviewSize): PreviewSize {
  if (overrideSize) return overrideSize
  if (context === 'carousel') return 'small'
  return 'medium'
}

/** Utility for converting sizing tokens into the right Tailwind scale class. */
function getScaleClass(size: PreviewSize): string {
  switch (size) {
    case 'small':
      return 'scale-75'
    case 'medium':
      return 'scale-100'
    case 'large':
      return 'scale-100'
    default:
      return 'scale-100'
  }
}

/** Returns width/height classes that match the preview size. */
function getContainerClass(size: PreviewSize): string {
  switch (size) {
    case 'small':
      return 'w-16 h-12'
    case 'medium':
      return 'w-24 h-20'
    case 'large':
      return 'w-32 h-24'
    default:
      return 'w-24 h-20'
  }
}

/**
 * Dynamically imports the `.examples` module for the requested component.
 * Returns `null` when the registry entry is missing or the import fails.
 */
async function importExamplesModule(componentId: string): Promise<any | null> {
  const item = (indexJson as any).components.find(
    (c: any) => c.id.toLowerCase() === componentId.toLowerCase() || c.name.toLowerCase() === componentId.toLowerCase()
  )
  if (!item) return null
  const normalizedPath = item.path.replace(/^\.\/+/, '').replace(/\/+$/, '')
  try {
    const mod = await import(`@/components/display-components/${normalizedPath}/${item.name}.examples`)
    return mod
  } catch (e) {
    console.warn('Failed to import examples module for', componentId, e)
    return null
  }
}

/**
 * Chooses the best preview component export based on size and legacy naming fallbacks.
 */
function pickPreviewExport(mod: any, itemName: string, size: PreviewSize): React.ComponentType | null {
  if (!mod) return null
  // Preferred exports: SmallPreview / MediumPreview
  const preferred = size === 'small' ? mod.SmallPreview : mod.MediumPreview
  if (preferred) return preferred
  // Back-compat: ButtonSmallPreview, CardSmallPreview, etc.
  const pascal = toPascalCase(itemName)
  const legacyName = size === 'small' ? `${pascal}SmallPreview` : `${pascal}MediumPreview`
  if (mod[legacyName]) return mod[legacyName]
  return null
}

/**
 * Runtime loader that selects and renders the correct preview snippet for a component
 * depending on where it is being shown (carousel, theme browser, or component page).
 */
function ComponentPreview({ componentId, context, themeId, overrideSize }: ComponentPreviewProps) {
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType | null>(null)

  const desiredSize = useMemo(() => getDesiredSize(context, overrideSize), [context, overrideSize])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (context === 'themes') {
        // nothing to load here, themed preview uses its own renderer
        setPreviewComponent(() => null)
        return
      }
      const item = (indexJson as any).components.find(
        (c: any) => c.id.toLowerCase() === componentId.toLowerCase() || c.name.toLowerCase() === componentId.toLowerCase()
      )
      const mod = await importExamplesModule(componentId)
      if (cancelled) return
      const comp = pickPreviewExport(mod, item?.name || componentId, desiredSize)
      setPreviewComponent(() => comp as any)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [componentId, context, desiredSize])

  // Themes context delegates to ThemedComponentPreview
  if (context === 'themes') {
    if (!themeId) return null
    // The ThemedComponentPreview handles its own sizing containerization
    return (
      <div className="pointer-events-none">
        <ThemedComponentPreview
          themeId={themeId}
          component={componentId as any}
          size={desiredSize}
          mode="light"
          seamless={true}
        />
      </div>
    )
  }

  if (!PreviewComponent) {
    // Loading or not available → show placeholder container based on context
    if (context === 'componentPage') {
      return <div className="text-sm text-muted-foreground">Preview</div>
    }
    return (
      <div className={`flex items-center justify-center ${getContainerClass(desiredSize)}`}>
        <div className={`text-xs text-muted-foreground ${getScaleClass(desiredSize)} origin-center`}>Preview</div>
      </div>
    )
  }

  // Render rules per context
  if (context === 'componentPage') {
    // No container constraints or scale
    return <PreviewComponent />
  }

  // Carousel or other constrained contexts: apply container + scale
  return (
    <div className={`flex items-center justify-center ${getContainerClass(desiredSize)} p-1 overflow-hidden`}> 
      <div className={`flex items-center justify-center size-full  ${getScaleClass(desiredSize)} origin-center pointer-events-none`}>
        <PreviewComponent />
      </div>
    </div>
  )
}

export default ComponentPreview
