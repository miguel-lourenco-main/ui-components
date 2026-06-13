"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Blocks,
  Component,
  GitPullRequest,
  Monitor,
  Moon,
  Palette,
  Search,
  Sun,
  Terminal,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { COMPONENTS_INDEX } from "@/lib/componentsIndex"
import { themes } from "@/lib/themes"

const pages = [
  { name: "Components", href: "/components", icon: Blocks },
  { name: "Themes", href: "/themes", icon: Palette },
  { name: "Requests", href: "/requests", icon: GitPullRequest },
  { name: "Playground", href: "/playground", icon: Terminal },
]

/**
 * Global ⌘K / Ctrl+K command palette: jump to pages, components, themes,
 * or switch the color mode.
 */
export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="hidden h-9 items-center gap-2 rounded-lg border-border/70 bg-background/50 px-3 text-sm font-normal text-muted-foreground sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" aria-hidden />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search components, themes, pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.href}
                value={`page ${page.name}`}
                onSelect={() => runCommand(() => router.push(page.href))}
              >
                <page.icon className="mr-2 h-4 w-4" aria-hidden />
                {page.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Components">
            {COMPONENTS_INDEX.map((component) => (
              <CommandItem
                key={component.id}
                value={`component ${component.name}`}
                onSelect={() =>
                  runCommand(() => router.push(`/components?component=${component.id}`))
                }
              >
                <Component className="mr-2 h-4 w-4" aria-hidden />
                {component.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Themes">
            {themes.map((theme) => (
              <CommandItem
                key={theme.id}
                value={`theme ${theme.name}`}
                onSelect={() => runCommand(() => router.push(`/themes?theme=${theme.id}`))}
              >
                <Palette className="mr-2 h-4 w-4" aria-hidden />
                {theme.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Appearance">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" aria-hidden />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" aria-hidden />
              Dark
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Monitor className="mr-2 h-4 w-4" aria-hidden />
              System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
