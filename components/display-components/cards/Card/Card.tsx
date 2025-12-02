import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  header?: () => React.ReactNode;
  footer?: () => React.ReactNode;
}

export default function Card({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'md',
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  rounded = 'md',
  header,
  footer
}: CardProps) {
  const baseStyles = 'transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-card',
    outlined: 'bg-card',
    elevated: 'bg-card',
    flat: 'bg-muted'
  };
  
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const paddingStyles = {
    none: 'p-0',
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
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg'
  };

  const borderStyles = border ? 'border border-border' : '';
  const variantBorderStyles = variant === 'outlined' ? 'border-2' : '';
  
  // Use padding prop if provided, otherwise fall back to size
  const paddingClass = paddingStyles[padding] || sizeStyles[size];
  
  // Apply shadow class based on shadow prop
  const shadowClass = shadowStyles[shadow];
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingClass} ${shadowClass} ${borderStyles} ${variantBorderStyles} ${roundedStyles[rounded]} ${className}`.trim();
  
  const headerContent = header?.();
  const footerContent = footer?.();
  
  return (
    <div className={combinedClassName} data-testid="rendered-component-card">
      {headerContent && (
        <div className="mb-4">
          {headerContent}
        </div>
      )}
      {(title || subtitle) && !headerContent && (
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
      {footerContent && (
        <div className="mt-4">
          {footerContent}
        </div>
      )}
    </div>
  );
} 