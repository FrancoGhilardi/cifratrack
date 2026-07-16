import { PageHeader } from "@/shared/ui/page-header";
import {
  SummaryCardsSkeleton,
  ExpensesChartSkeleton,
} from "@/widgets/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Principal"
        description="Resumen mensual de ingresos, egresos y balance para el periodo seleccionado."
      />
      <SummaryCardsSkeleton />
      <ExpensesChartSkeleton />
    </div>
  );
}
