import React from 'react';
import { Switch } from '@/components/ui/switch';

export interface SwitchComponentProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  label?: string;
}

const SwitchComponent: React.FC<SwitchComponentProps> = ({ 
  checked,
  onCheckedChange,
  disabled = false,
  id,
  className,
  label
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={className}
        data-testid="rendered-component-switch"
      />
      {label && (
        <label 
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default SwitchComponent; 