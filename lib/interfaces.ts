import { LucideIcon } from "lucide-react";

export interface TrackableFile {
    /** Original File object */
    fileObject: File;
    /** Optional unique identifier for tracking */
    id?: string;
    /** Current status of the file in the upload process */
    uploadingStatus?: "uploading" | "uploaded" | "client" | "error";
}

export interface TabData {
    /** React element to be used as the tab's icon */
    icon: JSX.Element;
    /** File path or identifier */
    file: string;
    /** Original and translated file pairs */
    exampleFiles: {
        original: File | null;
        translated: File | null;
    };
}

/**
 * Interface defining the core file operation handlers
 */
export interface FileHandlers {
    handleDeleteAll: () => void;
    handleAddFiles: (newFiles: TrackableFile[]) => void;
    handleFileRemove: (filteredFiles: TrackableFile[]) => void;
}

export interface Filter {
    id: string;
    title?: string;
    options: {
        value: string;
        label: string;
        icon?: LucideIcon;
    }[];
}