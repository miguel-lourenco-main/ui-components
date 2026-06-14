import { Header } from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { MaterialLabLanding } from "@/components/lab/material-lab-landing"
import { COMPONENTS_INDEX } from "@/lib/componentsIndex"
import { themes } from "@/lib/themes"
import { REQUESTS } from "@/lib/requests/manifest-data"

/**
 * THE MATERIAL LAB landing — the awwwards showpiece. Server component so the
 * shell + real stats + headline are static HTML; the WebGL/scroll FX layer is
 * the MaterialLabLanding client child (sections SSR their content for LCP/SEO
 * and reduced-motion users).
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
        <MaterialLabLanding stats={stats} />
        <SiteFooter />
      </div>
    </div>
  )
}
