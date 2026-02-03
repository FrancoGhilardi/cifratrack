import { useState } from "react";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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

interface ExpensesChartProps {
  summary: DashboardSummaryDTO;
}

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

/**
 * Widget: Lista de egresos e ingresos por categoría
 * Permite alternar entre vista de lista y gráfico circular
 */
export function ExpensesChart({ summary }: ExpensesChartProps) {
  const { format: formatCurrency } = useCurrency();
  const [chartMode, setChartMode] = useState({
    expenses: false,
    income: false,
  });

  const toggleMode = (key: keyof typeof chartMode) => {
    setChartMode((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      return (
        <div className="bg-popover text-popover-foreground rounded-lg border p-2 shadow-sm">
          <div className="font-medium">{data.name}</div>
          <div className="font-bold">{formatCurrency(value)}</div>
        </div>
      );
    }
    return null;
  };

  const renderChart = (data: any[], dataKey: string) => (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={80}
            dataKey={dataKey}
            nameKey="name"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                strokeWidth={0}
                opacity={
                  activeIndex === null || activeIndex === index ? 1 : 0.3
                }
                style={{
                  transition: "opacity 0.3s ease",
                  outline: "none",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "10px",
              cursor: "pointer",
            }}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const expensesData = summary.expensesByCategory.map((item) => ({
    name: item.categoryName,
    value: item.total,
  }));

  const incomeData = summary.incomeByCategory.map((item) => ({
    name: item.categoryName,
    value: item.total,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Egresos por Categoría */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Egresos por Categoría</CardTitle>
          <Switch
            checked={chartMode.expenses}
            onCheckedChange={() => toggleMode("expenses")}
            aria-label="Toggle Expenses View"
            className="scale-75 origin-right"
          />
        </CardHeader>
        <CardContent>
          {summary.expensesByCategory.length === 0 ? (
            <EmptyState
              icon={ArrowDownCircle}
              title="No hay egresos"
              description="Los egresos aparecerán aquí"
            />
          ) : chartMode.expenses ? (
            renderChart(expensesData, "value")
          ) : (
            <div className="space-y-3">
              {summary.expensesByCategory.map((item) => (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.categoryName}</span>
                    <span className="text-muted-foreground">
                      {calculatePercentage(item.total, summary.totalExpenses)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 dark:bg-red-400"
                        style={{
                          width: `${getPercentageValue(
                            item.total,
                            summary.totalExpenses,
                          )}%`,
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
          )}
        </CardContent>
      </Card>

      {/* Ingresos por Categoría */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Ingresos por Categoría</CardTitle>
          <Switch
            checked={chartMode.income}
            onCheckedChange={() => toggleMode("income")}
            aria-label="Toggle Income View"
            className="scale-75 origin-right"
          />
        </CardHeader>
        <CardContent>
          {summary.incomeByCategory.length === 0 ? (
            <EmptyState
              icon={ArrowUpCircle}
              title="No hay ingresos"
              description="Los ingresos aparecerán aquí"
            />
          ) : chartMode.income ? (
            renderChart(incomeData, "value")
          ) : (
            <div className="space-y-3">
              {summary.incomeByCategory.map((item) => (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.categoryName}</span>
                    <span className="text-muted-foreground">
                      {calculatePercentage(item.total, summary.totalIncome)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 dark:bg-green-400"
                        style={{
                          width: `${getPercentageValue(
                            item.total,
                            summary.totalIncome,
                          )}%`,
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
