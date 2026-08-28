"use client";

import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import type { BalanceSeriesDTO } from "@/entities/dashboard/model/balance-series.dto";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { cn } from "@/shared/lib/utils";
import { BalanceCurveChart } from "./balance-curve-chart";

interface BalanceHeroProps {
  summary: DashboardSummaryDTO;
  series?: BalanceSeriesDTO;
  isSeriesLoading: boolean;
  /** Etiqueta del período, ej. "agosto 2026" */
  monthLabel: string;
}

/** Etiqueta corta del primer y último día del mes para el eje. */
function getAxisLabels(series: BalanceSeriesDTO): [string, string, string] {
  const first = series.points[0]?.day ?? "";
  const middle = series.points[Math.floor(series.points.length / 2)]?.day ?? "";
  const last = series.points.at(-1)?.day ?? "";
  const short = (day: string) => day.slice(8).replace(/^0/, "");
  return [short(first), short(middle), short(last)];
}

/**
 * Widget: balance del mes con la curva de saldo acumulado.
 */
export function BalanceHero({
  summary,
  series,
  isSeriesLoading,
  monthLabel,
}: BalanceHeroProps) {
  const { format: formatCurrency } = useCurrency();
  const hasData = summary.transactionsCount.total > 0;
  const isNegative = summary.balance < 0;
  const axis = series ? getAxisLabels(series) : null;

  return (
    <Card className="relative flex h-full flex-col overflow-hidden border border-border/70 px-5 pt-5 shadow-none sm:px-6 sm:pt-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        Balance de {monthLabel}
      </span>

      <p
        className={cn(
          "mt-2 font-mono text-3xl leading-none tabular-nums tracking-tight sm:text-[40px]",
          !hasData && "text-muted-foreground/60",
          hasData && isNegative && "text-app-neg",
          hasData && !isNegative && "text-foreground",
        )}
      >
        {formatCurrency(summary.balance)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-app-nav-active px-2.5 py-1 font-mono text-[10.5px] text-app-nav-accent">
          {summary.transactionsCount.total} movimientos
        </span>
        {summary.transactionsCount.pending > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-app-neg/15 px-2.5 py-1 font-mono text-[10.5px] text-app-neg">
            {summary.transactionsCount.pending} pendientes
          </span>
        )}
      </div>

      <div className="relative mt-4 -mx-5 h-[132px] sm:-mx-6">
        {isSeriesLoading && (
          <Skeleton className="absolute inset-x-5 inset-y-2 sm:inset-x-6" />
        )}
        {!isSeriesLoading && series && series.points.length > 1 && (
          <BalanceCurveChart
            points={series.points}
            tone={isNegative ? "neg" : "pos"}
          />
        )}
        {!isSeriesLoading && axis && (
          <div className="absolute inset-x-5 bottom-2 flex justify-between font-mono text-[9.5px] tracking-[0.08em] text-muted-foreground sm:inset-x-6">
            <span>{axis[0]}</span>
            <span>{axis[1]}</span>
            <span>{axis[2]}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
