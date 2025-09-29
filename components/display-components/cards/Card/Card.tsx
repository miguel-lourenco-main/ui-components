import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Card({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'md',
  className = ''
}: CardProps) {
  const baseStyles = 'rounded-lg transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-card border border-border shadow-sm',
    outlined: 'bg-card border-2 border-border',
    elevated: 'bg-card shadow-lg border border-border',
    flat: 'bg-muted'
  };
  
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();
  
  return (
    <div className={combinedClassName} data-testid="rendered-component-card">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-card-foreground mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
} 