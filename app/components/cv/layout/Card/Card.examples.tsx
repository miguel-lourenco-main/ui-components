import { ComponentExample } from '@/types';

export const cardExamples: ComponentExample[] = [
  {
    name: "Basic Card",
    description: "Simple card with default styling",
    props: {
      children: "This is a basic card with default styling and medium padding."
    }
  },
  {
    name: "Card with Header",
    description: "Card with a header section",
    props: {
      header: "Card Header",
      children: "This card has a header section separated from the main content."
    }
  },
  {
    name: "Card with Footer",
    description: "Card with a footer section",
    props: {
      children: "This card has a footer section at the bottom.",
      footer: "Card Footer"
    }
  },
  {
    name: "Complete Card",
    description: "Card with header, body, and footer",
    props: {
      header: "User Profile",
      children: "This is the main content area with user information and details.",
      footer: "Last updated: Today"
    }
  },
  {
    name: "Small Shadow Card",
    description: "Card with subtle shadow",
    props: {
      shadow: "sm",
      children: "This card has a small, subtle shadow effect."
    }
  },
  {
    name: "Large Shadow Card",
    description: "Card with prominent shadow",
    props: {
      shadow: "lg",
      children: "This card has a large, prominent shadow for emphasis."
    }
  },
  {
    name: "No Shadow Card",
    description: "Card without any shadow",
    props: {
      shadow: "none",
      children: "This card has no shadow, giving it a flat appearance."
    }
  },
  {
    name: "Compact Card",
    description: "Card with small padding",
    props: {
      padding: "sm",
      children: "This card has reduced padding for a more compact layout."
    }
  },
  {
    name: "Spacious Card",
    description: "Card with large padding",
    props: {
      padding: "lg",
      children: "This card has extra padding for a more spacious, luxurious feel."
    }
  },
  {
    name: "No Padding Card",
    description: "Card without internal padding",
    props: {
      padding: "none",
      children: "This card has no internal padding, useful for custom layouts."
    }
  },
  {
    name: "Rounded Card",
    description: "Card with large border radius",
    props: {
      rounded: "lg",
      children: "This card has large rounded corners for a modern look."
    }
  },
  {
    name: "Sharp Card",
    description: "Card with no border radius",
    props: {
      rounded: "none",
      children: "This card has sharp corners with no border radius."
    }
  },
  {
    name: "Borderless Card",
    description: "Card without border",
    props: {
      border: false,
      children: "This card has no border, relying only on shadow for definition."
    }
  },
  {
    name: "Custom Card",
    description: "Card with custom styling",
    props: {
      className: "bg-gradient-to-r from-blue-50 to-indigo-50",
      shadow: "md",
      rounded: "lg",
      children: "This card demonstrates custom styling with additional CSS classes."
    }
  }
]; 