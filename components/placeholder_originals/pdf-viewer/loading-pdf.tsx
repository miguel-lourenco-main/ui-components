import I18nComponent from "@/components/ui/i18n-component"
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoadingDocument Component
 * Displays a loading indicator with optional custom label for document-related operations
 * 
 * @component
 * @param className - Optional CSS classes for styling
 * @param label - Optional custom loading message (falls back to i18n key)
 */
export default function LoadingDocument(
  {
    className,
    label
  }: {
    className?: string;    // Additional CSS classes
    label?: string;       // Custom loading message
  }
) {
  return (
    <div className={cn(
      "flex flex-col size-full justify-center items-center text-foreground gap-y-3", 
      className
    )}>
      {/* Display either custom label or i18n translated loading message */}
      {label ? <span>{label}</span> : <I18nComponent i18nKey="ui:loadingDocument" />}
      
      {/* Spinning loader icon */}
      <Loader className="size-5 animate-spin" />
    </div>
  );
}