import { DataTableSkeleton } from '@/shared/ui/data-table-skeleton';

export function RecurringRulesSkeleton() {
  return <DataTableSkeleton rows={6} columns={8} showActions showCreateButton />;
}
