import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Skeleton para una fila de categoría
 */
function CategoryRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      {/* Nombre */}
      <div className="flex-1">
        <Skeleton className="h-4 w-32" />
      </div>
      
      {/* Estado */}
      <div className="flex-1">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      {/* Por defecto */}
      <div className="flex-1">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Acciones */}
      <div className="flex items-center justify-end gap-2 flex-1">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton para la lista de categorías
 */
export function CategoryListSkeleton() {
  return (
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        {/* Título y descripción */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Botón nueva categoría */}
        <Skeleton className="h-9 w-36 rounded-md" />
      </CardHeader>
      
      <CardContent>
        {/* Encabezados de la tabla */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex-1">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex-1 flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        {/* Filas de categorías */}
        <div className="space-y-0">
          {[1, 2, 3, 4].map((i) => (
            <CategoryRowSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
