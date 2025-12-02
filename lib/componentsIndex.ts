
import indexJsonInfo from '@/components/display-components/index.json';
import { FullComponentInfo } from './interfaces';
import { ComponentMetadata } from './types';

// Normalize meta prop types (e.g., "number[]", "React.ReactNode") to internal PropType
// values used by the PropsPanel.
function normalizePropType(type: string) {
  if (!type) return 'string';

  const normalized = typeof type === 'string' ? type.trim() : String(type);
  const lower = normalized.toLowerCase();

  // Treat any array-like meta type as an array so the PropsPanel renders a JSON editor
  if (normalized.endsWith('[]')) return 'array';

  // Map React node-like meta types to our internal "component" PropType so they
  // get the dedicated JSX/Monaco-based editor (ComponentPropEditor).
  if (
    lower === 'react.reactnode' ||
    lower === 'reactnode' ||
    lower === 'react.element' ||
    lower === 'jsx.element' ||
    lower.includes('react.reactnode') ||
    lower.includes('reactnode') ||
    lower.includes('react.element') ||
    lower.includes('jsx.element')
  ) {
    return 'component';
  }

  // Preserve any explicit internal PropType strings ("string", "number", "component", etc.)
  return normalized;
}

const getComponentsIndex = (): FullComponentInfo[] => {
  const info = indexJsonInfo.components.filter((component) => !indexJsonInfo.blacklist.includes(component.id));

  return info.map((component) => {
    // Normalize path from index.json (e.g. "./buttons/Button/" → "buttons/Button")
    const normalizedPath = component.path.replace(/^\.\/+/, '').replace(/\/+$/, '');
    let meta: ComponentMetadata;
    try {
      meta = require(`@/components/display-components/${normalizedPath}/${component.name}.meta.json`);
    } catch (err) {
      console.warn(`Failed to load meta for ${component.name} from ${normalizedPath}:`, err);
      meta = {
        id: component.id,
        name: component.name,
        description: '',
        props: [],
        tags: [],
        version: '1.0.0',
        author: 'Unknown',
        category: 'mixed'
      } as unknown as ComponentMetadata;
    }

    return {
      id: component.id,
      name: component.name,
      description: meta.description || '',
      props: (meta as any).props
        ? (meta as any).props.map((p: any) => ({ ...p, type: normalizePropType(p.type) }))
        : [],
      tags: meta.tags || [],
      version: meta.version || '1.0.0',
      author: meta.author || 'Unknown',
      preview: component.id,
    } as FullComponentInfo;
  });
};

export const COMPONENTS_INDEX: FullComponentInfo[] = getComponentsIndex();

export default getComponentsIndex;
