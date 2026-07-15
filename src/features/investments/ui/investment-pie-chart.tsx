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

export function InvestmentPieChart({
  data,
  chartKey,
  formatCurrency,
}: {
  data: ChartDatum[];
  chartKey: ChartKey;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="h-[220px] sm:h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
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
          <Tooltip content={<ChartTooltip formatCurrency={formatCurrency} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
