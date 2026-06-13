import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton fallback for the components route, mirroring the catalog grid so
 * route transitions don't flash a blank page.
 */
export default function Loading() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <Skeleton className="mb-4 h-10 w-72" />
          <Skeleton className="h-6 w-96 max-w-full" />
        </div>
        <Skeleton className="mb-6 h-8 w-44" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="rounded-2xl">
              <CardHeader>
                <Skeleton className="mb-2 h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="flex flex-col gap-y-3">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-28 w-full rounded-md" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
