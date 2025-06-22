import React, { useState } from 'react';
import TextareaComponent from './Textarea';

// Example 1: Basic Textarea
export const BasicTextarea = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Basic Textarea</h3>
    <TextareaComponent placeholder="Type your message here..." />
  </div>
);

// Example 2: Textarea with Label
export const TextareaWithLabel = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Textarea with Label</h3>
    <TextareaComponent
      label="Your message"
      placeholder="Type your message here..."
    />
  </div>
);

// Example 3: Textarea with Helper Text
export const TextareaWithHelperText = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Textarea with Helper Text</h3>
    <TextareaComponent
      label="Bio"
      placeholder="Tell us about yourself..."
      helperText="Your bio will be displayed on your public profile."
    />
  </div>
);

// Example 4: Controlled Textarea with Character Count
export const ControlledTextarea = () => {
  const [value, setValue] = useState('');
  const maxLength = 200;

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Controlled Textarea</h3>
      <div className="space-y-2">
        <TextareaComponent
          label="Description"
          placeholder="Enter description..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Character count</span>
          <span>{value.length}/{maxLength}</span>
        </div>
      </div>
    </div>
  );
};

// Example 5: Textarea with Error
export const TextareaWithError = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (newValue.length < 10) {
      setError('Message must be at least 10 characters long');
    } else {
      setError('');
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Textarea with Validation</h3>
      <TextareaComponent
        label="Feedback"
        placeholder="Please provide your feedback..."
        value={value}
        onChange={handleChange}
        error={error}
        helperText={!error ? "Minimum 10 characters required" : undefined}
      />
    </div>
  );
};

// Example 6: Disabled Textarea
export const DisabledTextarea = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Disabled Textarea</h3>
    <TextareaComponent
      label="Comments"
      placeholder="Comments are disabled"
      disabled
      value="This textarea is disabled"
    />
  </div>
);

// Example 7: Resizable Textarea
export const ResizableTextarea = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Resizable Textarea</h3>
    <TextareaComponent
      label="Notes"
      placeholder="Write your notes here..."
      className="resize-y min-h-[100px]"
      rows={4}
    />
  </div>
);

// Example 8: Form Integration
export const TextareaForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    feedback: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted! Check console for data.');
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Form Integration</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextareaComponent
          label="Project Description"
          placeholder="Describe your project..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          helperText="Provide a detailed description of your project"
        />
        <TextareaComponent
          label="Additional Feedback"
          placeholder="Any additional comments..."
          value={formData.feedback}
          onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
          rows={3}
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

// Export all examples
export const examples = [
  {
    name: 'Basic Textarea',
    component: BasicTextarea,
  },
  {
    name: 'Textarea with Label',
    component: TextareaWithLabel,
  },
  {
    name: 'Textarea with Helper Text',
    component: TextareaWithHelperText,
  },
  {
    name: 'Controlled Textarea',
    component: ControlledTextarea,
  },
  {
    name: 'Textarea with Error',
    component: TextareaWithError,
  },
  {
    name: 'Disabled Textarea',
    component: DisabledTextarea,
  },
  {
    name: 'Resizable Textarea',
    component: ResizableTextarea,
  },
  {
    name: 'Form Integration',
    component: TextareaForm,
  },
]; 