import { PageHeader } from "@/shared/ui/page-header";
import {
  DashboardHeroSkeleton,
  ExpensesChartSkeleton,
} from "@/widgets/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Panel principal"
        description="Ingresos, egresos y balance del período seleccionado."
      />
      <DashboardHeroSkeleton />
      <ExpensesChartSkeleton />
    </div>
  );
}
