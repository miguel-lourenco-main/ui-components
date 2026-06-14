import { Header } from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { TypesetLanding } from "@/components/typeset/typeset-landing"
import { COMPONENTS_INDEX } from "@/lib/componentsIndex"
import { themes } from "@/lib/themes"
import { REQUESTS } from "@/lib/requests/manifest-data"

/**
 * TYPESET landing — the awwwards showpiece. Server component so the shell + real
 * stats + the editorial headline are static HTML; the kinetic/scroll/WebGL FX
 * layer is the TypesetLanding client child (sections SSR their content for
 * LCP/SEO and reduced-motion users).
 */
export default function HomePage() {
  const stats = {
    components: COMPONENTS_INDEX.length,
    themes: themes.length,
    requests: REQUESTS.length,
  }

  return (
    <div className="flex w-full flex-col items-center">
      <Header />
      <div className="w-full">
        <TypesetLanding stats={stats} />
        <SiteFooter />
      </div>
    </div>
  )
}
