
import indexJsonInfo from '@/components/display-components/index.json';
import { FullComponentInfo } from './interfaces';
import { ComponentMetadata } from './types';

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
      props: (meta as any).props || [],
      tags: meta.tags || [],
      version: meta.version || '1.0.0',
      author: meta.author || 'Unknown',
      preview: component.id,
    } as FullComponentInfo;
  });
};

export const COMPONENTS_INDEX: FullComponentInfo[] = getComponentsIndex();

export default getComponentsIndex;
