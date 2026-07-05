"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

interface PlaygroundLinkProps extends Omit<ButtonProps, "asChild"> {
  /** Destination, defaults to the playground root. */
  href?: string
  /** Leading icon, swapped for a spinner while the route is loading. */
  icon?: React.ReactNode
}

/**
 * CTA button that navigates to the (heavy) playground route and shows a spinner
 * for as long as the navigation is in flight. The playground pulls in Monaco and
 * the TypeScript worker, so the transition can take a moment — driving the push
 * through a transition lets `isPending` track the real navigation and gives the
 * click immediate feedback instead of a dead-looking button.
 */
export const PlaygroundLink = React.forwardRef<HTMLButtonElement, PlaygroundLinkProps>(
  ({ href = "/playground", icon, children, onClick, disabled, ...props }, ref) => {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    return (
      <Button
        ref={ref}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          startTransition(() => router.push(href))
        }}
        disabled={disabled || isPending}
        aria-busy={isPending}
        {...props}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
        {children}
      </Button>
    )
  }
)
PlaygroundLink.displayName = "PlaygroundLink"
