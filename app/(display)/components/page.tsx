"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COMPONENTS_INDEX } from '@/lib/componentsIndex'
import type { FullComponentInfo } from '@/lib/interfaces'

export default function ComponentsPage() {
  const [components, setComponents] = useState<FullComponentInfo[]>(COMPONENTS_INDEX)
  const items = components

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Component Library</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Browse our collection of beautifully designed components
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Components</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((component) => (
                <Link key={component.id} href={`/components/${component.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {component.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {component.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-3">
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
