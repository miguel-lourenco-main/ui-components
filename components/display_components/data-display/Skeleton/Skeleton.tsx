import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface SkeletonComponentProps {
  className?: string;
}

const SkeletonComponent: React.FC<SkeletonComponentProps> = ({ 
  className,
}) => {
  return (
    <Skeleton className={className} data-testid="rendered-component-skeleton"/>
  );
};

export default SkeletonComponent; 