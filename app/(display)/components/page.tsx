"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlowCard, cardLinkClassName } from '@/components/glow-card'
import { EmptyState } from '@/components/empty-state'
import { FadeIn } from '@/components/motion/fade-in'
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger'
import { COMPONENTS_INDEX } from '@/lib/componentsIndex'
import ImprovedDynamicComponent from '@/components/improved-dynamic-component'
import indexJson from '@/components/display-components/index.json'
import ComponentPreview from '@/components/component-preview'
import { PageTransition } from '@/components/page-transition'
import { ComponentNavigation } from '@/components/component-navigation'
import { useRef } from 'react'
import { Blocks, SearchX } from 'lucide-react'

/**
 * Public components catalog route that either shows the grid of entries or,
 * when a query param is present, renders the fully featured detail experience.
 */
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
            <EmptyState
              icon={SearchX}
              title="Component not available"
              description="This component is not published in the catalog right now."
              action={{ label: "Browse Components", href: "/components" }}
            />
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
        <FadeIn className="text-center mb-12">
          <div className="flex sm:flex-row sm:gap-x-2 gap-y-2 sm:gap-y-0 flex-col w-full items-center justify-center mb-4 space-x-2">
            <Blocks className="size-9" aria-hidden />
            <h1 className="text-display text-4xl font-bold">Component Library</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Browse our collection of beautifully designed components
          </p>
        </FadeIn>

        <div className="mb-12">
          <h2 className="text-display text-2xl font-bold mb-6">Components</h2>
          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <StaggerItem key={component.id} className="h-full">
                <Link href={`/components?component=${component.id}`} className={`${cardLinkClassName} h-full`}>
                  <GlowCard className="cursor-pointer group h-full">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary-accent transition-colors">
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
                  </GlowCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        {components.length === 0 && (
          <EmptyState
            icon={Blocks}
            title="No components found"
            description="Components will appear here once they are added to the registry."
            action={{ label: "Open Playground", href: "/playground" }}
          />
        )}
      </div>
    </div>
  )
}
