export interface Component {
  id: string;
  name: string;
  category: 'form' | 'layout';
  description: string;
  props: PropDefinition[];
  code: string;
  examples: ComponentExample[];
  dependencies?: string[];
  tags?: string[];
  version?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropDefinition {
  name: string;
  type: PropType;
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: string[] | number[]; // For enum/select types
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
  categories: ComponentCategory[];
  lastUpdated: string;
}

export interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
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
  selectedCategory: string | null;
}

export interface ComponentError {
  message: string;
  stack?: string;
  componentName?: string;
}

export interface GitLabFile {
  id: string;
  name: string;
  path: string;
  content: string;
  encoding?: string;
} 

// Local component types
export interface LocalComponent extends Component {
  filePath: string;
  metaPath: string;
  examplesPath?: string;
  lastModified: Date;
  isLocal: true;
}

export interface LocalComponentMetadata {
  id: string;
  name: string;
  category: 'form' | 'layout';
  description: string;
  props: PropDefinition[];
  tags?: string[];
  version?: string;
  author?: string;
}

export interface ComponentDiscoveryResult {
  components: LocalComponent[];
  errors: ComponentDiscoveryError[];
}

export interface ComponentDiscoveryError {
  filePath: string;
  error: string;
  type: 'metadata' | 'component' | 'examples';
}

export interface ComponentCompilationResult {
  success: boolean;
  component?: React.ComponentType<any>;
  error?: string;
  exports?: Record<string, any>;
}

export interface LocalPlaygroundState extends Omit<PlaygroundState, 'selectedComponent'> {
  selectedComponent: LocalComponent | null;
  compiledComponent: React.ComponentType<any> | null;
  compileErrors: string[];
  isCompiling: boolean;
} 