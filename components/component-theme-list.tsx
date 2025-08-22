import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { themes } from "@/lib/themes"
import ThemedPreviewSurface from "@/components/themed-preview-surface"
import { SectionHeader } from "@/components/section-header"
import { Palette } from "lucide-react"
import { ComponentType } from "@/lib/componentTypes"

interface ComponentThemeListProps {
  componentType: ComponentType
  componentName: string
}

export function ComponentThemeList({ componentType, componentName }: ComponentThemeListProps) {
  return (
    <div className="mb-12">
      <SectionHeader
        title={`${componentName} Themes`}
        description={`Explore how ${componentName.toLowerCase()} look across different design themes`}
        icon={<Palette className="h-6 w-6" />}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <Link key={theme.id} href={`/themes?theme=${theme.id}`}>
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                  {theme.name}
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.light.primary }}></div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.light.secondary }}></div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.light.accent }}></div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ThemedPreviewSurface
                  themeId={theme.id}
                  component={componentType}
                  size="large"
                  showModeToggle={false}
                />
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    {theme.styles.borderRadius}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {theme.styles.fontWeight}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
