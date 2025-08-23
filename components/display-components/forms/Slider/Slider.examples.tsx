import type { ComponentExample } from '@/lib/interfaces';
import Slider from './Slider';

// Unified preview components
export const SmallPreview = () => (
  <div className="w-16">
    <Slider defaultValue={[50]} min={0} max={100} step={1} />
  </div>
)

export const MediumPreview = () => (
  <div className="w-[220px]">
    <Slider defaultValue={[50]} min={0} max={100} step={1} />
  </div>
)

// Variants aligned to Button/Card structure
export const sliderVariants = [
  {
    id: 'default',
    name: 'Default Slider',
    description: 'Default slider with single value',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md">
        <Slider defaultValue={[50]} min={0} max={100} step={1} value={[50]} />
      </div>
    ),
    code: `<Slider defaultValue={[50]} min={0} max={100} step={1} value={[50]} />`,
  },
  {
    id: 'stepped',
    name: 'Stepped',
    description: 'Step of 10',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md">
        <Slider defaultValue={[20]} min={0} max={100} step={10} />
      </div>
    ),
    code: `<Slider defaultValue={[20]} min={0} max={100} step={10} />`,
  },
  {
    id: 'disabled',
    name: 'Disabled',
    description: 'Non-interactive slider',
    theme: 'minimal',
    preview: (
      <div className="w-full max-w-md">
        <Slider defaultValue={[60]} disabled />
      </div>
    ),
    code: `<Slider defaultValue={[60]} disabled />`,
  },
];

export const sliderThemes = {
  minimal: 'bg-gray-100 text-gray-700 border-gray-200',
  modern: 'bg-blue-100 text-blue-700 border-blue-200',
};

// Keep prop-based examples for playground compatibility
export const sliderExamples: ComponentExample[] = [
  {
    name: 'Default',
    description: 'Default slider with single value',
    props: { defaultValue: [50], min: 0, max: 100, step: 1 },
  },
  {
    name: 'Stepped',
    description: 'Step of 10',
    props: { defaultValue: [20], step: 10, min: 0, max: 100 },
  },
  {
    name: 'Disabled',
    description: 'Non-interactive slider',
    props: { defaultValue: [60], disabled: true },
  },
];