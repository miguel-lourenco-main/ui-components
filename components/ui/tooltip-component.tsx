import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import { cn } from "@/lib/utils";

/**
 * TooltipComponent
 * A reusable tooltip wrapper that provides hover-based information display
 * 
 * Features:
 * - Consistent tooltip styling and behavior
 * - Flexible trigger element support
 * - Custom content rendering
 * - Optional className for styling
 * 
 * @param trigger - Element that triggers the tooltip on hover
 * @param content - Content to display in the tooltip
 * @param className - Optional CSS classes for the tooltip content
 */
export default function TooltipComponent({ 
  trigger, 
  content, 
  className 
}: { 
  trigger: React.ReactNode,    // Element that shows the tooltip on hover
  content: React.ReactNode,    // Content to show in the tooltip
  className?: string          // Optional CSS classes for styling
}){
  return (
    // Wrapper with isolation to prevent z-index stacking issues
    <div className="contents isolate">
      <TooltipProvider>
        <Tooltip>
          {/* Trigger element wrapper */}
          <TooltipTrigger asChild className="w-fit">
              {trigger}
          </TooltipTrigger>
          {/* Tooltip content with z-index handling */}
          <TooltipContent className={cn("z-50", className)}>
              {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}