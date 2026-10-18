"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

type ResizableHandleProps = React.ComponentProps<
  typeof ResizablePrimitive.PanelResizeHandle
> & {
  withHandle?: boolean
  /**
   * Optional hint shown while the pointer is over the handle. The tooltip is
   * anchored to the grip because `PanelResizeHandle` does not forward refs,
   * so open state is driven by the handle's own pointer events instead.
   */
  tooltip?: React.ReactNode
  tooltipSide?: React.ComponentProps<typeof TooltipContent>["side"]
}

const ResizableHandle = ({
  withHandle,
  tooltip,
  tooltipSide = "right",
  className,
  onPointerEnter,
  onPointerLeave,
  ...props
}: ResizableHandleProps) => {
  const [hovered, setHovered] = React.useState(false)
  const hasTooltip = tooltip != null && tooltip !== false

  const grip = withHandle ? (
    <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
      <GripVertical className="h-2.5 w-2.5" />
    </div>
  ) : (
    <span aria-hidden className="pointer-events-none size-0" />
  )

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      onPointerEnter={(event) => {
        setHovered(true)
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        setHovered(false)
        onPointerLeave?.(event)
      }}
      {...props}
    >
      {hasTooltip ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip
            open={hovered}
            onOpenChange={(next) => {
              // Only honour close requests (Escape, scroll); opening is driven
              // by the whole handle's hover area, not just the small grip.
              if (!next) setHovered(false)
            }}
          >
            <TooltipTrigger asChild>{grip}</TooltipTrigger>
            <TooltipContent
              side={tooltipSide}
              sideOffset={8}
              className="max-w-xs"
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        withHandle && grip
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
