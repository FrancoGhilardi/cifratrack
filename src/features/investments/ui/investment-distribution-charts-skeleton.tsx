import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function InvestmentDistributionChartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            {/* Círculo del gráfico */}
            <Skeleton className="h-40 w-40 rounded-full" />
            {/* Leyenda simulada debajo (opcional o incluida en el círculo) */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
