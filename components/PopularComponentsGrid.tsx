"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { COMPONENTS_INDEX } from '@/lib/componentsIndex'
import indexJson from '@/components/display-components/index.json'
import ComponentPreview from './component-preview'

export default function PopularComponentsGrid() {
  const blacklist = (indexJson.blacklist || []) as string[]
  const items = React.useMemo(() => {
    const comps = COMPONENTS_INDEX.filter(c => !blacklist.includes(c.id))
      .slice(0, 5)
      .map(c => ({ name: c.name, href: `/components/?component=${c.id}`, preview: c.preview }))
    return comps
  }, [blacklist])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {items.map((component) => (
        <Link key={component.name} href={component.href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">{component.name}</CardTitle>
              <CardDescription>Variant set</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="h-28 border rounded-md flex items-center justify-center bg-muted/30">
                <ComponentPreview componentId={component.preview} context="carousel" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      {/* Allude to more components */}
      <Link href="/components">
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Explore all
              <ArrowRight className="h-4 w-4" />
            </CardTitle>
            <CardDescription>Browse the library</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-full border border-dashed rounded-md flex items-center justify-center bg-muted/20">
              <span className="text-sm text-center text-muted-foreground">See all components</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

export function PopularComponentsGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="border rounded-md flex items-center justify-center bg-muted/30 p-4">
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}