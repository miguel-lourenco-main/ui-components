'use client'

import { useState, ReactNode } from 'react';
import DialogLayout from "@/components/ui/layouts/dialog-layout";
import PDFCompare from './pdf-compare';

/**
 * PDFViewerDialog Component
 * A modal dialog for comparing two PDF files side by side
 * 
 * Features:
 * - Supports both controlled and uncontrolled dialog state
 * - Customizable content through children prop
 * - Handles loading states for both input and output files
 */
export default function PDFViewerDialog({
    inputFile,
    outputFile,
    type,
    externalOpen,
    externalSetOpen,
    trigger,
    title,
    description,
    isInputFileLoading,
    isOutputFileLoading,
    children
}: {
    inputFile: File | null;              // Original PDF file
    outputFile: File | null;             // Comparison PDF file
    type?: string;                       // PDF type identifier
    externalOpen: boolean;               // External control for dialog open state
    externalSetOpen: (open: boolean) => void;  // External handler for dialog state
    trigger: ReactNode;                  // Element that triggers the dialog
    title: string;                       // Dialog title
    description: string;                 // Dialog description
    isInputFileLoading: boolean;         // Loading state for input file
    isOutputFileLoading: boolean;        // Loading state for output file
    children?: ReactNode;                // Optional custom content
}) {
    // Internal state for uncontrolled usage
    const [isInternalDialogOpen, setIsInternalDialogOpen] = useState(false)

    // Use external or internal state based on props
    const isDialogOpen = externalOpen || isInternalDialogOpen
    const setDialogOpen = externalSetOpen || setIsInternalDialogOpen

    return (
        <DialogLayout
            trigger={() => trigger}
            title={title}
            description={description}
            contentClassName="flex flex-col h-[90vh] w-[90vw] max-w-[100rem]"
            onOpen={() => {
                setDialogOpen(true)
            }}
            externalOpen={isDialogOpen}
            externalSetOpen={setDialogOpen}
        >
            {/* Render custom content or default PDF comparison view */}
            {children ? 
                children : 
                <PDFCompare
                    inputFile={inputFile}
                    outputFile={outputFile}
                    type={type}
                    isInputFileLoading={isInputFileLoading}
                    isOutputFileLoading={isOutputFileLoading}
                />
            }
        </DialogLayout>
    );
}