import { ComponentExample } from '@/types';

export const buttonExamples: ComponentExample[] = [
  {
    name: "Primary Button",
    description: "Standard primary button for main actions",
    props: {
      variant: "primary",
      size: "md",
      children: "return (<div>Click me</div>);"
    }
  },
  {
    name: "Secondary Button", 
    description: "Secondary button for less prominent actions",
    props: {
      variant: "secondary",
      size: "md", 
      children: "return <div>Secondary action</div>;"
    }
  },
  {
    name: "Outline Button",
    description: "Outlined button with transparent background",
    props: {
      variant: "outline",
      size: "md",
      children: "return <div>Outline style</div>;"
    }
  },
  {
    name: "Ghost Button",
    description: "Minimal button with no background",
    props: {
      variant: "ghost",
      size: "md",
      children: "return <div>Ghost style</div>;"
    }
  },
  {
    name: "Small Button",
    description: "Compact button for tight spaces",
    props: {
      variant: "primary",
      size: "sm",
      children: "return <div>Small</div>;"
    }
  },
  {
    name: "Large Button",
    description: "Large button for emphasis",
    props: {
      variant: "primary", 
      size: "lg",
      children: "return <div>Large Button</div>;"
    }
  },
  {
    name: "Disabled Button",
    description: "Button in disabled state",
    props: {
      variant: "primary",
      size: "md",
      children: "return <div>Disabled</div>;",
      disabled: true
    }
  },
  {
    name: 'Icon Button',
    description: 'A button with an icon and text.',
    props: {
      variant: 'primary',
      size: 'md',
      children: `return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '8px' }}
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
          Icon Button
        </div>
      );`,
    },
  },
]; 