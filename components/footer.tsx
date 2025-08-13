import Link from "next/link"
import { Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="flex justify-center items-center border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">C</span>
              </div>
              <span className="font-bold">Components</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Beautiful components in multiple styles for modern web applications.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Components</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/components/buttons" className="hover:text-foreground">
                  Buttons
                </Link>
              </li>
              <li>
                <Link href="/components/cards" className="hover:text-foreground">
                  Cards
                </Link>
              </li>
              <li>
                <Link href="/components/forms" className="hover:text-foreground">
                  Forms
                </Link>
              </li>
              <li>
                <Link href="/components/navigation" className="hover:text-foreground">
                  Navigation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/docs" className="hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/examples" className="hover:text-foreground">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-foreground">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Community</h3>
            <div className="flex space-x-2">
              <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Components. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
