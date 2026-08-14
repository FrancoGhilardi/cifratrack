import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Skeleton del hero de balance + tiles de flujo.
 */
export function DashboardHeroSkeleton() {
  return (
    <section className="grid gap-4 lg:grid-cols-12">
      <Card className="border border-border/70 px-5 pt-5 shadow-none lg:col-span-7 sm:px-6 sm:pt-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-10 w-56" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-[116px] w-full" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="flex flex-col justify-center gap-2.5 border border-border/70 px-4 py-4 shadow-none sm:px-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-[3px] w-full" />
            <Skeleton className="h-3 w-40" />
          </Card>
        ))}
      </div>
    </section>
  );
}

/**
 * Skeleton para los gráficos de categorías
 */
export function ExpensesChartSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card
          key={i}
          className="relative overflow-hidden border border-border/70 shadow-none"
        >
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="flex-1 h-2 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
