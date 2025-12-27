import { DataTableSkeleton } from "@/shared/ui/data-table-skeleton";

export function PaymentMethodListSkeleton() {
  return <DataTableSkeleton rows={6} columns={3} showActions showCreateButton={false} />;
}
