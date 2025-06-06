import { useCallback, useRef, useState } from "react";

// Type definitions to replace react-dropzone types
export interface FileError {
  code: string;
  message: string;
}

export interface FileRejection {
  file: File;
  errors: FileError[];
}

export interface DropzoneOptions {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  onDrop?: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
  onDropRejected?: (rejectedFiles: FileRejection[]) => void;
  onDropAccepted?: (acceptedFiles: File[]) => void;
  noClick?: boolean;
}

export interface DropzoneState {
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  getRootProps: () => React.HTMLAttributes<HTMLElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
}

export function useDropzone(options: DropzoneOptions = {}): DropzoneState {
  const {
    accept = {},
    maxFiles = 0,
    maxSize = Infinity,
    multiple = true,
    onDrop,
    onDropRejected,
    onDropAccepted,
    noClick = false,
  } = options;

  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragAccept, setIsDragAccept] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const validateFile = useCallback((file: File): FileError[] => {
    const errors: FileError[] = [];

    // Check file size
    if (maxSize && file.size > maxSize) {
      errors.push({
        code: "file-too-large",
        message: `File is larger than ${maxSize} bytes`,
      });
    }

    // Check file type if accept is specified
    if (Object.keys(accept).length > 0) {
      const isAccepted = Object.entries(accept).some(([mimeType, extensions]) => {
        // Check MIME type
        if (file.type === mimeType) return true;
        
        // Check file extension
        return extensions.some(ext => 
          file.name.toLowerCase().endsWith(ext.toLowerCase())
        );
      });

      if (!isAccepted) {
        errors.push({
          code: "file-invalid-type",
          message: `File type ${file.type} is not accepted`,
        });
      }
    }

    return errors;
  }, [accept, maxSize]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Limit number of files if maxFiles is specified
    const filesToProcess = maxFiles > 0 ? fileArray.slice(0, maxFiles) : fileArray;
    
    const acceptedFiles: File[] = [];
    const rejectedFiles: FileRejection[] = [];

    filesToProcess.forEach(file => {
      const errors = validateFile(file);
      
      if (errors.length === 0) {
        acceptedFiles.push(file);
      } else {
        rejectedFiles.push({ file, errors });
      }
    });

    // Call callbacks
    onDrop?.(acceptedFiles, rejectedFiles);
    
    if (acceptedFiles.length > 0) {
      onDropAccepted?.(acceptedFiles);
    }
    
    if (rejectedFiles.length > 0) {
      onDropRejected?.(rejectedFiles);
    }
  }, [maxFiles, validateFile, onDrop, onDropAccepted, onDropRejected]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
      
      // Check if dragged items are acceptable
      const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
      if (hasFiles) {
        setIsDragAccept(true);
        setIsDragReject(false);
      } else {
        setIsDragAccept(false);
        setIsDragReject(true);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current--;
    
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
      setIsDragAccept(false);
      setIsDragReject(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set dropEffect to copy
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragActive(false);
    setIsDragAccept(false);
    setIsDragReject(false);
    dragCounterRef.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const getRootProps = useCallback(() => {
    const props: React.HTMLAttributes<HTMLElement> = {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    };

    if (!noClick) {
      props.onClick = () => {
        inputRef.current?.click();
      };
    }

    return props;
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, noClick]);

  const getInputProps = useCallback(() => ({
    ref: inputRef,
    type: 'file' as const,
    multiple,
    accept: Object.keys(accept).join(','),
    onChange: handleInputChange,
    style: { display: 'none' as const },
  }), [multiple, accept, handleInputChange]);

  return {
    isDragActive,
    isDragAccept,
    isDragReject,
    inputRef,
    getRootProps,
    getInputProps,
  };
} 