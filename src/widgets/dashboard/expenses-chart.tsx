import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { SegmentedToggle } from "@/shared/ui/segmented-toggle";
import { ArrowUpCircle, ArrowDownCircle, type LucideIcon } from "lucide-react";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { BRAND_SERIF } from "@/shared/ui/brand-fonts";
import { CategoryLedger } from "./category-ledger";
import { getCategoryColor } from "@/shared/lib/category-colors";
import type { ChartDataPoint } from "./category-pie-chart";

const CategoryPieChart = dynamic(
  () => import("./category-pie-chart").then((m) => m.CategoryPieChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[220px] sm:h-[250px]" />,
  },
);

// --- Tipos ---

interface ExpensesChartProps {
  summary: DashboardSummaryDTO;
}

type ViewMode = "list" | "chart";

const VIEW_OPTIONS = [
  { value: "list" as const, label: "Lista" },
  { value: "chart" as const, label: "Torta" },
];

// --- Sub-Componentes ---

/**
 * Wrapper genérico para la tarjeta de categorías.
 * Aplica OCP: permite extender el contenido sin modificar el contenedor.
 */
function DashboardChartCard({
  title,
  subtitle,
  mode,
  onModeChange,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string;
  subtitle: string;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  isEmpty: boolean;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle
            className="text-[17px] font-medium tracking-tight"
            style={{ fontFamily: BRAND_SERIF }}
          >
            {title}
          </CardTitle>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <SegmentedToggle
          value={mode}
          onChange={onModeChange}
          options={VIEW_OPTIONS}
          ariaLabel={`Vista de ${title.toLowerCase()}`}
        />
      </CardHeader>
      <CardContent className="pt-2">
        {isEmpty ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// --- Widget Principal ---

export function ExpensesChart({ summary }: ExpensesChartProps) {
  const { format: formatCurrency } = useCurrency();
  const [expensesMode, setExpensesMode] = useState<ViewMode>("list");
  const [incomeMode, setIncomeMode] = useState<ViewMode>("list");

  // Performance: memoización de datos para evitar recálculos en re-renders
  const expensesData: ChartDataPoint[] = useMemo(
    () =>
      summary.expensesByCategory
        .filter((item) => item.total > 0)
        .map((item, index) => ({
          name: item.categoryName,
          value: item.total,
          color: getCategoryColor(index),
        })),
    [summary.expensesByCategory],
  );

  const incomeData: ChartDataPoint[] = useMemo(
    () =>
      summary.incomeByCategory
        .filter((item) => item.total > 0)
        .map((item, index) => ({
          name: item.categoryName,
          value: item.total,
          color: getCategoryColor(index),
        })),
    [summary.incomeByCategory],
  );

  const expensesSubtitle = `${summary.expensesByCategory.length} categorías · ${formatCurrency(summary.totalExpenses)}`;
  const incomeSubtitle = `${summary.incomeByCategory.length} categorías · ${formatCurrency(summary.totalIncome)}`;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DashboardChartCard
        title="Egresos por categoría"
        subtitle={expensesSubtitle}
        mode={expensesMode}
        onModeChange={setExpensesMode}
        isEmpty={summary.expensesByCategory.length === 0}
        emptyIcon={ArrowDownCircle}
        emptyTitle="No hay egresos"
        emptyDescription="Los egresos aparecerán acá"
      >
        {expensesMode === "chart" ? (
          <CategoryPieChart
            data={expensesData}
            formatCurrency={formatCurrency}
          />
        ) : (
          <CategoryLedger
            items={summary.expensesByCategory}
            totalReference={summary.totalExpenses}
            formatCurrency={formatCurrency}
          />
        )}
      </DashboardChartCard>

      <DashboardChartCard
        title="Ingresos por categoría"
        subtitle={incomeSubtitle}
        mode={incomeMode}
        onModeChange={setIncomeMode}
        isEmpty={summary.incomeByCategory.length === 0}
        emptyIcon={ArrowUpCircle}
        emptyTitle="No hay ingresos"
        emptyDescription="Los ingresos aparecerán acá"
      >
        {incomeMode === "chart" ? (
          <CategoryPieChart data={incomeData} formatCurrency={formatCurrency} />
        ) : (
          <CategoryLedger
            items={summary.incomeByCategory}
            totalReference={summary.totalIncome}
            formatCurrency={formatCurrency}
          />
        )}
      </DashboardChartCard>
    </div>
  );
}
