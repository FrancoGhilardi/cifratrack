"use client";

import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import type { InvestmentDTO } from "../model/investment.dto";

interface InvestmentDistributionChartsProps {
  investments: InvestmentDTO[];
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

export function InvestmentDistributionCharts({
  investments,
}: InvestmentDistributionChartsProps) {
  const [visibleCharts, setVisibleCharts] = useState({
    principal: false,
    yield: false,
    total: false,
  });

  const toggleChart = (key: keyof typeof visibleCharts) => {
    setVisibleCharts((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const { formatCurrency } = useCurrency();

  // Filtramos solo las inversiones activas para ser consistentes con las Summary Cards
  const activeInvestments = useMemo(
    () => investments.filter((inv) => !inv.hasEnded),
    [investments],
  );

  const data = useMemo(() => {
    return activeInvestments.map((inv) => ({
      name: inv.title,
      platform: inv.platform,
      principal: inv.principal,
      yield: inv.yield,
      total: inv.total,
    }));
  }, [activeInvestments]);

  // Si no hay inversiones activas, no mostramos nada
  if (activeInvestments.length === 0) {
    return null;
  }
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
          <div className="text-xs text-muted-foreground mb-1">
            {data.platform}
          </div>
          <div className="font-bold">{formatCurrency(value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Gráfico 1: Invertido (Principal) */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Distribución de Capital
          </CardTitle>
          <Switch
            checked={visibleCharts.principal}
            onCheckedChange={() => toggleChart("principal")}
            aria-label="Toggle Capital Chart"
            className="scale-75 origin-right"
          />
        </CardHeader>
        {visibleCharts.principal && (
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={80}
                  dataKey="principal"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        )}
      </Card>

      {/* Gráfico 2: Ganancias (Yield) */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Distribución de Ganancias
          </CardTitle>
          <Switch
            checked={visibleCharts.yield}
            onCheckedChange={() => toggleChart("yield")}
            aria-label="Toggle Yield Chart"
            className="scale-75 origin-right"
          />
        </CardHeader>
        {visibleCharts.yield && (
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={80}
                  dataKey="yield"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        )}
      </Card>

      {/* Gráfico 3: Total (Principal + Yield) */}
      <Card className="border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Distribución Total
          </CardTitle>
          <Switch
            checked={visibleCharts.total}
            onCheckedChange={() => toggleChart("total")}
            aria-label="Toggle Total Chart"
            className="scale-75 origin-right"
          />
        </CardHeader>
        {visibleCharts.total && (
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={80}
                  dataKey="total"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
