import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowRight, Bot, Code, Palette, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { AmbientBackground } from "@/components/ambient-background"
import { GlowCard } from "@/components/glow-card"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger"
import { PopularComponentsGridSkeleton } from "@/components/PopularComponentsGrid"
import { COMPONENTS_INDEX } from "@/lib/componentsIndex"
import { themes } from "@/lib/themes"
import { REQUESTS } from "@/lib/requests/manifest-data"

const PopularComponentsGrid = dynamic(() => import('@/components/PopularComponentsGrid'), { ssr: false, loading: () => <PopularComponentsGridSkeleton /> })
const LandingDemoStrip = dynamic(() => import('@/components/landing-demo-strip'), { ssr: false, loading: () => <Skeleton className="h-24 w-full rounded-2xl" /> })

const features = [
  {
    icon: Palette,
    title: "Multiple Styles",
    description:
      "Each component comes in six distinct design themes — from minimal to neon — with light and dark variants for every project.",
  },
  {
    icon: Code,
    title: "Copy & Paste",
    description:
      "Tweak props live in the playground, then copy production-ready React + TypeScript code straight into your project.",
  },
  {
    icon: Bot,
    title: "Agent-Driven Requests",
    description:
      "AI agents propose new components and themes over MCP. Every proposal is validated, previewed, and reviewed before publishing.",
  },
]

/**
 * Marketing landing page that highlights the playground value prop and links into the components catalog.
 */
export default function HomePage() {
  const stats = [
    { value: COMPONENTS_INDEX.length, label: "Components" },
    { value: themes.length, label: "Design Themes" },
    { value: REQUESTS.length, label: "Agent Requests" },
  ]

  return (
    <div className="flex flex-col size-full items-center">
      <Header/>

      <div className="flex flex-col min-h-screen w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-24 text-center md:py-32">
          <AmbientBackground variant="hero" />
          <div className="container mx-auto max-w-4xl">
            <FadeIn>
              <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-accent">
                <Sparkles className="h-3 w-3" aria-hidden />
                Beta Release
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="text-display mb-6 text-5xl font-bold md:text-7xl">
                <span className="gradient-text">Beautiful Components.</span>
                <br />
                <span className="gradient-text">Multiple Styles.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
                Discover a curated collection of components crafted in various design styles. Copy the code you need and
                build faster.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="glow-primary w-fit">
                  <Link href="/components">
                    Browse Components <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="w-fit">
                  <Link href="/playground">Open Playground</Link>
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Live component marquee */}
          <FadeIn delay={0.32} className="container mx-auto mt-20 max-w-6xl">
            <LandingDemoStrip />
          </FadeIn>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/50 px-4 py-10">
          <FadeIn inView className="container mx-auto grid max-w-4xl grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-display text-3xl font-bold tabular-nums md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </FadeIn>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <FadeIn inView className="mb-16 text-center">
              <h2 className="text-display mb-4 text-3xl font-bold">Why Choose Our Components?</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Built with modern technologies and designed for flexibility
              </p>
            </FadeIn>

            <StaggerGroup className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <StaggerItem key={feature.title}>
                  <GlowCard className="h-full">
                    <CardHeader>
                      <feature.icon className="mb-2 h-10 w-10 text-primary-accent" aria-hidden />
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </GlowCard>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* Component Preview Section */}
        <section className="relative overflow-hidden border-t border-border/50 px-4 py-20">
          <AmbientBackground variant="subtle" />
          <div className="container mx-auto max-w-6xl">
            <FadeIn inView className="mb-16 text-center">
              <h2 className="text-display mb-4 text-3xl font-bold">Popular Components</h2>
              <p className="text-lg text-muted-foreground">Get started with these frequently used components</p>
            </FadeIn>

            {/* Popular Components - source dynamically from registry */}
            <PopularComponentsGrid />

            <div className="mt-12 text-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="/components">View All Components <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  )
}
