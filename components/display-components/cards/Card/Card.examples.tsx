import { CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import Card from "./Card"
import type { ComponentExample } from "@/lib/interfaces"
import { User, Settings } from "lucide-react"

export const SmallPreview = () => (
  <div className="scale-50">
    <Card className="w-28 h-3/4 py-3">
      <CardHeader className="pb-1 px-2 pt-2">
        <CardTitle className="text-xs text-muted-foreground">Card</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-2 pb-2">
        <div className="h-2 bg-muted rounded mb-1"></div>
        <div className="h-1 bg-muted/60 rounded w-3/4"></div>
      </CardContent>
    </Card>
  </div>
)

export const MediumPreview = () => (
  <Card title="Basic Card" subtitle="Simple content container">
    <p className="text-gray-700">This is a basic card with title and subtitle.</p>
  </Card>
)


export const cardVariants = [
  {
    id: "default",
    name: "Default Cards",
    description: "Standard card styles for content display",
    theme: "modern",
    preview: (
      <div className="space-y-4">
        <Card title="Basic Card" subtitle="Simple content container">
          <p className="text-gray-700">This is a basic card with title and subtitle.</p>
        </Card>
        <Card>
          <p className="text-gray-700">This is a card without header.</p>
        </Card>
      </div>
    ),
    code: `<Card title="Basic Card" subtitle="Simple content container">
  <p>This is a basic card with title and subtitle.</p>
</Card>

<Card>
  <p>This is a card without header.</p>
</Card>`,
  },
  {
    id: "variants",
    name: "Card Variants",
    description: "Different visual styles for cards",
    theme: "modern",
    preview: (
      <div className="grid grid-cols-2 gap-4">
        <Card variant="default" title="Default">
          <p className="text-sm text-gray-600">Standard card style</p>
        </Card>
        <Card variant="outlined" title="Outlined">
          <p className="text-sm text-gray-600">Outlined card style</p>
        </Card>
        <Card variant="elevated" title="Elevated">
          <p className="text-sm text-gray-600">Elevated card style</p>
        </Card>
        <Card variant="flat" title="Flat">
          <p className="text-sm text-gray-600">Flat card style</p>
        </Card>
      </div>
    ),
    code: `<Card variant="default" title="Default">
  <p>Standard card style</p>
</Card>

<Card variant="outlined" title="Outlined">
  <p>Outlined card style</p>
</Card>

<Card variant="elevated" title="Elevated">
  <p>Elevated card style</p>
</Card>

<Card variant="flat" title="Flat">
  <p>Flat card style</p>
</Card>`,
  },
  {
    id: "sizes",
    name: "Card Sizes",
    description: "Different sizes for various use cases",
    theme: "modern",
    preview: (
      <div className="space-y-4">
        <Card size="sm" title="Small Card">
          <p className="text-sm text-gray-600">Compact content</p>
        </Card>
        <Card size="md" title="Medium Card">
          <p className="text-gray-600">Regular content area</p>
        </Card>
        <Card size="lg" title="Large Card">
          <p className="text-gray-600">Spacious content layout</p>
        </Card>
      </div>
    ),
    code: `<Card size="sm" title="Small Card">
  <p>Compact content</p>
</Card>

<Card size="md" title="Medium Card">
  <p>Regular content area</p>
</Card>

<Card size="lg" title="Large Card">
  <p>Spacious content layout</p>
</Card>`,
  },
  {
    id: "with-icons",
    name: "Cards with Icons",
    description: "Cards enhanced with icons and rich content",
    theme: "modern",
    preview: (
      <div className="grid grid-cols-1 gap-4">
        <Card variant="elevated" title="Profile" subtitle="User information">
          <div className="size-full items-center justify-center flex space-x-3">
            <User className="h-8 w-8 text-blue-500" />
            <div className="text-gray-500">
              <p className="font-medium">John Doe</p>
              <p className="text-sm">Software Engineer</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" title="Settings" subtitle="System preferences">
          <div className="size-full items-center justify-center flex space-x-3">
            <Settings className="h-8 w-8 text-purple-500" />
            <div className="text-gray-500">
              <p className="font-medium">Preferences</p>
              <p className="text-sm">Customize your experience</p>
            </div>
          </div>
        </Card>
      </div>
    ),
    code: `<Card variant="elevated" title="Profile" subtitle="User information">
  <div className="flex items-center space-x-3">
    <User className="h-8 w-8 text-blue-500" />
    <div>
      <p className="font-medium">John Doe</p>
      <p className="text-sm text-gray-500">Software Engineer</p>
    </div>
  </div>
</Card>`,
  },
]

export const cardThemes = {
  modern: "bg-blue-100 text-blue-700 border-blue-200",
  minimal: "bg-gray-100 text-gray-700 border-gray-200",
  elevated: "bg-purple-100 text-purple-700 border-purple-200",
} 

// Prop-based examples for the playground
export const cardExamples: ComponentExample[] = [
  {
    name: "Basic Card",
    description: "Simple card with title and content",
    props: {
      title: "Basic Card",
      subtitle: "Simple content container",
      variant: "default",
      size: "md",
      children: "This is a basic card with title and subtitle.",
    },
  },
  {
    name: "Outlined",
    description: "Outlined variant",
    props: {
      title: "Outlined",
      variant: "outlined",
      size: "md",
      children: "Outlined card style",
    },
  },
  {
    name: "Elevated",
    description: "Elevated variant",
    props: {
      title: "Elevated",
      variant: "elevated",
      size: "md",
      children: "Elevated card style",
    },
  },
  {
    name: "Flat",
    description: "Flat variant",
    props: {
      title: "Flat",
      variant: "flat",
      size: "md",
      children: "Flat card style",
    },
  },
  {
    name: "Sizes",
    description: "Small card size",
    props: {
      title: "Small Card",
      size: "sm",
      children: "Compact content",
    },
  },
]