import { MAX_FILE_SIZE_STRING } from "@/lib/constants";
import { FileUp } from "lucide-react";

/**
 * Props interface for the FileUploadGuide component
 */
interface FileUploadGuideProps {
  acceptedFileTypes: Record<string, string[]>;  // Map of MIME types to file extensions
  maxFileSize?: string;
}

/**
 * FileUploadGuide Component
 * Renders guidance information for file upload areas, including supported file types
 * and maximum file size information
 * 
 * Features:
 * - Displays upload icon
 * - Shows "click to add or drag and drop" text
 * - Lists supported file extensions
 * - Shows maximum file size limit
 * 
 * @param acceptedFileTypes - Object mapping MIME types to their file extensions
 */
export function FileUploadGuide({ acceptedFileTypes, maxFileSize = MAX_FILE_SIZE_STRING }: FileUploadGuideProps) {
  /**
   * Extracts and formats all supported file extensions
   * Converts extensions to uppercase and removes duplicates
   * 
   * @returns Comma-separated string of unique file extensions
   */
  const getSupportedFileTypes = () => {
    const fileTypes = new Set<string>();
    Object.values(acceptedFileTypes).forEach(extensions => {
      extensions.forEach(ext => fileTypes.add(ext.toUpperCase()));
    });
    return Array.from(fileTypes).join(', ');
  };

  return (
    <div className="flex flex-col items-center space-y-3 text-gray-500 dark:text-gray-400">
      {/* Upload icon */}
      <FileUp className="size-4"/>
      
      {/* Upload instructions */}
      <p className="text-sm text-center">
        <span className="font-semibold">Click to add</span>
        &nbsp; or drag and drop
      </p>
      
      {/* Supported file types */}
      <p className="text-xs">{getSupportedFileTypes()}</p>
      
      {/* Maximum file size limit */}
      {maxFileSize && (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {`Max file size: ${maxFileSize}`}
        </span>
      )}
    </div>
  );
} 