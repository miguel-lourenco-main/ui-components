import type { ComponentExample } from '@/lib/interfaces';
import Switch from './Switch';

// Unified preview components
export const SmallPreview = () => (
  <div className="w-14 flex items-center justify-center">
    <Switch checked={false} />
  </div>
)

export const MediumPreview = () => (
  <div className="w-[220px]">
    <Switch checked label="Enable feature" />
  </div>
)

// Variants aligned to Button/Card structure
export const switchVariants = [
  {
    id: 'default',
    name: 'Default',
    description: 'Unchecked switch with label',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md">
        <Switch checked={false} label="Enable feature" />
      </div>
    ),
    code: `<Switch checked={false} label="Enable feature" />`,
  },
  {
    id: 'checked',
    name: 'Checked',
    description: 'Checked state',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md">
        <Switch checked label="Enable feature" />
      </div>
    ),
    code: `<Switch checked label="Enable feature" />`,
  },
  {
    id: 'disabled',
    name: 'Disabled',
    description: 'Disabled switch',
    theme: 'minimal',
    preview: (
      <div className="w-full max-w-md">
        <Switch checked disabled label="Disabled setting" />
      </div>
    ),
    code: `<Switch checked disabled label="Disabled setting" />`,
  },
];

export const switchThemes = {
  minimal: 'bg-gray-100 text-gray-700 border-gray-200',
  modern: 'bg-blue-100 text-blue-700 border-blue-200',
};

// Keep prop-based examples for playground compatibility
export const switchExamples: ComponentExample[] = [
  { name: 'Unchecked', description: 'Default unchecked switch', props: { checked: false, label: 'Enable feature' } },
  { name: 'Checked', description: 'Checked state', props: { checked: true, label: 'Enable feature' } },
  { name: 'Disabled', description: 'Disabled switch', props: { checked: true, disabled: true, label: 'Disabled setting' } },
];