export type ComponentType =
  | "button"
  | "card"
  | "input"
  | "slider"
  | "switch"
  | "textarea"
  | "toggle"
  | "form"
  | "alert"
  | "badge"
  | "mixed"

export interface ComponentMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  props: ComponentProp[];
  tags: string[];
  version: string;
  author: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description: string;
  functionSignature?: {
    params: string;
    returnType: string;
  };
}

export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  theme: string;
  preview: React.ReactElement | null;
  code: string;
}

export interface ComponentInfo {
  meta: ComponentMeta;
  componentCode: string;
  variants: ComponentVariant[];
  themes: Record<string, string>;
}

export interface ComponentIndex {
  components: Array<{
    id: string;
    name: string;
    path: string;
  }>;
}
