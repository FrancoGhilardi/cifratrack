import { useMemo, useState, memo } from "react";
import dynamic from "next/dynamic";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";
import { ArrowUpCircle, ArrowDownCircle, type LucideIcon } from "lucide-react";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import {
  calculatePercentage,
  getPercentageValue,
} from "@/shared/lib/utils/percentage";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
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

// --- Constantes ---

const COLORS = [
  "#0ea5e9", // sky-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#f43f5e", // rose-500
];

// --- Sub-Componentes Puros (SRP & Performance) ---

/**
 * Componente puro para la lista de categorías.
 * Elimina la duplicación de código entre Ingresos y Egresos.
 */
const CategoryList = memo(function CategoryList({
  items,
  totalReference,
  progressBarColorClass,
  formatCurrency,
}: {
  items: { categoryId: string; categoryName: string; total: number }[];
  totalReference: number;
  progressBarColorClass: string;
  formatCurrency: (val: number) => string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.categoryId}
          className="space-y-2 rounded-lg border border-border/70 p-3"
        >
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 flex-1 break-words font-medium">
              {item.categoryName}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {calculatePercentage(item.total, totalReference)}%
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full ${progressBarColorClass}`}
                style={{
                  width: `${getPercentageValue(item.total, totalReference)}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium sm:min-w-[7rem] sm:text-right">
              {formatCurrency(item.total)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * Wrapper Genérico para la tarjeta de Dashboard.
 * Aplica OCP: Permite extender el contenido sin modificar el contenedor.
 */
function DashboardChartCard({
  title,
  showChart,
  onToggle,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string;
  showChart: boolean;
  onToggle: () => void;
  isEmpty: boolean;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {showChart ? "Vista grafica" : "Vista en lista"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 px-2.5 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Grafico
          </span>
          <Switch
            checked={showChart}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${title} View`}
            className="scale-75 origin-right"
          />
        </div>
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
  const [chartMode, setChartMode] = useState({
    expenses: false,
    income: false,
  });

  const toggleMode = (key: keyof typeof chartMode) => {
    setChartMode((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Performance: Memoización de datos para evitar recálculos en re-renders
  const expensesData: ChartDataPoint[] = useMemo(
    () =>
      summary.expensesByCategory
        .filter((item) => item.total > 0)
        .map((item, index) => ({
          name: item.categoryName,
          value: item.total,
          color: COLORS[index % COLORS.length],
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
          color: COLORS[index % COLORS.length],
        })),
    [summary.incomeByCategory],
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Sección: Egresos */}
      <DashboardChartCard
        title="Egresos por Categoría"
        showChart={chartMode.expenses}
        onToggle={() => toggleMode("expenses")}
        isEmpty={summary.expensesByCategory.length === 0}
        emptyIcon={ArrowDownCircle}
        emptyTitle="No hay egresos"
        emptyDescription="Los egresos aparecerán aquí"
      >
        {chartMode.expenses ? (
          <CategoryPieChart
            data={expensesData}
            formatCurrency={formatCurrency}
          />
        ) : (
          <CategoryList
            items={summary.expensesByCategory}
            totalReference={summary.totalExpenses}
            progressBarColorClass="bg-red-600 dark:bg-red-400"
            formatCurrency={formatCurrency}
          />
        )}
      </DashboardChartCard>

      {/* Sección: Ingresos */}
      <DashboardChartCard
        title="Ingresos por Categoría"
        showChart={chartMode.income}
        onToggle={() => toggleMode("income")}
        isEmpty={summary.incomeByCategory.length === 0}
        emptyIcon={ArrowUpCircle}
        emptyTitle="No hay ingresos"
        emptyDescription="Los ingresos aparecerán aquí"
      >
        {chartMode.income ? (
          <CategoryPieChart data={incomeData} formatCurrency={formatCurrency} />
        ) : (
          <CategoryList
            items={summary.incomeByCategory}
            totalReference={summary.totalIncome}
            progressBarColorClass="bg-green-600 dark:bg-green-400"
            formatCurrency={formatCurrency}
          />
        )}
      </DashboardChartCard>
    </div>
  );
}
