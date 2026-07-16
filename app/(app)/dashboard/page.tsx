import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/model/query-keys";
import { getDashboardSummaryServer } from "@/features/dashboard/api/dashboard.server";
import { DashboardPageClient } from "./dashboard-page-client";

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Página del Dashboard — prefetch del resumen del mes actual en el server
 * para que el primer paint ya traiga datos (evita el waterfall client-only).
 */
export default async function DashboardPage() {
  const month = getCurrentMonth();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.summary(month),
    queryFn: () => getDashboardSummaryServer(month),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPageClient />
    </HydrationBoundary>
  );
}
