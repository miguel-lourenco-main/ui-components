"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COMPONENTS_INDEX } from '@/lib/componentsIndex'
import indexJson from '@/components/display-components/index.json'

export default function PopularComponentsGrid() {
  const blacklist = (indexJson.blacklist || []) as string[]
  const items = React.useMemo(() => {
    const comps = COMPONENTS_INDEX.filter(c => !blacklist.includes(c.id))
      .slice(0, 4)
      .map(c => ({ name: c.name, href: `/components/${c.id}` }))
    return comps
  }, [blacklist])

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((component) => (
        <Link key={component.name} href={component.href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">{component.name}</CardTitle>
              <CardDescription>Variant set</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-md flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Preview</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}


