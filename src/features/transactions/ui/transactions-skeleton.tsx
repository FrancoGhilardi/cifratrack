import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function TransactionSummaryStripSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/70 py-0 shadow-none">
      <div className="border-b border-border/60 px-4 py-2.5">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-border/60 lg:grid-cols-4 lg:divide-y-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2 px-4 py-4">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TransactionsLedgerSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-0" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-border/60 py-3.5 last:border-0"
        >
          <Skeleton className="h-3 w-16 shrink-0" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="hidden h-3 w-24 md:block" />
          <Skeleton className="h-3 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}
