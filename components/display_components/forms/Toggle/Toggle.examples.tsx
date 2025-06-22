import React, { useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import ToggleComponent from './Toggle';

// Example 1: Basic Toggle
export const BasicToggle = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Basic Toggle</h3>
    <ToggleComponent aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </ToggleComponent>
  </div>
);

// Example 2: Toggle with Text
export const ToggleWithText = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Toggle with Text</h3>
    <ToggleComponent aria-label="Toggle italic">
      <Italic className="h-4 w-4 mr-2" />
      Italic
    </ToggleComponent>
  </div>
);

// Example 3: Controlled Toggle
export const ControlledToggle = () => {
  const [isBold, setIsBold] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Controlled Toggle</h3>
      <div className="space-y-2">
        <ToggleComponent
          pressed={isBold}
          onPressedChange={setIsBold}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </ToggleComponent>
        <p className="text-sm text-muted-foreground">
          Bold is {isBold ? 'enabled' : 'disabled'}
        </p>
      </div>
    </div>
  );
};

// Example 4: Toggle Group (Text Formatting)
export const TextFormattingToggles = () => {
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const toggleFormat = (format: keyof typeof formatting) => {
    setFormatting(prev => ({ ...prev, [format]: !prev[format] }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Text Formatting</h3>
      <div className="flex gap-1">
        <ToggleComponent
          pressed={formatting.bold}
          onPressedChange={() => toggleFormat('bold')}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </ToggleComponent>
        <ToggleComponent
          pressed={formatting.italic}
          onPressedChange={() => toggleFormat('italic')}
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </ToggleComponent>
        <ToggleComponent
          pressed={formatting.underline}
          onPressedChange={() => toggleFormat('underline')}
          aria-label="Toggle underline"
        >
          <Underline className="h-4 w-4" />
        </ToggleComponent>
      </div>
      <div className="p-3 border rounded">
        <p className={`
          ${formatting.bold ? 'font-bold' : ''}
          ${formatting.italic ? 'italic' : ''}
          ${formatting.underline ? 'underline' : ''}
        `}>
          Sample text with formatting applied
        </p>
      </div>
    </div>
  );
};

// Example 5: Toggle Variants
export const ToggleVariants = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Toggle Variants</h3>
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <span className="text-sm w-20">Default:</span>
        <ToggleComponent variant="default" aria-label="Default toggle">
          <Bold className="h-4 w-4" />
        </ToggleComponent>
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm w-20">Outline:</span>
        <ToggleComponent variant="outline" aria-label="Outline toggle">
          <Italic className="h-4 w-4" />
        </ToggleComponent>
      </div>
    </div>
  </div>
);

// Example 6: Toggle Sizes
export const ToggleSizes = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Toggle Sizes</h3>
    <div className="flex gap-3 items-center">
      <ToggleComponent size="sm" aria-label="Small toggle">
        <Bold className="h-3 w-3" />
      </ToggleComponent>
      <ToggleComponent size="default" aria-label="Default toggle">
        <Bold className="h-4 w-4" />
      </ToggleComponent>
      <ToggleComponent size="lg" aria-label="Large toggle">
        <Bold className="h-5 w-5" />
      </ToggleComponent>
    </div>
  </div>
);

// Example 7: Alignment Toggles
export const AlignmentToggles = () => {
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Text Alignment</h3>
      <div className="flex gap-1">
        <ToggleComponent
          pressed={alignment === 'left'}
          onPressedChange={() => setAlignment('left')}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToggleComponent>
        <ToggleComponent
          pressed={alignment === 'center'}
          onPressedChange={() => setAlignment('center')}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToggleComponent>
        <ToggleComponent
          pressed={alignment === 'right'}
          onPressedChange={() => setAlignment('right')}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </ToggleComponent>
      </div>
      <div className="p-3 border rounded">
        <p className={`text-${alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left'}`}>
          This text is aligned to the {alignment}
        </p>
      </div>
    </div>
  );
};

// Example 8: Disabled Toggle
export const DisabledToggle = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Disabled Toggle</h3>
    <div className="flex gap-2">
      <ToggleComponent disabled aria-label="Disabled toggle">
        <Bold className="h-4 w-4" />
      </ToggleComponent>
      <ToggleComponent disabled pressed aria-label="Disabled pressed toggle">
        <Italic className="h-4 w-4" />
      </ToggleComponent>
    </div>
  </div>
);

// Export all examples
export const examples = [
  {
    name: 'Basic Toggle',
    component: BasicToggle,
  },
  {
    name: 'Toggle with Text',
    component: ToggleWithText,
  },
  {
    name: 'Controlled Toggle',
    component: ControlledToggle,
  },
  {
    name: 'Text Formatting Toggles',
    component: TextFormattingToggles,
  },
  {
    name: 'Toggle Variants',
    component: ToggleVariants,
  },
  {
    name: 'Toggle Sizes',
    component: ToggleSizes,
  },
  {
    name: 'Alignment Toggles',
    component: AlignmentToggles,
  },
  {
    name: 'Disabled Toggle',
    component: DisabledToggle,
  },
]; 