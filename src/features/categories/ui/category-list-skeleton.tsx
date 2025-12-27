import { DataTableSkeleton } from '@/shared/ui/data-table-skeleton';

/**
 * Skeleton para la lista de categorías
 */
export function CategoryListSkeleton() {
  return <DataTableSkeleton rows={4} columns={3} showActions showCreateButton />;
}

