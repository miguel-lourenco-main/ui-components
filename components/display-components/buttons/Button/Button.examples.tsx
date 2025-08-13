import Button from "./Button"
import type { ComponentExample } from "@/lib/interfaces"
import { Download, Heart, ShoppingCart, ArrowRight, Plus } from "lucide-react"

export const buttonVariants = [
  {
    id: "preview-small",
    name: "Single Button",
    description: "Single button with no variants",
    theme: "modern",
    preview: (
      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
      </div>
    ),
    code: `<Button>Primary</Button>
    `,
  },
  {
    id: "default style",
    name: "Default Style",
    description: "Clean and modern button design",
    theme: "modern",
    preview: (
      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    ),
    code: `<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>`,
  },
  {
    id: "rounded",
    name: "Rounded Style",
    description: "Buttons with increased border radius",
    theme: "rounded",
    preview: (
      <div className="flex flex-wrap gap-3">
        <Button className="rounded-full">Primary</Button>
        <Button variant="secondary" className="rounded-full">
          Secondary
        </Button>
        <Button variant="outline" className="rounded-full bg-transparent">
          Outline
        </Button>
        <Button variant="ghost" className="rounded-full">
          Ghost
        </Button>
      </div>
    ),
    code: `<Button className="rounded-full">Primary</Button>
<Button variant="secondary" className="rounded-full">Secondary</Button>
<Button variant="outline" className="rounded-full bg-transparent">Outline</Button>
<Button variant="ghost" className="rounded-full">Ghost</Button>`,
  },
  {
    id: "gradient",
    name: "Gradient Style",
    description: "Eye-catching gradient backgrounds",
    theme: "gradient",
    preview: (
      <div className="flex flex-wrap gap-3">
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          Gradient
        </Button>
        <Button className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600">
          Success
        </Button>
        <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
          Accent
        </Button>
      </div>
    ),
    code: `<Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
  Gradient
</Button>
<Button className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600">
  Success
</Button>
<Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
  Accent
</Button>`,
  },
  {
    id: "minimal",
    name: "Minimal Style",
    description: "Clean and understated design",
    theme: "minimal",
    preview: (
      <div className="flex flex-wrap gap-3">
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">Primary</Button>
        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
          Secondary
        </Button>
        <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          Ghost
        </Button>
      </div>
    ),
    code: `<Button className="bg-gray-900 hover:bg-gray-800 text-white">Primary</Button>
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">Secondary</Button>
<Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">Ghost</Button>`,
  },
  {
    id: "with-icons",
    name: "With Icons",
    description: "Buttons enhanced with icons",
    theme: "modern",
    preview: (
      <div className="flex flex-wrap gap-3">
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="secondary">
          <Heart className="mr-2 h-4 w-4" />
          Like
        </Button>
        <Button variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button variant="ghost">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    code: `<Button>
  <Download className="mr-2 h-4 w-4" />
  Download
</Button>
<Button variant="secondary">
  <Heart className="mr-2 h-4 w-4" />
  Like
</Button>
<Button variant="outline">
  <ShoppingCart className="mr-2 h-4 w-4" />
  Add to Cart
</Button>
<Button variant="ghost">
  Next
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>`,
  },
  {
    id: "sizes",
    name: "Different Sizes",
    description: "Various button sizes for different use cases",
    theme: "modern",
    preview: (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    ),
    code: `<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>`,
  },
]

export const buttonThemes = {
  minimal: "bg-gray-100 text-gray-700 border-gray-200",
  modern: "bg-blue-100 text-blue-700 border-blue-200",
  gradient: "bg-purple-100 text-purple-700 border-purple-200",
  rounded: "bg-green-100 text-green-700 border-green-200",
}

// Unified preview components
export const SmallPreview = () => (
  <div className="flex items-center justify-center">
    <Button size="sm" className="px-2 py-1 text-[10px]">Btn</Button>
  </div>
)

export const MediumPreview = () => (
  <div className="flex flex-wrap gap-3">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
  </div>
)

// Prop-based examples for the playground
export const buttonExamples: ComponentExample[] = [
  {
    name: "Primary",
    description: "Default primary button",
    props: {
      variant: "primary",
      size: "md",
      children: "Primary",
    },
  },
  {
    name: "Secondary",
    description: "Secondary style button",
    props: {
      variant: "secondary",
      size: "md",
      children: "Secondary",
    },
  },
  {
    name: "Outline",
    description: "Outline variant",
    props: {
      variant: "outline",
      size: "md",
      children: "Outline",
    },
  },
  {
    name: "Ghost",
    description: "Ghost variant",
    props: {
      variant: "ghost",
      size: "md",
      children: "Ghost",
    },
  },
  {
    name: "Sizes",
    description: "Small and Large sizes",
    props: {
      variant: "primary",
      size: "lg",
      children: "Large Button",
    },
  },
  {
    name: "Disabled",
    description: "Disabled state",
    props: {
      variant: "primary",
      size: "md",
      disabled: true,
      children: "Disabled",
    },
  },
]

//!!!!!IMPORTANT: Eventually remove this and use the code from the examples.tsx file
export const ButtonCode = `
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode | (() => React.ReactNode);
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  disabled?: boolean;
  className?: string;
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
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2'
  };
  
  const combinedClassName = baseStyles + ' ' + variantStyles[variant] + ' ' + sizeStyles[size] + ' ' + className;
  
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
`