import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode | (() => React.ReactNode);
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  disabled?: boolean;
  className?: string;
}

// Playground Example
function PlaygroundExample() {
  return (
    <div style={{ padding: '20px' }}>
      <Button
        variant="primary"
        size="lg"
        disabled={false}
        className=""
      >
        Click Me
      </Button>
    </div>
  );
}

export default function Button({
  variant = 'primary',
  size = 'sm',
  children,
  onClick,
  title,
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();
  
  return (
    <button
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      data-testid="rendered-component-button"
      title={title}
    >
      {typeof children === 'function' ? children() : children}
    </button>
  );
} 