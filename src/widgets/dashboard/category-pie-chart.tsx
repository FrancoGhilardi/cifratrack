import { useState, memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/shared/lib/utils";
import { calculatePercentage } from "@/shared/lib/utils/percentage";

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
  formatCurrency: (val: number) => string;
}

function ChartTooltip({ active, payload, formatCurrency }: ChartTooltipProps) {
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
}

/**
 * Componente memoizado para el gráfico circular.
 * Maneja su propio estado de hover para aislamiento total.
 */
export const CategoryPieChart = memo(function CategoryPieChart({
  data,
  formatCurrency,
}: {
  data: ChartDataPoint[];
  formatCurrency: (val: number) => string;
}) {
  const [activeName, setActiveName] = useState<string | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (d: { name?: string }) => setActiveName(d.name ?? null);
  const onLegendEnter = (d: { value?: string }) =>
    setActiveName(d.value ?? null);
  const onPieLeave = () => setActiveName(null);

  return (
    <div className="space-y-4">
      <div className="h-[220px] sm:h-[250px]">
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
            <Tooltip
              content={<ChartTooltip formatCurrency={formatCurrency} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((entry) => (
          <button
            key={entry.name}
            type="button"
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-left transition-colors",
              activeName !== null && activeName !== entry.name && "opacity-50",
            )}
            onMouseEnter={() => onLegendEnter({ value: entry.name })}
            onMouseLeave={onPieLeave}
            onFocus={() => onLegendEnter({ value: entry.name })}
            onBlur={onPieLeave}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate text-sm font-medium">{entry.name}</span>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-medium text-foreground">
                {calculatePercentage(entry.value, total)}%
              </div>
              <div className="text-[11px] text-muted-foreground">
                {formatCurrency(entry.value)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
