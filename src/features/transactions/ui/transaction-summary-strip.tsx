"use client";

import type { TransactionSummaryDTO } from "@/entities/transaction/model/transaction-summary.dto";
import { Card } from "@/shared/ui/card";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { useTransactionsSummaryView } from "../hooks/useTransactionsSummaryView";
import { cn } from "@/shared/lib/utils";

interface TransactionSummaryStripProps {
  summary?: TransactionSummaryDTO;
  /** Etiqueta del período, ej. "agosto 2026". */
  monthLabel: string;
}

interface MetricProps {
  label: string;
  value: string;
  hint: string;
  tone?: "pos" | "neg" | "pend" | "muted";
}

function Metric({ label, value, hint, tone = "muted" }: MetricProps) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-4 sm:px-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-lg tabular-nums tracking-tight sm:text-xl",
          tone === "pos" && "text-app-pos",
          tone === "neg" && "text-app-neg",
          tone === "pend" && "text-app-pend",
          tone === "muted" && "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
        {hint}
      </span>
    </div>
  );
}

/**
 * Tira de resumen del mes: ingresos, egresos y el corte pagado/pendiente.
 * Los importes no dependen de los filtros de la tabla: siempre son del mes.
 */
export function TransactionSummaryStrip({
  summary: summaryData,
  monthLabel,
}: TransactionSummaryStripProps) {
  const { format } = useCurrency();
  const summary = useTransactionsSummaryView(summaryData);
  const paidShare = summary.paidShare;

  const movements = (count: number) =>
    `${count} ${count === 1 ? "movimiento" : "movimientos"}`;

  return (
    <Card className="overflow-hidden border border-border/70 py-0 shadow-none">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Resumen de {monthLabel}
        </span>
        <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
          {movements(summary.incomeCount + summary.expenseCount)}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-border/60 lg:grid-cols-4 lg:divide-y-0">
        <Metric
          label="Ingresos"
          value={format(summary.totalIncome)}
          hint={movements(summary.incomeCount)}
          tone={summary.hasIncome ? "pos" : "muted"}
        />
        <Metric
          label="Egresos"
          value={format(summary.totalExpenses)}
          hint={movements(summary.expenseCount)}
          tone={summary.hasExpenses ? "neg" : "muted"}
        />
        <Metric
          label="Pagado"
          value={format(summary.totalPaid)}
          hint={movements(summary.paidCount)}
          tone={summary.hasPaidTransactions ? "pos" : "muted"}
        />
        <Metric
          label="Pendiente"
          value={format(summary.totalPending)}
          hint={movements(summary.pendingCount)}
          tone={summary.hasPendingTransactions ? "pend" : "muted"}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border/60 px-4 py-2.5 sm:px-5">
        <div
          className="h-[3px] flex-1 overflow-hidden rounded-sm bg-muted"
          role="img"
          aria-label={`${paidShare.toFixed(0)} % de los egresos del mes están pagados`}
        >
          <div
            className="h-full rounded-sm bg-app-pos"
            style={{ width: `${paidShare}%` }}
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {paidShare.toFixed(0)} % pagado
        </span>
      </div>
    </Card>
  );
}
