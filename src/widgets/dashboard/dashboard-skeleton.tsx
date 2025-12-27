import { Card, CardContent, CardHeader } from '@/shared/ui/card';

/**
 * Componente base para elementos con efecto shimmer
 */
function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded ${className}`}
      style={{
        backgroundColor: 'hsl(var(--muted))'
      }}
    >
      {/* Shimmer animado */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--muted-foreground) / 0.1), transparent)',
          animation: 'shimmer 1.5s ease-in-out infinite',
          transform: 'translateX(-100%)'
        }}
      />
    </div>
  );
}

/**
 * Skeleton para las tarjetas de resumen
 */
export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <SkeletonBox className="h-8 w-32 mb-2" />
            <SkeletonBox className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton para los gráficos de categorías
 */
export function ExpensesChartSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardHeader>
            <SkeletonBox className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="h-4 w-12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <SkeletonBox className="flex-1 h-2 rounded-full" />
                    <SkeletonBox className="h-4 w-20" />
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
