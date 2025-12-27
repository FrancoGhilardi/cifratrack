'use client';

import { Skeleton } from './skeleton';

interface TableRowsSkeletonProps {
  rows?: number;
  columns?: number;
  showActions?: boolean;
}

/**
 * Skeleton reutilizable para el body de tablas (sin header ni filtros).
 */
export function TableRowsSkeleton({
  rows = 5,
  columns = 4,
  showActions = true,
}: TableRowsSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3">
          {Array.from({ length: columns }).map((__, colIdx) => (
            <Skeleton key={colIdx} className="h-6 w-32 flex-1" />
          ))}
          {showActions && (
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
