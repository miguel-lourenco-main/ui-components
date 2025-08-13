"use client"

import Link from "next/link"
import { COMPONENTS } from "@/components/component-navigation"
import { cn } from "@/lib/utils"

interface ComponentSidebarProps {
  currentComponent: string
}

export function ComponentSidebar({ currentComponent }: ComponentSidebarProps) {
  return (
    <nav className="hidden lg:block sticky top-20 h-[calc(100vh-5rem)] overflow-auto pr-4 transition-all duration-300 will-change-transform">
      <ul className="space-y-1 text-sm">
        {COMPONENTS.map((comp) => {
          const isActive = comp.id === currentComponent
          return (
            <li key={comp.id}>
              <Link
                href={comp.href}
                className={cn(
                  "flex items-center gap-2 rounded px-2 py-1.5 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span className="truncate">{comp.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}


