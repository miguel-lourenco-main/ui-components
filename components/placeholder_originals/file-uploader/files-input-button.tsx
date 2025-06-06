'use client'

import { ChangeEvent, useRef } from "react";

/**
 * FileInputButton Component
 * A customizable button wrapper for file input functionality
 * 
 * @component
 */
export function FileInputButton({
  addDroppedFiles,
  acceptsTypes,
  content
}:{
  addDroppedFiles: (files: File[]) => void;  // Callback function when files are selected
  acceptsTypes: string;                      // Comma-separated string of accepted file types
  content: (handleFileUpload: () => void) => React.ReactNode;  // Render function for custom button content
}){
  // Reference to the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Triggers the hidden file input click event
   */
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles file selection changes
   * Filters files based on accepted types and calls the callback
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const droppedFiles = event.target.files ?? []
    const fileArray = Array.from(droppedFiles);

    // Parse accepted file types into array
    const acceptedTypes = acceptsTypes.split(',').map(type => type.trim());
    const acceptedFiles: File[] = [];
    const rejectedFiles: File[] = [];

    // Filter files based on type
    fileArray.forEach((file: File) => {
      if (acceptedTypes.some(type => file.type.match(type) ?? file.name.endsWith(type.replace('*', '')))) {
        acceptedFiles.push(file);
      } else {
        rejectedFiles.push(file);
      }
    });

    // Call callback with accepted files
    addDroppedFiles(acceptedFiles);
  };

  return(
    <>
      {/* Render custom button content */}
      {content(handleFileUpload)}
      {/* Hidden file input */}
      <input
        type="file"
        multiple={true}
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={acceptsTypes}
      />
    </>
  )
}