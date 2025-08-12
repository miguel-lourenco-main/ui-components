import { ComponentExample } from '@/lib/interfaces';
import Input from './Input';

// Unified preview components
export const SmallPreview = () => (
  <div className="scale-50">
    <div className="bg-transparent flex flex-col items-center gap-y-2 justify-center w-32 scale-90">
      <span className="text-xl self-start text-muted-foreground">Name</span>
      <Input type="text" placeholder="" className="w-full border-4" />
    </div>
  </div>
)

export const MediumPreview = () => (
  <div className="w-full max-w-[220px] space-y-2">
    <Input type="text" label="Email" placeholder="you@example.com" />
  </div>
)

// Variants aligned to Button/Card structure
export const inputVariants = [
  {
    id: 'default',
    name: 'Default Input',
    description: 'Standard text input with label',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md">
        <Input type="text" label="Name" placeholder="Enter your name..." />
      </div>
    ),
    code: `<Input type="text" label="Name" placeholder="Enter your name..." />`,
  },
  {
    id: 'states',
    name: 'Validation States',
    description: 'Error and success variants',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md space-y-4">
        <Input type="email" label="Email" placeholder="email@example.com" variant="error" errorMessage="Please enter a valid email address" />
        <Input type="text" label="Username" defaultValue="john_doe" variant="success" />
      </div>
    ),
    code: `<Input type="email" label="Email" placeholder="email@example.com" variant="error" errorMessage="Please enter a valid email address" />\n<Input type="text" label="Username" defaultValue="john_doe" variant="success" />`,
  },
  {
    id: 'sizes',
    name: 'Sizes',
    description: 'Small, medium and large sizes',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md space-y-4">
        <Input type="text" label="Compact" placeholder="Small input" size="sm" />
        <Input type="text" label="Default" placeholder="Medium input" size="md" />
        <Input type="text" label="Large Input" placeholder="Large input field" size="lg" />
      </div>
    ),
    code: `<Input label="Compact" placeholder="Small input" size="sm" />\n<Input label="Default" placeholder="Medium input" size="md" />\n<Input label="Large Input" placeholder="Large input field" size="lg" />`,
  },
  {
    id: 'helper-and-disabled',
    name: 'Helper & Disabled',
    description: 'Helper text guidance and disabled state',
    theme: 'minimal',
    preview: (
      <div className="w-full max-w-md space-y-4">
        <Input type="text" label="Username" placeholder="Enter username" helperText="Must be at least 3 characters long" />
        <Input type="text" label="Disabled Field" defaultValue="Read only value" disabled placeholder="Cannot edit" />
      </div>
    ),
    code: `<Input label="Username" placeholder="Enter username" helperText="Must be at least 3 characters long" />\n<Input label="Disabled Field" defaultValue="Read only value" disabled placeholder="Cannot edit" />`,
  },
  {
    id: 'number',
    name: 'Number Input',
    description: 'Numeric input with helper text',
    theme: 'modern',
    preview: (
      <div className="w-full max-w-md">
        <Input type="number" label="Amount" placeholder="Enter amount" helperText="Enter a numeric value" />
      </div>
    ),
    code: `<Input type="number" label="Amount" placeholder="Enter amount" helperText="Enter a numeric value" />`,
  },
];

export const inputThemes = {
  minimal: 'bg-gray-100 text-gray-700 border-gray-200',
  modern: 'bg-blue-100 text-blue-700 border-blue-200',
  validation: 'bg-green-100 text-green-700 border-green-200',
};

export const inputExamples: ComponentExample[] = [
  {
    name: "Basic Input",
    description: "Simple text input with placeholder",
    props: {
      type: "text",
      placeholder: "Enter your name...",
      label: "Name"
    }
  },
  {
    name: "Email Input",
    description: "Email input with validation type",
    props: {
      type: "email",
      placeholder: "john@example.com",
      label: "Email Address",
      required: true
    }
  },
  {
    name: "Password Input",
    description: "Password input field",
    props: {
      type: "password",
      placeholder: "Enter password",
      label: "Password",
      required: true
    }
  },
  {
    name: "Input with Helper Text",
    description: "Input with helpful guidance text",
    props: {
      type: "text",
      placeholder: "Enter username",
      label: "Username",
      helperText: "Must be at least 3 characters long"
    }
  },
  {
    name: "Error State",
    description: "Input in error state with error message",
    props: {
      type: "email",
      placeholder: "email@example.com",
      label: "Email",
      variant: "error",
      errorMessage: "Please enter a valid email address"
    }
  },
  {
    name: "Success State",
    description: "Input in success state",
    props: {
      type: "text",
      placeholder: "Username",
      label: "Username",
      variant: "success",
      defaultValue: "john_doe"
    }
  },
  {
    name: "Small Input",
    description: "Compact input for tight spaces",
    props: {
      type: "text",
      placeholder: "Small input",
      label: "Compact",
      size: "sm"
    }
  },
  {
    name: "Large Input",
    description: "Large input for emphasis",
    props: {
      type: "text",
      placeholder: "Large input field",
      label: "Large Input",
      size: "lg"
    }
  },
  {
    name: "Disabled Input",
    description: "Input in disabled state",
    props: {
      type: "text",
      placeholder: "Cannot edit",
      label: "Disabled Field",
      disabled: true,
      defaultValue: "Read only value"
    }
  },
  {
    name: "Number Input",
    description: "Numeric input field",
    props: {
      type: "number",
      placeholder: "Enter amount",
      label: "Amount",
      helperText: "Enter a numeric value"
    }
  }
]; 