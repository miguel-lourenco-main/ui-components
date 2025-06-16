import { ComponentExample } from '@/types';

export const cardExamples: ComponentExample[] = [
  {
    name: "Basic Card",
    description: "Simple card with default styling",
    props: {
      children: "return <div>This is a basic card with default styling and medium padding.</div>;"
    }
  },
  {
    name: "Card with Header",
    description: "Card with a header section",
    props: {
      header: "return <div>Card Header</div>;",
      children: "return <div>This card has a header section separated from the main content.</div>;"
    }
  },
  {
    name: "Card with Footer",
    description: "Card with a footer section",
    props: {
      children: "return <div>This card has a footer section at the bottom.</div>;",
      footer: "return <div>Card Footer</div>;"
    }
  },
  {
    name: "Complete Card",
    description: "Card with header, body, and footer",
    props: {
      header: "return <div>User Profile</div>;",
      children: "return <div>This is the main content area with user information and details.</div>;",
      footer: "return <div>Last updated: Today</div>;"
    }
  },
  {
    name: "Small Shadow Card",
    description: "Card with subtle shadow",
    props: {
      shadow: "sm",
      children: "return <div>This card has a small, subtle shadow effect.</div>;"
    }
  },
  {
    name: "Large Shadow Card",
    description: "Card with prominent shadow",
    props: {
      shadow: "lg",
      children: "return <div>This card has a large, prominent shadow for emphasis.</div>;"
    }
  },
  {
    name: "No Shadow Card",
    description: "Card without any shadow",
    props: {
      shadow: "none",
      children: "return <div>This card has no shadow, giving it a flat appearance.</div>;"
    }
  },
  {
    name: "Compact Card",
    description: "Card with small padding",
    props: {
      padding: "sm",
      children: "return <div>This card has reduced padding for a more compact layout.</div>;"
    }
  },
  {
    name: "Spacious Card",
    description: "Card with large padding",
    props: {
      padding: "lg",
      children: "return <div>This card has extra padding for a more spacious, luxurious feel.</div>;"
    }
  },
  {
    name: "No Padding Card",
    description: "Card without internal padding",
    props: {
      padding: "none",
      children: "return <div>This card has no internal padding, useful for custom layouts.</div>;"
    }
  },
  {
    name: "Rounded Card",
    description: "Card with large border radius",
    props: {
      rounded: "lg",
      children: "return <div>This card has large rounded corners for a modern look.</div>;"
    }
  },
  {
    name: "Sharp Card",
    description: "Card with no border radius",
    props: {
      rounded: "none",
      children: "return <div>This card has sharp corners with no border radius.</div>;"
    }
  },
  {
    name: "Borderless Card",
    description: "Card without border",
    props: {
      border: false,
      children: "return <div>This card has no border, relying only on shadow for definition.</div>;"
    }
  },
  {
    name: "Custom Card",
    description: "Card with custom styling",
    props: {
      className: "bg-gradient-to-r from-blue-50 to-indigo-50",
      shadow: "md",
      rounded: "lg",
      children: "return <div>This card demonstrates custom styling with additional CSS classes.</div>;"
    }
  },
  {
    name: 'JSX Content Card',
    description: 'A card with JSX content.',
    props: {
      children: `return (
        <div>
          <h4 style={{ fontWeight: 'bold' }}>JSX Content</h4>
          <p>This card's content is rendered from a JSX element.</p>
        </div>
      );`,
    },
  },
]; 