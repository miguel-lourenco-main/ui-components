'use client';

import { File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TooltipComponent from "@/components/ui/tooltip-component";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TrackableFile } from "@/lib/interfaces";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

/**
 * Props interface for the StatusIndicator component
 */
interface StatusIndicatorProps {
  id?: string;                   // Optional file ID
  status?: "uploading" | "uploaded" | "client" | "error";  // File status
  className?: string;            // Optional additional CSS classes
}

// Constant for consistent icon sizing
const size = "size-full";

/**
 * StatusIndicator Component
 * Displays a visual indicator for file status (upload progress, success, error)
 * 
 * Status Types:
 * - uploaded: Shows a green checkmark
 * - uploading: Shows a blue spinning loader
 * - error: Shows a red X
 * - default/client: Shows a gray circle
 * 
 * @param id - Optional file ID
 * @param status - Current status of the file
 * @param className - Optional CSS classes for styling
 */
export function FileStatusIndicator({ id, status, className }: StatusIndicatorProps) {
  return (
    <div className={cn(
      // Base styles for the indicator container
      "absolute top-0 right-6 size-4 rounded-full flex items-center justify-center",
      "text-white",
      className
    )}>
      {/* Render appropriate icon based on status */}
      {id && status === "uploaded" ? (
        <CheckCircle className={`${size} text-green-500`} />
      ) : status === "uploading" ? (
        <Loader2 className={`${size} animate-spin text-blue-500`} />
      ) : status === "error" ? (
        <XCircle className={`${size} text-red-500`} />
      ) : (
        // Default state (client-side or no status)
        <div className={`${size} border border-gray-800 bg-gray-700 rounded-full`} />
      )}
    </div>
  );
} 

/**
 * Props interface for the FilesGrid component
 */
interface FilesGridProps {
  files: TrackableFile[];                                // Array of files to display
  onFileRemove?: (filteredFiles: TrackableFile[]) => void;  // Optional callback for file removal
  disabled?: boolean;                                    // Optional disabled state
}

/**
 * FilesGrid Component
 * Displays a responsive grid of files with icons, names, and status indicators
 */
export default function FilesGrid({ 
  files, 
  onFileRemove, 
  disabled,
}: FilesGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation('ui');

    /**
     * Updates grid layout based on container size
     * Calculates optimal number of columns and rows for the available space
     */
    useEffect(() => {
        const updateGridLayout = () => {
            const grid = gridRef.current;
            if (grid) {
                const width = grid.offsetWidth;
                const height = grid.offsetHeight;
                const itemSize = 130;  // Fixed size for each grid item
                const gap = 16;        // Gap between grid items

                // Calculate optimal grid dimensions
                const columnCount = Math.floor((width - gap) / (itemSize + gap));
                const rowCount = Math.floor((height - gap) / (itemSize + gap));

                // Update CSS custom properties for grid layout
                grid.style.setProperty('--grid-column-count', `${columnCount}`);
                grid.style.setProperty('--grid-row-count', `${rowCount}`);
            }
        };

        // Initial layout update and resize listener
        updateGridLayout();
        window.addEventListener('resize', updateGridLayout);
        return () => window.removeEventListener('resize', updateGridLayout);
    }, []);

    /**
     * Handles file removal when delete button is clicked
     * @param index - Index of the file to remove
     */
    const handleRemoveFile = (index: number) => {
        if (!disabled && onFileRemove) {
            const file = files[index];
            if (file) {
                onFileRemove([file]);
            }
        }
    }

    return (
        <div 
            ref={gridRef}
            className={cn(
                "grid gap-4 size-full border-2 p-4 rounded-md overflow-hidden",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{
                gridTemplateColumns: 'repeat(var(--grid-column-count, 3), 130px)',
                gridTemplateRows: 'repeat(var(--grid-row-count, 3), 130px)',
                gridAutoRows: '130px',
                gridAutoColumns: '130px',
            }}
        >
            {files.map((file, index) => (
                <div 
                    key={index} 
                    className={cn(
                        "relative overflow-hidden rounded-lg group h-fit w-full flex items-center justify-center",
                        disabled && "pointer-events-none"
                    )}
                >
                    {/* Status indicator for file upload state */}
                    {file.uploadingStatus && (
                        <FileStatusIndicator 
                            id={file.id} 
                            status={file.uploadingStatus}
                        />
                    )}
                    {/* File icon and name */}
                    <div className="flex flex-col size-full items-center p-2 justify-center space-y-2 object-cover group-hover:opacity-20 transition-opacity">
                        <File className="size-12" />
                        <p className="w-full px-2 text-sm text-center truncate">{file.fileObject.name}</p>
                    </div>
                    {/* Delete button (shown on hover) */}
                    {!disabled && (
                        <div className="absolute flex size-full items-center justify-center opacity-0 z-20 group-hover:opacity-100 transition-opacity">
                            <Button 
                                type="button" 
                                variant="light_foreground" 
                                size="fit" 
                                data-delete-file-item 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(index);
                                }}
                                disabled={disabled}
                            >
                                <TooltipComponent 
                                    trigger={<Trash2 className="size-8 p-1.5" />} 
                                    content={<div>{t('delete')}</div>} 
                                />
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}