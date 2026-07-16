"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type ChartKey = "principal" | "yield" | "total";

export type ChartDatum = {
  name: string;
  platform: string;
  principal: number;
  yield: number;
  total: number;
  color: string;
};

type TooltipPayloadItem = {
  payload: ChartDatum;
  value: number;
};

function ChartTooltip({
  active,
  payload,
  formatCurrency,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  formatCurrency: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];
  return (
    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-sm">
      <p className="font-medium">{item.payload.name}</p>
      <p className="text-xs text-muted-foreground">{item.payload.platform}</p>
      <p className="mt-1 font-semibold">{formatCurrency(item.value)}</p>
    </div>
  );
}

const CHART_LABEL: Record<ChartKey, string> = {
  principal: "Distribución de capital",
  yield: "Distribución de ganancias",
  total: "Distribución total",
};

export function InvestmentPieChart({
  data,
  chartKey,
  formatCurrency,
}: {
  data: ChartDatum[];
  chartKey: ChartKey;
  formatCurrency: (value: number) => string;
}) {
  const total = data.reduce((sum, entry) => sum + entry[chartKey], 0);
  const chartSummary = data
    .map(
      (entry) =>
        `${entry.name}: ${formatCurrency(entry[chartKey])}${
          total > 0 ? ` (${Math.round((entry[chartKey] / total) * 100)}%)` : ""
        }`,
    )
    .join(", ");

  return (
    <div className="space-y-4">
      <div
        className="h-[220px] sm:h-[250px]"
        role="img"
        aria-label={`${CHART_LABEL[chartKey]}: ${chartSummary}`}
      >
        <ResponsiveContainer width="100%" height="100%" aria-hidden="true">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={82}
              dataKey={chartKey}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={`${chartKey}-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltip formatCurrency={formatCurrency} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{CHART_LABEL[chartKey]}</caption>
        <thead>
          <tr>
            <th scope="col">Inversión</th>
            <th scope="col">Plataforma</th>
            <th scope="col">Monto</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={`${chartKey}-row-${entry.name}`}>
              <td>{entry.name}</td>
              <td>{entry.platform}</td>
              <td>{formatCurrency(entry[chartKey])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
