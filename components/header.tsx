"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun, Menu, Github, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { BASE_REPO_URL } from "@/lib/constants"
import { useScrollDirection } from "@/lib/hooks/use-scroll-direction"

const navigation = [
  { name: "Components", href: "/components" },
  { name: "Themes", href: "/themes" },
  { name: "Playground", href: "/playground" },
]

/** Shared site header with navigation, GitHub link, and theme selector. */
export function Header() {
  const pathname = usePathname()
  const { setTheme } = useTheme()
  const { scrollDirection, isScrolled } = useScrollDirection()
  
  const isPlayground = pathname.startsWith("/playground")
  const shouldHide = isPlayground && scrollDirection === 'down' && isScrolled

  return (
    <header className={cn(
      "sticky top-0 z-50 flex justify-center w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out",
      isPlayground && shouldHide && "-translate-y-full",
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl">Components</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={BASE_REPO_URL} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}> <Sun className="h-4 w-4" /> Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}> <Moon className="h-4 w-4" /> Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}> <Monitor className="h-4 w-4" /> System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
