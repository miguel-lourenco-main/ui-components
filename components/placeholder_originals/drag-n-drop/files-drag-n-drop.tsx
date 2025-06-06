"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { DirectionOptions, FilesDragNDropProps } from "@/lib/types";
import { FileRejection, useDropzone } from "@/lib/hooks/use-drag-drop";

// Maximum file size limit in bytes (256MB)
export const MAX_FILE_SIZE_MB = 256 * 1024 * 1024;

// Human-readable string representation of the maximum file size
export const MAX_FILE_SIZE_STRING = `${MAX_FILE_SIZE_MB / 1024 / 1024}MB`;

/**
 * Default accepted file types with their corresponding extensions
 */
const DEFAULT_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

/**
 * FilesDragNDrop Component
 * A reusable drag and drop component for file uploads with keyboard navigation support
 */
export const FilesDragNDrop = forwardRef<
  HTMLDivElement,
  FilesDragNDropProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      files,
      addFiles,
      removeFiles,
      className,
      acceptFiles = DEFAULT_ACCEPT,
      orientation = "vertical",
      children,
      disabled
    },
    ref
  ) => {
    // Component state
    const [isFileTooBig, setIsFileTooBig] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const { t } = useTranslation('ui');
    const direction: DirectionOptions = "ltr";

    /**
     * Handles file drop events
     * Processes both accepted and rejected files
     */
    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!acceptedFiles?.length) {
        toast.error("File error: file is too big");
        return;
      }
      
      // Convert files to TrackableFile format and add them
      addFiles(acceptedFiles.map(file => ({ fileObject: file })));

      // Handle rejected files with appropriate error messages
      if (rejectedFiles.length > 0) {
        for (const rejectedFile of rejectedFiles) {
          if (rejectedFile?.errors[0]?.code === "file-too-large") {
            toast.error(`${t("fileTooLarge")} ${MAX_FILE_SIZE_STRING}`);
            break;
          }
          if (rejectedFile?.errors[0]?.message) {
            toast.error(rejectedFile?.errors[0]?.message);
            break;
          }
        }
      }
    }, [addFiles, t]);

    /**
     * Configure dropzone with options and event handlers
     */
    const dropzone = useDropzone({
      accept: acceptFiles,
      maxFiles: 1000,
      maxSize: MAX_FILE_SIZE_MB,
      multiple: true,
      onDrop,
      onDropRejected: () => setIsFileTooBig(true),
      onDropAccepted: () => setIsFileTooBig(false),
      noClick: true, // Disable automatic click handling
    });

    /**
     * Keyboard navigation handler
     * Supports arrow keys for navigation, Enter/Space for selection,
     * Delete/Backspace for removal, and Escape to clear selection
     */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!files) return;

        // Navigation helper functions
        const moveNext = () => {
          const nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex > files.length - 1 ? 0 : nextIndex);
        };

        const movePrev = () => {
          const nextIndex = activeIndex - 1;
          setActiveIndex(nextIndex < 0 ? files.length - 1 : nextIndex);
        };

        // Determine navigation keys based on orientation and direction
        const prevKey = orientation === "horizontal"
          ? direction === "ltr" ? "ArrowLeft" : "ArrowRight"
          : "ArrowUp";

        const nextKey = orientation === "horizontal"
          ? direction === "ltr" ? "ArrowRight" : "ArrowLeft"
          : "ArrowDown";

        // Handle different key presses
        if (e.key === nextKey) {
          moveNext();
        } else if (e.key === prevKey) {
          movePrev();
        } else if (e.key === "Enter" || e.key === "Space") {
          if (activeIndex === -1) {
            dropzone.inputRef.current?.click();
          }
        } else if (e.key === "Delete" || e.key === "Backspace") {
          if (activeIndex !== -1) {
            removeFiles(files.filter((_, index) => index !== activeIndex));
            if (files.length - 1 === 0) {
              setActiveIndex(-1);
              return;
            }
            movePrev();
          }
        } else if (e.key === "Escape") {
          setActiveIndex(-1);
        }
      },
      [files, activeIndex, removeFiles, orientation, direction, dropzone.inputRef]
    );

    const handleClick = useCallback((e: React.MouseEvent) => {
      // Check if we're clicking a file or its controls
      const isFileClick = (e.target as HTMLElement).closest('[data-delete-file-item]');
      if (!isFileClick && !disabled) {
        dropzone.inputRef.current?.click();
      }
    }, [dropzone.inputRef, disabled]);

    return (
      <div
        ref={ref}
        tabIndex={0}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative flex w-full h-full gap-4 p-2 focus:outline-none overflow-hidden", className)}
        dir={direction}
        {...dropzone.getRootProps()}
        onClick={handleClick}
      >
        <div className={cn("flex absolute top-0 left-0 z-10 items-center justify-center w-full h-full p-2 bg-background/80")}>
          <div
            className={cn(
              "flex flex-col items-center justify-center size-full rounded-lg duration-300 ease-in-out outline-dashed outline-1 outline-foreground cursor-pointer",
              dropzone.isDragAccept ? "border-green-500" : 
              dropzone.isDragReject || isFileTooBig ? "border-red-500" : "border-gray-300",
              disabled && "cursor-not-allowed"
            )}
          >
            {children}
          </div>
          <input {...dropzone.getInputProps()} />
        </div>
      </div>
    );
  }
);

FilesDragNDrop.displayName = "FilesDragNDrop";

export default FilesDragNDrop;

