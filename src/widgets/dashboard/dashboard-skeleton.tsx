import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export { SummaryCardsSkeleton } from "@/shared/ui/summary-cards-skeleton";

/**
 * Skeleton para los gráficos de categorías
 */
export function ExpensesChartSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i} className="relative overflow-hidden border-0">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
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
