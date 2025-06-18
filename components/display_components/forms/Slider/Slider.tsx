import React from 'react';
import { Slider } from '@/components/ui/slider';

export interface SliderComponentProps {
  defaultValue?: number[];
  max?: number;
  min?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

const SliderComponent: React.FC<SliderComponentProps> = ({ 
  defaultValue = [50],
  max = 100,
  min = 0,
  step = 1,
  value,
  onValueChange,
  className,
  disabled = false
}) => {
  return (
    <Slider
      defaultValue={defaultValue}
      max={max}
      min={min}
      step={step}
      value={value}
      onValueChange={onValueChange}
      className={className}
      disabled={disabled}
    />
  );
};

export default SliderComponent; 