"use client"

import React from "react"
import { StylishCarousel } from "@/components/ui/stylish-carousel"
import ComponentPreview from "@/components/component-preview"
import { COMPONENTS_INDEX } from "@/lib/componentsIndex"
import indexJson from "@/components/display-components/index.json"

/** Seamless marquee of live component previews shown under the landing hero. */
export default function LandingDemoStrip() {
  const items = React.useMemo(() => {
    const blacklist = (indexJson.blacklist || []) as string[]
    return COMPONENTS_INDEX.filter((c) => !blacklist.includes(c.id))
  }, [])

  return (
    <StylishCarousel speedMs={50000}>
      {items.map((component) => (
        <div
          key={component.id}
          className="flex h-24 min-w-[200px] items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-6"
        >
          <ComponentPreview componentId={component.preview} context="carousel" />
        </div>
      ))}
    </StylishCarousel>
  )
}
