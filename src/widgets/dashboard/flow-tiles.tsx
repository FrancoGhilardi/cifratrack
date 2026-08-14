"use client";

import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import { Card } from "@/shared/ui/card";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { cn } from "@/shared/lib/utils";

interface FlowTilesProps {
  summary: DashboardSummaryDTO;
}

interface FlowTileProps {
  title: string;
  amount: number;
  count: number;
  share: number;
  tone: "pos" | "neg";
  formatCurrency: (value: number) => string;
}

function FlowTile({
  title,
  amount,
  count,
  share,
  tone,
  formatCurrency,
}: FlowTileProps) {
  const isEmpty = count === 0;

  return (
    <Card className="flex flex-col justify-center gap-2.5 border border-border/70 px-4 py-4 shadow-none sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-medium">{title}</h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {count} mov.
        </span>
      </div>

      <p
        className={cn(
          "font-mono text-xl tabular-nums tracking-tight sm:text-2xl",
          isEmpty && "text-muted-foreground/60",
          !isEmpty && tone === "pos" && "text-app-pos",
          !isEmpty && tone === "neg" && "text-app-neg",
        )}
      >
        {formatCurrency(amount)}
      </p>

      <div className="h-[3px] overflow-hidden rounded-sm bg-muted">
        <div
          className={cn(
            "h-full rounded-sm",
            tone === "pos" ? "bg-app-pos" : "bg-app-neg",
          )}
          style={{ width: `${share}%` }}
        />
      </div>

      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {isEmpty
          ? `Sin ${title.toLowerCase()} este mes`
          : `${share.toFixed(1).replace(".", ",")} % del movimiento del mes`}
      </span>
    </Card>
  );
}

/**
 * Widget: ingresos y egresos del mes con su proporción sobre el total movido.
 */
export function FlowTiles({ summary }: FlowTilesProps) {
  const { format: formatCurrency } = useCurrency();
  const moved = summary.totalIncome + summary.totalExpenses;
  const incomeShare = moved === 0 ? 0 : (summary.totalIncome / moved) * 100;
  const expenseShare = moved === 0 ? 0 : (summary.totalExpenses / moved) * 100;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <FlowTile
        title="Ingresos"
        amount={summary.totalIncome}
        count={summary.transactionsCount.income}
        share={incomeShare}
        tone="pos"
        formatCurrency={formatCurrency}
      />
      <FlowTile
        title="Egresos"
        amount={summary.totalExpenses}
        count={summary.transactionsCount.expenses}
        share={expenseShare}
        tone="neg"
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
