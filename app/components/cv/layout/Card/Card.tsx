import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  rounded = 'md',
  header,
  footer
}: CardProps) {
  const baseStyles = 'bg-white';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  const roundedStyles = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl'
  };
  
  const borderStyle = border ? 'border border-gray-200' : '';
  
  const cardClassName = `${baseStyles} ${shadowStyles[shadow]} ${roundedStyles[rounded]} ${borderStyle} ${className}`.trim();
  
  const contentPadding = header || footer ? 'none' : padding;
  const headerFooterPadding = paddingStyles[padding];
  const bodyPadding = paddingStyles[contentPadding];
  
  return (
    <div className={cardClassName}>
      {header && (
        <div className={`border-b border-gray-200 ${headerFooterPadding}`}>
          {header}
        </div>
      )}
      
      <div className={header || footer ? headerFooterPadding : bodyPadding}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-200 ${headerFooterPadding}`}>
          {footer}
        </div>
      )}
    </div>
  );
} 