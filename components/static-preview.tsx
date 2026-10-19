import React from "react"
import { cn } from "@/lib/utils"

interface StaticPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * Wraps a showcase render (variants, examples, theme thumbnails) so nothing
 * inside it can be clicked, typed into or focused. `inert` removes the subtree
 * from tab order and the accessibility tree; pointer-events and user-select
 * cover the mouse. The live, editable preview is the playground's job.
 */
export function StaticPreview({ children, className, ...rest }: StaticPreviewProps) {
  return (
    <div
      {...rest}
      // React 18 has no typed `inert` prop; an empty string renders the boolean attribute.
      {...({ inert: "" } as Record<string, string>)}
      className={cn("pointer-events-none select-none", className)}
    >
      {children}
    </div>
  )
}
