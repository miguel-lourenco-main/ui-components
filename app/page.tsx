import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowRight, Code, Palette, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { PopularComponentsGridSkeleton } from "@/components/PopularComponentsGrid"

const PopularComponentsGrid = dynamic(() => import('@/components/PopularComponentsGrid'), { ssr: false, loading: () => <PopularComponentsGridSkeleton /> })

/**
 * Marketing landing page that highlights the playground value prop and links into the components catalog.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col size-full items-center">
      <Header/>

      <div className="flex flex-col min-h-screen w-full">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-4xl">
            <Badge variant="outline" className="mb-4">
              Beta Release
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Beautiful Components.
              <br />
              <span className="text-primary">Multiple Styles.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover a curated collection of components crafted in various design styles. Copy the code you need and
              build faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button size="lg" asChild className="w-fit">
                <Link href="/components">
                  Browse Components <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Components?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built with modern technologies and designed for flexibility
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Palette className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Multiple Styles</CardTitle>
                  <CardDescription>
                    Each component comes in various design styles - from minimal to bold, giving you options for every
                    project.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Code className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Copy & Paste</CardTitle>
                  <CardDescription>
                    Simply copy the code you need. All components are built with modern React and TypeScript.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>
                    AI-powered styling and interactive playground to customize components to your exact needs.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Component Preview Section */}
        <section className="py-20 px-4 bg-muted/20">
          <div className="container mx-auto max-w-8xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Popular Components</h2>
              <p className="text-muted-foreground text-lg">Get started with these frequently used components</p>
            </div>

            {/* Popular Components - source dynamically from registry */}
            <PopularComponentsGrid />

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link href="/components">View All Components <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// moved client PopularComponentsGrid into components/PopularComponentsGrid and dynamically imported above
