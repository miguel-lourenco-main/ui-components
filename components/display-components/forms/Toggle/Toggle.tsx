import React from 'react';
import { Toggle } from '@/components/ui/toggle';

export interface ToggleComponentProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode | (() => React.ReactNode);
  'aria-label'?: string;
}

const ToggleComponent: React.FC<ToggleComponentProps> = ({ 
  pressed,
  onPressedChange,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  children,
  'aria-label': ariaLabel,
}) => {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      variant={variant}
      size={size}
      className={className}
      aria-label={ariaLabel}
      data-testid="rendered-component-toggle"
    >
      {typeof children === 'function' ? (children as () => React.ReactNode)() : children}
    </Toggle>
  );
};

export default ToggleComponent; 