import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

interface ThemedComponentPreviewProps {
  themeId: string
  component:
    | "button"
    | "card"
    | "input"
    | "slider"
    | "switch"
    | "textarea"
    | "toggle"
    | "form"
    | "alert"
    | "badge"
    | "mixed"
  size?: "small" | "medium" | "large"
  mode?: "light" | "dark"
  seamless?: boolean
}

export function ThemedComponentPreview({
  themeId,
  component,
  size = "medium",
  mode = "light",
  seamless = false,
}: ThemedComponentPreviewProps) {
  const theme = getTheme(themeId)
  if (!theme) return null

  const getScale = () => {
    switch (size) {
      case "small":
        return "scale-50"
      case "medium":
        return "scale-75"
      case "large":
        return "scale-90"
      default:
        return "scale-75"
    }
  }

  const getContainerSize = () => {
    switch (size) {
      case "small":
        return "w-20 h-16"
      case "medium":
        return "w-24 h-20"
      case "large":
        return "w-32 h-28"
      default:
        return "w-24 h-20"
    }
  }

  const themeColors = theme.colors[mode]
  const themeComponents = theme.components[mode]

  const renderComponent = () => {
    switch (component) {
      case "button":
        return (
          <div className={`flex gap-2 ${getScale()} origin-center`}>
            <Button size="sm" className={cn("text-xs px-3 py-1", themeComponents.button.primary)}>
              Primary
            </Button>
            <Button size="sm" className={cn("text-xs px-3 py-1", themeComponents.button.outline)}>
              Outline
            </Button>
          </div>
        )

      case "card":
        return (
          <Card className={cn(`w-28 ${getScale()} origin-center`, themeComponents.card.base)}>
            <CardHeader className={cn("py-2 px-3", themeComponents.card.header)}>
              <CardTitle className="text-xs">Card Title</CardTitle>
            </CardHeader>
            <CardContent className={cn("py-2 px-3", themeComponents.card.content)}>
              <div className="h-2 bg-current opacity-20 rounded mb-1"></div>
              <div className="h-1 bg-current opacity-15 rounded w-3/4"></div>
            </CardContent>
          </Card>
        )

      case "input":
        return (
          <div className={`space-y-2 ${getScale()} origin-center`}>
            <Input placeholder="Input" className={cn("h-7 text-xs w-24", themeComponents.form?.input || "")} />
          </div>
        )

      case "slider":
        return (
          <div className={`w-28 ${getScale()} origin-center`}>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
        )

      case "switch":
        return (
          <div className={`flex items-center ${getScale()} origin-center`}>
            <Switch defaultChecked />
          </div>
        )

      case "textarea":
        return (
          <div className={`space-y-2 ${getScale()} origin-center`}>
            <Textarea placeholder="Message" className={cn("h-12 text-xs w-28", themeComponents.form?.input || "")} />
          </div>
        )

      case "toggle":
        return (
          <div className={`flex gap-2 ${getScale()} origin-center`}>
            <Toggle size="sm">Toggle</Toggle>
          </div>
        )

      case "form":
        return (
          <div className={`space-y-2 ${getScale()} origin-center`}>
            <Input placeholder="Email" className={cn("h-7 text-xs w-24", themeComponents.form.input)} />
            <Button size="sm" className={cn("w-24 h-7 text-xs", themeComponents.button.primary)}>
              Submit
            </Button>
          </div>
        )

      case "alert":
        return (
          <Alert className={cn(`w-24 ${getScale()} origin-center`, themeComponents.alert.base)}>
            <AlertDescription className={cn("text-xs p-2", themeComponents.alert.text)}>Alert message</AlertDescription>
          </Alert>
        )

      case "badge":
        return (
          <div className={`flex gap-1 ${getScale()} origin-center`}>
            <Badge className={cn("text-xs px-2 py-0", themeComponents.badge.base)}>New</Badge>
            <Badge className={cn("text-xs px-2 py-0", themeComponents.badge.base)}>Hot</Badge>
          </div>
        )

      case "mixed":
        return (
          <div className={`space-y-3 ${getScale()} origin-center`}>
            <div className="flex gap-2">
              <Button size="sm" className={cn("text-xs px-2 py-1", themeComponents.button.primary)}>
                Primary
              </Button>
              <Button size="sm" className={cn("text-xs px-2 py-1", themeComponents.button.secondary)}>
                Secondary
              </Button>
            </div>
            <Card className={cn("w-32", themeComponents.card.base)}>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Card</span>
                  <Badge className={cn("text-xs px-1 py-0", themeComponents.badge.base)}>New</Badge>
                </div>
              </CardContent>
            </Card>
            <Input placeholder="Input field" className={cn("h-8 text-xs w-32 py-1", themeComponents.form.input)} />
          </div>
        )

      default:
        return <div className="text-xs text-muted-foreground">Preview</div>
    }
  }

  if (seamless) {
    return <div className={`flex items-center justify-center ${getContainerSize()}`}>{renderComponent()}</div>
  }

  return (
    <div
      className={`flex items-center justify-center ${getContainerSize()} rounded-lg`}
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.foreground,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {renderComponent()}
    </div>
  )
}
