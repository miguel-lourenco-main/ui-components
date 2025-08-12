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

export interface Component {
  id: string;
  name: string;
  description: string;
  props: PropDefinition[];
  code: string;
  examples: ComponentExample[];
  dependencies?: string[];
  tags?: string[];
  version?: string;
  author?: string;
}

export interface PropDefinition {
  name: string;
  type: PropType;
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: string[] | number[]; // For enum/select types
  // Function signature information (only used when type === 'function')
  functionSignature?: {
    params: string;
    returnType: string;
  };
}

// New interface for function prop storage
export interface FunctionPropValue {
  type: 'function';
  source: string; // The actual function body as string
  signature?: {
    params: string;
    returnType: string;
  };
}

export type PropType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'select'
  | 'array'
  | 'object'
  | 'color'
  | 'function';

export interface ComponentExample {
  name: string;
  description?: string;
  props: Record<string, any>;
  code?: string;
}

export interface ComponentManifest {
  version: string;
  components: Component[];
}

export interface GitLabConfig {
  token: string;
  projectId: string;
  baseUrl: string;
  repoPath: string;
  manifestPath: string;
}

export interface PlaygroundState {
  selectedComponent: Component | null;
  currentProps: Record<string, any>;
  currentCode: string;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showProps: boolean;
  showCode: boolean;
  searchQuery: string;
}

// Local component types
export interface FullComponentInfo extends ComponentInfo {
  preview: string;
}

export interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  props: PropDefinition[];
  tags?: string[];
  version?: string;
  author?: string;
}

export interface ComponentDiscoveryResult {
  components: FullComponentInfo[];
  errors: ComponentDiscoveryError[];
}

export interface ComponentDiscoveryError {
  filePath: string;
  error: string;
  type: 'metadata' | 'component' | 'examples';
}

export interface FullComponentInfo extends ComponentInfo {
  examples: ComponentExample[];
}

export interface LocalPlaygroundState extends Omit<PlaygroundState, 'selectedComponent'> {
  selectedComponent: FullComponentInfo | null;
} 