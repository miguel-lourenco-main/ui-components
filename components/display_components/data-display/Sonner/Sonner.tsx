import React from 'react';
import { toast } from 'sonner';

export interface SonnerComponentProps {
  message?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

const SonnerComponent: React.FC<SonnerComponentProps> = ({ 
  message = "Event has been created",
  description,
  action,
  variant = 'default'
}) => {
  const showToast = () => {
    const options: any = {};
    
    if (description) {
      options.description = description;
    }
    
    if (action) {
      options.action = action;
    }

    switch (variant) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  return (
    <button
      onClick={showToast}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      data-testid="rendered-component-sonner"
    >
      Show Toast
    </button>
  );
};

export default SonnerComponent; 