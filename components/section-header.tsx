"use client"

import React from "react"

interface SectionHeaderProps {
  title: string
  description: string
  className?: string
  icon?: React.ReactNode
}

export function SectionHeader({ title, description, className, icon }: SectionHeaderProps) {
  return (
    <div className={"my-10 overflow-visible " + (className || "")}> 
      <div className="h-[2px] relative left-1/2 -translate-x-1/2 w-[calc(100%+2rem)] bg-gradient-to-l from-primary/70 via-primary/40 to-transparent rounded-full mb-3" />
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 text-primary">{icon}</div> : null}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}


