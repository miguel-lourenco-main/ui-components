"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COMPONENTS_INDEX } from '@/lib/componentsIndex'
import ImprovedDynamicComponent from '@/components/improved-dynamic-component'
import indexJson from '@/components/display-components/index.json'
import ComponentPreview from '@/components/component-preview'
import { PageTransition } from '@/components/page-transition'
import { ComponentNavigation } from '@/components/component-navigation'
import { useRef } from 'react'
import { Blocks } from 'lucide-react'

export default function ComponentsPage() {
  const components = COMPONENTS_INDEX
  const searchParams = useSearchParams()
  const componentParam = searchParams.get('component')
  const selected = componentParam
    ? COMPONENTS_INDEX.find(c => c.id.toLowerCase() === componentParam.toLowerCase() || c.name.toLowerCase() === componentParam.toLowerCase())
    : undefined
  const blacklist = (indexJson.blacklist || []) as string[]
  const navRef = useRef<HTMLDivElement | null>(null)

  if (selected) {
    if (blacklist.includes(selected.id)) {
      return (
        <div className="container px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm text-muted-foreground">Component not available.</div>
          </div>
        </div>
      )
    }

    return (
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div ref={navRef}>
            <ComponentNavigation currentComponent={selected.id} />
          </div>
          <PageTransition>
            <ImprovedDynamicComponent componentId={selected.id} navRef={navRef} />
          </PageTransition>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex sm:flex-row sm:gap-x-2 gap-y-2 sm:gap-y-0 flex-col w-full items-center justify-center mb-4 space-x-2">
            <Blocks className="size-9" />
            <h1 className="text-4xl font-bold">Component Library</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Browse our collection of beautifully designed components
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Components</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
                <Link key={component.id} href={`/components?component=${component.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {component.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {component.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-y-3">
                      <div className="flex flex-wrap gap-1">
                        {component.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {component.tags?.length && component.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{component.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="h-28 border rounded-md flex items-center justify-center bg-muted/30">
                        <ComponentPreview componentId={component.preview} context="carousel" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Version {component.version} • by {component.author}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
            ))}
          </div>
        </div>

        {components.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No components found</h3>
            <p className="text-sm text-muted-foreground">
              Components will appear here once they are added to the registry.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
