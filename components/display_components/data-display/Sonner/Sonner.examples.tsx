import React from 'react';
import { toast } from 'sonner';
import SonnerComponent from './Sonner';

// Example 1: Basic Toast
export const BasicToast = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Basic Toast</h3>
    <SonnerComponent message="Hello World!" />
  </div>
);

// Example 2: Toast with Description
export const ToastWithDescription = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Toast with Description</h3>
    <SonnerComponent
      message="Event has been created"
      description="Sunday, December 03, 2023 at 9:00 AM"
    />
  </div>
);

// Example 3: Toast with Action
export const ToastWithAction = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Toast with Action</h3>
    <SonnerComponent
      message="File deleted successfully"
      description="Your file has been moved to trash"
      action={{
        label: "Undo",
        onClick: () => toast.success("File restored!")
      }}
    />
  </div>
);

// Example 4: Toast Variants
export const ToastVariants = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Toast Variants</h3>
    <div className="flex flex-wrap gap-2">
      <SonnerComponent
        variant="default"
        message="Default toast"
      />
      <SonnerComponent
        variant="success"
        message="Success toast"
      />
      <SonnerComponent
        variant="error"
        message="Error toast"
      />
      <SonnerComponent
        variant="warning"
        message="Warning toast"
      />
      <SonnerComponent
        variant="info"
        message="Info toast"
      />
    </div>
  </div>
);

// Example 5: Custom Toast Functions
export const CustomToastFunctions = () => {
  const showLoadingToast = () => {
    const loadingToast = toast.loading('Uploading file...');
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('File uploaded successfully!');
    }, 2000);
  };

  const showPromiseToast = () => {
    const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.promise(promise, {
      loading: 'Loading...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data',
    });
  };

  const showCustomToast = () => {
    toast.custom((t) => (
      <div className="bg-white border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">👋</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            Custom toast message
          </p>
          <p className="text-sm text-gray-500">
            This is a completely custom toast
          </p>
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Custom Toast Functions</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={showLoadingToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Loading Toast
        </button>
        <button
          onClick={showPromiseToast}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          Promise Toast
        </button>
        <button
          onClick={showCustomToast}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Custom Toast
        </button>
      </div>
    </div>
  );
};

// Example 6: Toast Positions
export const ToastPositions = () => {
  const showPositionedToast = (position: any) => {
    toast('Positioned toast!', {
      position: position,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Toast Positions</h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => showPositionedToast('top-left')}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Top Left
        </button>
        <button
          onClick={() => showPositionedToast('top-center')}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Top Center
        </button>
        <button
          onClick={() => showPositionedToast('top-right')}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Top Right
        </button>
        <button
          onClick={() => showPositionedToast('bottom-left')}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Bottom Left
        </button>
        <button
          onClick={() => showPositionedToast('bottom-center')}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Bottom Center
        </button>
        <button
          onClick={() => showPositionedToast('bottom-right')}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Bottom Right
        </button>
      </div>
    </div>
  );
};

// Example 7: Form Feedback Toasts
export const FormFeedbackToasts = () => {
  const handleFormSubmit = (type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success('Form submitted successfully!', {
        description: 'Your data has been saved.',
        action: {
          label: 'View',
          onClick: () => console.log('View clicked'),
        },
      });
    } else {
      toast.error('Failed to submit form', {
        description: 'Please check your input and try again.',
        action: {
          label: 'Retry',
          onClick: () => console.log('Retry clicked'),
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Form Feedback</h3>
      <div className="flex gap-2">
        <button
          onClick={() => handleFormSubmit('success')}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Submit Success
        </button>
        <button
          onClick={() => handleFormSubmit('error')}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Submit Error
        </button>
      </div>
    </div>
  );
};

// Export all examples
export const examples = [
  {
    name: 'Basic Toast',
    component: BasicToast,
  },
  {
    name: 'Toast with Description',
    component: ToastWithDescription,
  },
  {
    name: 'Toast with Action',
    component: ToastWithAction,
  },
  {
    name: 'Toast Variants',
    component: ToastVariants,
  },
  {
    name: 'Custom Toast Functions',
    component: CustomToastFunctions,
  },
  {
    name: 'Toast Positions',
    component: ToastPositions,
  },
  {
    name: 'Form Feedback Toasts',
    component: FormFeedbackToasts,
  },
]; 