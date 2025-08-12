import { Plus } from "lucide-react";

import { FileHandlers, TrackableFile } from "@/lib/interfaces";
import TooltipComponent from "@/components/ui/tooltip-component";
import { Trash2 } from "lucide-react";
import { FileInputButton } from "./files-input-button";
import { Button } from "@/components/ui/button";


// Mapping of MIME types to their corresponding file extensions for supported file formats
export const FILE_SUPPORTED_TYPES = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
}
// Comma-separated string of supported file extensions
export const FILE_SUPPORTED_TYPES_VALUES_STRING = Object.values(FILE_SUPPORTED_TYPES).flat().join(",")
/**
 * FileActionsBar Component
 * Renders the top action bar containing delete all and add files buttons
 */
export const FileActionsBar = ({ 
    files, 
    disabled, 
    handlers 
}: { 
    files: TrackableFile[], 
    disabled?: boolean, 
    handlers: Pick<FileHandlers, 'handleDeleteAll' | 'handleAddFiles'> 
}) => {
    return (
        <div className="flex items-end justify-between px-2">
            <div className="flex items-center gap-x-3">
                {/* Delete all files button with tooltip */}
                <Button
                    type="button"
                    onClick={handlers.handleDeleteAll}
                    disabled={files.length === 0 || disabled}
                    className="transition-opacity duration-400 ease-in-out"
                    style={{ opacity: files.length === 0 ? 0.5 : 1 }}
                >
                    <TooltipComponent 
                        trigger={<Trash2 className="size-8 p-1.5" />} 
                        content="Delete all files" 
                    />
                </Button>
                {/* Add files button with tooltip */}
                <FileInputButton
                    content={(handleFileUpload: () => void) => (
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="fit" 
                            onClick={handleFileUpload}
                            disabled={disabled}
                        >
                            <TooltipComponent 
                                trigger={<Plus className="size-8 p-1.5"/>} 
                                content="Add files"
                            />
                        </Button>
                    )}
                    acceptsTypes={FILE_SUPPORTED_TYPES_VALUES_STRING}
                    addDroppedFiles={(files: File[]) => handlers.handleAddFiles(files.map(file => ({fileObject: file})))}
                />
            </div>
            {/* File count display */}
            <span className="whitespace-nowrap text-sm text-muted-foreground">
                {`${files.length} ${files.length === 1 ? 'file' : 'files'} added`}
            </span>
        </div>
    );
};