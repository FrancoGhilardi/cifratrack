"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useYieldHistory } from "../hooks/useYieldHistory";
import { YIELD_PROVIDERS } from "../config/providers";
import { useProviders } from "../hooks/useProviders";

export function YieldChart() {
  const [providerId, setProviderId] = useState("mercadopago");
  const { data: history, isLoading } = useYieldHistory(providerId);
  const { data: availableProviders } = useProviders();

  // Prepare data for chart
  const chartData =
    history?.map((item) => ({
      date: item.date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
      }),
      rate: item.rate,
      fullDate: item.date.toLocaleDateString("es-AR", {
        dateStyle: "medium",
        timeZone: "UTC",
      }),
    })) || [];

  const providersList =
    availableProviders && availableProviders.length > 0
      ? availableProviders
      : Object.entries(YIELD_PROVIDERS).map(([id, cfg]) => ({
          id,
          name: cfg.name,
          color: cfg.color,
        }));

  const currentProvider = providersList.find((p) => p.id === providerId);
  const currentColor =
    currentProvider?.color || YIELD_PROVIDERS[providerId]?.color || "#8884d8";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          Tendencia de Rendimientos (TNA)
        </CardTitle>
        <Select value={providerId} onValueChange={setProviderId}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent>
            {providersList.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">
              Cargando datos...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
              <span>Sin datos disponibles</span>
              <span className="text-xs">
                Los datos se actualizarán automáticamente
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={currentColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={currentColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  minTickGap={30}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                  fontSize={12}
                  domain={["auto", "auto"]}
                  width={40}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Fecha
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.fullDate}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                TNA
                              </span>
                              <span className="font-bold text-foreground">
                                {payload[0].value}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={currentColor}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
