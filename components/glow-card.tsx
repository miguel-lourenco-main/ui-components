import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Focus treatment for links/buttons that wrap a GlowCard, so keyboard users
 * get a visible ring around the whole card.
 */
export const cardLinkClassName =
  "block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Disable hover lift/glow for static cards. */
  interactive?: boolean
}

/**
 * App-shell card: 16px radius, hairline border, indigo hover glow + lift.
 * Radius is applied via class (not --radius) so showcase theme previews keep
 * their own geometry.
 */
export function GlowCard({ className, interactive = true, ...props }: GlowCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-border/70 bg-card",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-[hsl(var(--glow)/0.4)] hover:shadow-glow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
      {...props}
    />
  )
}
