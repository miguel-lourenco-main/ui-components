import Link from "next/link"
import Image from "next/image"
import { Github } from "lucide-react"
import { navigation } from "@/lib/navigation"
import { BASE_REPO_URL } from "@/lib/constants"

/** Shared site footer: brand, navigation, repository link. */
export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/50">
      <div className="container mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md w-fit"
          >
            <Image src="/icon.svg" alt="UI Components" width={24} height={24} className="h-6 w-6" />
            <span className="font-semibold">Components</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            A component library &amp; interactive playground by Miguel Lourenço.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href={BASE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
          >
            <Github className="h-4 w-4" aria-hidden />
            <span className="sr-only">Source repository</span>
          </Link>
        </nav>
      </div>
    </footer>
  )
}
