import { ComponentExample } from '@/types';

export const buttonExamples: ComponentExample[] = [
  {
    name: "Primary Button",
    description: "Standard primary button for main actions",
    props: {
      variant: "primary",
      size: "md",
      children: "Click me"
    }
  },
  {
    name: "Secondary Button", 
    description: "Secondary button for less prominent actions",
    props: {
      variant: "secondary",
      size: "md", 
      children: "Secondary action"
    }
  },
  {
    name: "Outline Button",
    description: "Outlined button with transparent background",
    props: {
      variant: "outline",
      size: "md",
      children: "Outline style"
    }
  },
  {
    name: "Ghost Button",
    description: "Minimal button with no background",
    props: {
      variant: "ghost",
      size: "md",
      children: "Ghost style"
    }
  },
  {
    name: "Small Button",
    description: "Compact button for tight spaces",
    props: {
      variant: "primary",
      size: "sm",
      children: "Small"
    }
  },
  {
    name: "Large Button",
    description: "Large button for emphasis",
    props: {
      variant: "primary", 
      size: "lg",
      children: "Large Button"
    }
  },
  {
    name: "Disabled Button",
    description: "Button in disabled state",
    props: {
      variant: "primary",
      size: "md",
      children: "Disabled",
      disabled: true
    }
  }
]; 