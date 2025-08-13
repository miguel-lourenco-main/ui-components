import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils'

/**
 * DialogLayout Component
 * A reusable dialog/modal component that supports both controlled and uncontrolled states,
 * with optional tooltip, header, footer, and custom content.
 * 
 * @component
 */
interface DialogLayoutProps {
    trigger?: () => React.ReactNode;
    children: React.ReactNode;
    title?: string;
    description?: string;
    contentClassName?: string;
    externalOpen?: boolean;
    externalSetOpen?: (open: boolean) => void;
    onOpen?: () => void;
    reset?: () => void;
}

export default function DialogLayout({
    trigger,
    children,
    title,
    description,
    contentClassName,
    externalOpen,
    externalSetOpen,
    reset,
    onOpen
}: DialogLayoutProps) {


    // Internal state for uncontrolled usage
    const [internalOpen, setInternalOpen] = React.useState(false);

    // Determine if dialog is controlled externally
    const isControlled = externalOpen !== undefined && externalSetOpen !== undefined;
    const isOpen = isControlled ? externalOpen : internalOpen;

    /**
     * Handles dialog open state changes
     * Manages both controlled and uncontrolled states
     * Triggers appropriate callbacks (onOpen, reset)
     */
    const handleOpenChange = React.useCallback((open: boolean) => {
    if (isControlled) {
        externalSetOpen(open);
    } else {
        setInternalOpen(open);
    }
    if (open) {
        onOpen?.();
    } else {
        reset?.();
    }
    }, [isControlled, externalSetOpen, onOpen, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger()}
                </DialogTrigger>
            )}
            <DialogContent 
                className={cn("flex flex-col max-h-[90vh]", contentClassName)}
                onInteractOutside={(event) => event.preventDefault()}
            >
                {(title ?? description) && (
                    <div className="flex-shrink-0 mb-4">
                        <DialogHeader>
                            <DialogTitle>{title ?? ''}</DialogTitle>
                            <DialogDescription>{description ?? ''}</DialogDescription>
                        </DialogHeader>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto scrollbar-hide pb-4 p-1">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}