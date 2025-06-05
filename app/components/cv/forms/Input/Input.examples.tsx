import { ComponentExample } from '@/types';

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