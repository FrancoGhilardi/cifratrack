import { useMemo, useState, memo } from "react";
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
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// --- Tipos ---

interface ExpensesChartProps {
  summary: DashboardSummaryDTO;
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
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
 * Componente memoizado para el gráfico circular.
 * Maneja su propio estado de hover para aislamiento total.
 */
const CategoryPieChart = memo(function CategoryPieChart({
  data,
  formatCurrency,
}: {
  data: ChartDataPoint[];
  formatCurrency: (val: number) => string;
}) {
  const [activeName, setActiveName] = useState<string | null>(null);

  // Callbacks estables
  const onPieEnter = (d: any) => setActiveName(d.name);
  const onLegendEnter = (d: any) => setActiveName(d.value);
  const onPieLeave = () => setActiveName(null);

  // Tooltip extraído para evitar recreación en render
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground rounded-lg border p-2 shadow-sm">
          <div className="font-medium">{name}</div>
          <div className="font-bold">{formatCurrency(value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                strokeWidth={0}
                opacity={
                  activeName === null || activeName === entry.name ? 1 : 0.3
                }
                style={{
                  transition: "opacity 0.3s ease",
                  outline: "none",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "10px",
              cursor: "pointer",
            }}
            onMouseEnter={onLegendEnter}
            onMouseLeave={onPieLeave}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

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
        <div key={item.categoryId} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.categoryName}</span>
            <span className="text-muted-foreground">
              {calculatePercentage(item.total, totalReference)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${progressBarColorClass}`}
                style={{
                  width: `${getPercentageValue(item.total, totalReference)}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium">
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
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        <Switch
          checked={showChart}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${title} View`}
          className="scale-75 origin-right"
        />
      </CardHeader>
      <CardContent>
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
