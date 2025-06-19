import React from 'react';
import { Progress } from '@/components/ui/progress';

export interface ProgressComponentProps {
  value?: number;
  className?: string;
}

const ProgressComponent: React.FC<ProgressComponentProps> = ({ 
  value = 50, 
  className 
}) => {
  return (
    <Progress 
      value={value} 
      className={className}
      data-testid="rendered-component-progress"
    />
  );
};

export default ProgressComponent; 