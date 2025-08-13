"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ComponentPreview } from "@/components/component-preview"
import { useEffect, useRef } from "react"

import { COMPONENTS_INDEX } from '@/lib/componentsIndex'
import indexJson from '@/components/display-components/index.json'

// Generate navigation items dynamically from discovered components
function generateComponentNavigation() {
  const blacklist = (indexJson.blacklist || []) as string[];
  const filteredComponents = COMPONENTS_INDEX.filter(c => !blacklist.includes(c.id));
  
  return filteredComponents.map(component => ({
    name: component.name || component.id.charAt(0).toUpperCase() + component.id.slice(1).replace('-', ' '),
    href: `/components/${component.id}`,
    id: component.id,
    preview: component.id
  }));
}

export const COMPONENTS = generateComponentNavigation();

interface ComponentNavigationProps {
  currentComponent: string
}

export function ComponentNavigation({ currentComponent }: ComponentNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Center the current component in the carousel
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const el = container.querySelector(
      `[data-component-id="${currentComponent}"]`
    ) as HTMLElement | null
    if (!el) return
    const elementCenter = el.offsetLeft + el.offsetWidth / 2
    const targetLeft = Math.max(0, elementCenter - container.clientWidth / 2)
    container.scrollTo({ left: targetLeft, behavior: "smooth" })
  }, [currentComponent])

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" })
    }
  }

  return (
    <div className="mb-8">
      {/* Carousel Navigation */}
      <div className="relative mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 z-10 h-8 w-8 rounded-full bg-background shadow-md"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div
            ref={scrollRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide px-12 py-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {COMPONENTS.map((component) => (
              <Link key={component.id} href={component.href} className="shrink-0">
                <Card
                  className={cn(
                    "w-64 transition-all duration-200 hover:shadow-md cursor-pointer",
                    component.id === currentComponent ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm",
                  )}
                  data-component-id={component.id}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="border rounded-md flex items-center justify-center bg-muted/30">
                        <ComponentPreview componentId={component.preview} context="carousel" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-medium text-sm truncate",
                            component.id === currentComponent && "text-primary",
                          )}
                        >
                          {component.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {component.id === currentComponent ? "Current" : "View components"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 z-10 h-8 w-8 rounded-full bg-background shadow-md"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
