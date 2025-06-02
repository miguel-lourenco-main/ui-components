import { Component } from '@/types';

export async function fetchComponents(): Promise<Component[]> {
  // Mock data for now - replace with actual GitLab API calls later
  return [
    {
      id: '1',
      name: 'Button',
      category: 'form',
      description: 'A customizable button component',
      props: [
        {
          name: 'variant',
          type: 'enum',
          required: false,
          defaultValue: 'primary',
          description: 'Button style variant',
          options: ['primary', 'secondary', 'danger']
        },
        {
          name: 'size',
          type: 'enum',
          required: false,
          defaultValue: 'medium',
          description: 'Button size',
          options: ['small', 'medium', 'large']
        },
        {
          name: 'disabled',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the button is disabled'
        },
        {
          name: 'children',
          type: 'string',
          required: true,
          defaultValue: 'Click me',
          description: 'Button text content'
        }
      ],
      code: `export default function Button({ variant = 'primary', size = 'medium', disabled = false, children }) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };
  
  return (
    <button 
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]}\`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}`,
      examples: [
        {
          name: 'Primary Button',
          props: { variant: 'primary', children: 'Primary' }
        },
        {
          name: 'Secondary Button',
          props: { variant: 'secondary', children: 'Secondary' }
        }
      ],
      tags: ['button', 'form', 'interactive'],
      version: '1.0.0',
      author: 'UI Team'
    },
    {
      id: '2',
      name: 'Card',
      category: 'layout',
      description: 'A flexible card container component',
      props: [
        {
          name: 'title',
          type: 'string',
          required: false,
          defaultValue: '',
          description: 'Card title'
        },
        {
          name: 'children',
          type: 'string',
          required: true,
          defaultValue: 'Card content',
          description: 'Card content'
        },
        {
          name: 'padding',
          type: 'enum',
          required: false,
          defaultValue: 'medium',
          options: ['small', 'medium', 'large']
        }
      ],
      code: `export default function Card({ title, children, padding = 'medium' }) {
  const paddingClasses = {
    small: 'p-3',
    medium: 'p-6',
    large: 'p-8'
  };
  
  return (
    <div className={\`bg-white rounded-lg shadow-md border \${paddingClasses[padding]}\`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div>{children}</div>
    </div>
  );
}`,
      examples: [
        {
          name: 'Simple Card',
          props: { title: 'Sample Card', children: 'This is card content' }
        }
      ],
      tags: ['card', 'container', 'layout'],
      version: '1.0.0',
      author: 'UI Team'
    }
  ];
} 