import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';

interface DataTableSkeletonProps {
  /**
   * Número de filas a mostrar
   * @default 6
   */
  rows?: number;
  /**
   * Número de columnas a mostrar (sin contar acciones)
   * @default 3
   */
  columns?: number;
  /**
   * Muestra columna de acciones
   * @default true
   */
  showActions?: boolean;
  /**
   * Muestra botón de crear en el header
   * @default true
   */
  showCreateButton?: boolean;
}

/**
 * Skeleton genérico para tablas de datos
 */
export function DataTableSkeleton({
  rows = 6,
  columns = 3,
  showActions = true,
  showCreateButton = true,
}: DataTableSkeletonProps) {
  return (
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        {/* Título y descripción */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Botón crear */}
        {showCreateButton && <Skeleton className="h-9 w-36 rounded-md" />}
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                {/* Columnas de datos */}
                {Array.from({ length: columns }).map((_, j) => (
                  <Skeleton key={j} className="h-6 flex-1" />
                ))}
                {/* Columna de acciones */}
                {showActions && (
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
