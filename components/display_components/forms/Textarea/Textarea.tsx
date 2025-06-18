import React from 'react';
import { Textarea } from '@/components/ui/textarea';

export interface TextareaComponentProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const TextareaComponent: React.FC<TextareaComponentProps> = ({ 
  label,
  helperText,
  error,
  id,
  className,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <Textarea
        id={textareaId}
        className={className}
        {...props}
      />
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextareaComponent; 