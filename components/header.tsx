"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Moon, Sun, Menu, Github, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CommandMenu } from "@/components/command-menu"
import { cn } from "@/lib/utils"
import { BASE_REPO_URL } from "@/lib/constants"
import { navigation } from "@/lib/navigation"
import { useScrollDirection } from "@/lib/hooks/use-scroll-direction"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"

/** Shared site header with navigation, command palette, GitHub link, and theme selector. */
export function Header() {
  const pathname = usePathname()
  const { setTheme } = useTheme()
  const { scrollDirection, isScrolled } = useScrollDirection()

  const isPlayground = pathname.startsWith("/playground")
  const shouldHide = isPlayground && scrollDirection === 'down' && isScrolled

  return (
    <header className={cn(
      "glass sticky top-0 z-50 flex w-full justify-center border-b transition-transform duration-500 ease-out-expo",
      isPlayground && shouldHide && "-translate-y-full",
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className={cn("flex items-center space-x-2", focusRing)}>
            <Image
              src="/icon.svg"
              alt="UI Components"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-display text-xl font-bold">Components</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                    focusRing,
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <CommandMenu />

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
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        focusRing,
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
