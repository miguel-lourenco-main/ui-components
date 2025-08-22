"use client"

import { useState, useEffect, useRef } from 'react'
import { ComponentMeta, ComponentVariant } from '@/lib/componentTypes'
import indexJson from '@/components/display-components/index.json'
import { COMPONENTS_INDEX } from '@/lib/componentsIndex'

interface ComponentDataState {
  meta: ComponentMeta | null
  componentCode: string | null
  variants: ComponentVariant[] | null
  themes: Record<string, string> | null
  loading: {
    meta: boolean
    componentCode: boolean
    variants: boolean
    themes: boolean
  }
  errors: {
    meta: string | null
    componentCode: string | null
    variants: string | null
    themes: string | null
  }
}

export function useComponentData(componentId: string) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevComponentIdRef = useRef<string>();

  const [state, setState] = useState<ComponentDataState>({
    meta: null,
    componentCode: null,
    variants: null,
    themes: null,
    loading: {
      meta: true,
      componentCode: true,
      variants: true,
      themes: true,
    },
    errors: {
      meta: null,
      componentCode: null,
      variants: null,
      themes: null,
    },
  })

  // Load component metadata (from local registry)
  const loadMeta = async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, meta: true },
        errors: { ...prev.errors, meta: null }
      }))

      const comp = COMPONENTS_INDEX.find(c => c.id === componentId)
      if (!comp) throw new Error(`Component ${componentId} not found in registry`)
      const meta: ComponentMeta = {
        id: comp.id,
        name: comp.name,
        category: 'mixed',
        description: comp.description,
        props: comp.props as any,
        tags: comp.tags || [],
        version: comp.version || '1.0.0',
        author: comp.author || 'Unknown',
      }
      setState(prev => ({
        ...prev,
        meta,
        loading: { ...prev.loading, meta: false }
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, meta: false },
        errors: { ...prev.errors, meta: error instanceof Error ? error.message : 'Failed to load metadata' }
      }))
    }
  }

  // Load component source code from component metadata (client-only)
  const loadComponentCode = async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, componentCode: true },
        errors: { ...prev.errors, componentCode: null }
      }))

      let code: string | null = null

      try {
        const item = (indexJson as any).components.find(
          (c: any) => c.id.toLowerCase() === componentId.toLowerCase() || c.name.toLowerCase() === componentId.toLowerCase()
        )
        if (item) {
          const normalizedPath = item.path.replace(/^\.\/+/, '').replace(/\/+$/, '')
          const metaModule = await import(`@/components/display-components/${normalizedPath}/${item.name}.meta.json`)
          const metaData = (metaModule as any).default || (metaModule as any)
          code = metaData.code || metaData.componentCode || null
        }
      } catch (e) {
        console.warn('Loading component code from metadata failed', e)
      }

      /**
       * // Try dynamic import based on index.json mapping
      try {
        const item = (indexJson as any).components.find(
          (c: any) => c.id.toLowerCase() === componentId.toLowerCase() || c.name.toLowerCase() === componentId.toLowerCase()
        )
        if (item) {
          const normalizedPath = item.path.replace(/^\.\/+/, '').replace(/\/+$/, '')
          const mod = await import(`@/components/display-components/${normalizedPath}/${item.name}.tsx?raw` as any)
          code = (mod as any).default || null
        }
      } catch (e) {
        console.warn('Dynamic raw import failed, trying hardcoded paths...', e)
      }

      // Fallback to known hardcoded paths (legacy)
      if (!code) {
        try {
          if (componentId === 'button') {
            code = (await import('@/components/display-components/buttons/Button/Button.tsx?raw' as any)).default || null
          } else if (componentId === 'card') {
            code = (await import('@/components/display-components/cards/Card/Card.tsx?raw' as any)).default || null
          } else if (componentId === 'input') {
            code = (await import('@/components/display-components/forms/Input/Input.tsx?raw' as any)).default || null
          } else if (componentId === 'slider') {
            code = (await import('@/components/display-components/forms/Slider/Slider.tsx?raw' as any)).default || null
          } else if (componentId === 'switch') {
            code = (await import('@/components/display-components/forms/Switch/Switch.tsx?raw' as any)).default || null
          } else if (componentId === 'textarea') {
            code = (await import('@/components/display-components/forms/Textarea/Textarea.tsx?raw' as any)).default || null
          } else if (componentId === 'toggle') {
            code = (await import('@/components/display-components/forms/Toggle/Toggle.tsx?raw' as any)).default || null
          }
        } catch (err) {
          console.log('Raw import for component code failed:', err)
        }
      }
       */

      setState(prev => ({
        ...prev,
        componentCode: code,
        loading: { ...prev.loading, componentCode: false },
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, componentCode: false },
        errors: { ...prev.errors, componentCode: error instanceof Error ? error.message : 'Failed to load component code' }
      }))
    }
  }

  // Load variants with dynamic import
  const loadVariants = async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, variants: true },
        errors: { ...prev.errors, variants: null }
      }))

      let variants: ComponentVariant[] | null = null

      try {
        if (componentId === 'button') {
          const examplesModule = await import('@/components/display-components/buttons/Button/Button.examples')
          variants = examplesModule.buttonVariants || null
        } else if (componentId === 'card') {
          const examplesModule = await import('@/components/display-components/cards/Card/Card.examples')
          variants = examplesModule.cardVariants || null
        } else if (componentId === 'input') {
          const examplesModule = await import('@/components/display-components/forms/Input/Input.examples')
          variants = examplesModule.inputVariants || null
        } else if (componentId === 'slider') {
          const examplesModule = await import('@/components/display-components/forms/Slider/Slider.examples')
          variants = examplesModule.sliderVariants || (examplesModule.sliderExamples || []).map((ex: any, idx: number) => ({
            id: `ex-${idx}`,
            name: ex.name,
            description: ex.description || '',
            theme: 'modern',
            preview: null,
            code: ex.code || ''
          }))
        } else if (componentId === 'switch') {
          const examplesModule = await import('@/components/display-components/forms/Switch/Switch.examples')
          variants = examplesModule.switchVariants || (examplesModule.switchExamples || []).map((ex: any, idx: number) => ({
            id: `ex-${idx}`,
            name: ex.name,
            description: ex.description || '',
            theme: 'modern',
            preview: null,
            code: ex.code || ''
          }))
        } else if (componentId === 'textarea') {
          const examplesModule = await import('@/components/display-components/forms/Textarea/Textarea.examples')
          variants = examplesModule.textareaVariants || (examplesModule.textareaExamples || []).map((ex: any, idx: number) => ({
            id: `ex-${idx}`,
            name: ex.name,
            description: ex.description || '',
            theme: 'modern',
            preview: null,
            code: ex.code || ''
          }))
        } else if (componentId === 'toggle') {
          const examplesModule = await import('@/components/display-components/forms/Toggle/Toggle.examples')
          variants = examplesModule.toggleVariants || (examplesModule.examples || []).map((ex: any, idx: number) => ({
            id: `ex-${idx}`,
            name: ex.name || `Example ${idx + 1}`,
            description: '',
            theme: 'modern',
            preview: null,
            code: ''
          }))
        }
      } catch (dynamicImportError) {
        console.log('Dynamic import failed:', dynamicImportError)
      }

      setState(prev => ({
        ...prev,
        variants,
        loading: { ...prev.loading, variants: false }
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, variants: false },
        errors: { ...prev.errors, variants: error instanceof Error ? error.message : 'Failed to load variants' }
      }))
    }
  }

  // Load themes (via dynamic import)
  const loadThemes = async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, themes: true },
        errors: { ...prev.errors, themes: null }
      }))

      let themes: Record<string, string> | null = null

      try {
        if (componentId === 'button') {
          const examplesModule = await import('@/components/display-components/buttons/Button/Button.examples')
          themes = examplesModule.buttonThemes || null
        } else if (componentId === 'card') {
          const examplesModule = await import('@/components/display-components/cards/Card/Card.examples')
          themes = examplesModule.cardThemes || null
        } else if (componentId === 'input') {
          const examplesModule = await import('@/components/display-components/forms/Input/Input.examples')
          themes = examplesModule.inputThemes || null
        } else if (componentId === 'slider') {
          const examplesModule = await import('@/components/display-components/forms/Slider/Slider.examples')
          themes = examplesModule.sliderThemes || null
        } else if (componentId === 'switch') {
          const examplesModule = await import('@/components/display-components/forms/Switch/Switch.examples')
          themes = examplesModule.switchThemes || null
        } else if (componentId === 'textarea') {
          const examplesModule = await import('@/components/display-components/forms/Textarea/Textarea.examples')
          themes = examplesModule.textareaThemes || null
        } else if (componentId === 'toggle') {
          const examplesModule = await import('@/components/display-components/forms/Toggle/Toggle.examples')
          themes = examplesModule.toggleThemes || null
        }
      } catch (dynamicImportError) {
        console.log('Dynamic import for themes failed')
      }

      setState(prev => ({
        ...prev,
        themes,
        loading: { ...prev.loading, themes: false }
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, themes: false },
        errors: { ...prev.errors, themes: error instanceof Error ? error.message : 'Failed to load themes' }
      }))
    }
  }

  // Load all data when component ID changes
  useEffect(() => {
    if (!componentId) return

    loadMeta()
    loadComponentCode()
    loadVariants()
    loadThemes()
  }, [componentId])

  useEffect(() => {
    if (prevComponentIdRef.current && prevComponentIdRef.current !== componentId) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
          setIsTransitioning(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [componentId]);

  useEffect(() => {
    prevComponentIdRef.current = componentId;
  });

  // Utility functions for retrying individual data loads
  const retry = {
    meta: loadMeta,
    componentCode: loadComponentCode,
    variants: loadVariants,
    themes: loadThemes,
  }

  // Helper to check if all data is loaded
  const isAllLoaded = !Object.values(state.loading).some(Boolean)

  // Helper to check if any data has errors
  const hasErrors = Object.values(state.errors).some(Boolean)

  const combinedLoading = {
    meta: isTransitioning || state.loading.meta,
    componentCode: isTransitioning || state.loading.componentCode,
    variants: isTransitioning || state.loading.variants,
    themes: isTransitioning || state.loading.themes,
  };

  return {
    ...state,
    loading: combinedLoading,
    retry,
    isAllLoaded,
    hasErrors,
  }
} 