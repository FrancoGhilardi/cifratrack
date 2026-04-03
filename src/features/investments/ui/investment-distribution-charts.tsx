"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";

import type { InvestmentDTO } from "../model/investment.dto";

interface InvestmentDistributionChartsProps {
  investments: InvestmentDTO[];
}

type ChartKey = "principal" | "yield" | "total";

type ChartDatum = {
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

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#06b6d4",
  "#14b8a6",
  "#f43f5e",
  "#6366f1",
  "#84cc16",
];

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

function ChartCard({
  title,
  description,
  chartKey,
  checked,
  onCheckedChange,
  data,
  formatCurrency,
}: {
  title: string;
  description: string;
  chartKey: ChartKey;
  checked: boolean;
  onCheckedChange: () => void;
  data: ChartDatum[];
  formatCurrency: (value: number) => string;
}) {
  return (
    <Card className="border shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={`Mostrar gráfico ${title}`}
          className="mt-0.5 scale-75"
        />
      </CardHeader>

      {checked && (
        <CardContent className="space-y-4">
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
                    <Cell
                      key={`${chartKey}-${entry.name}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip formatCurrency={formatCurrency} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="max-h-40 space-y-2 overflow-auto pr-1">
            {data.map((entry) => (
              <div
                key={`${chartKey}-legend-${entry.name}`}
                className="flex items-start justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2"
              >
                <div className="min-w-0 flex items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.platform}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold">
                  {formatCurrency(entry[chartKey])}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function InvestmentDistributionCharts({
  investments,
}: InvestmentDistributionChartsProps) {
  const { formatCurrency } = useCurrency();
  const [visibleCharts, setVisibleCharts] = useState({
    principal: true,
    yield: false,
    total: false,
  });

  const activeInvestments = useMemo(
    () => investments.filter((investment) => !investment.hasEnded),
    [investments],
  );

  const data = useMemo<ChartDatum[]>(
    () =>
      activeInvestments.map((investment, index) => ({
        name: investment.title,
        platform: investment.platform,
        principal: investment.principal,
        yield: investment.yield,
        total: investment.total,
        color: COLORS[index % COLORS.length],
      })),
    [activeInvestments],
  );

  if (activeInvestments.length === 0) {
    return null;
  }

  const toggleChart = (key: keyof typeof visibleCharts) => {
    setVisibleCharts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ChartCard
        title="Distribución de capital"
        description="Solo inversiones activas"
        chartKey="principal"
        checked={visibleCharts.principal}
        onCheckedChange={() => toggleChart("principal")}
        data={data}
        formatCurrency={formatCurrency}
      />

      <ChartCard
        title="Distribución de ganancias"
        description="Rendimiento acumulado por inversión"
        chartKey="yield"
        checked={visibleCharts.yield}
        onCheckedChange={() => toggleChart("yield")}
        data={data}
        formatCurrency={formatCurrency}
      />

      <ChartCard
        title="Distribución total"
        description="Capital más rendimiento"
        chartKey="total"
        checked={visibleCharts.total}
        onCheckedChange={() => toggleChart("total")}
        data={data}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
