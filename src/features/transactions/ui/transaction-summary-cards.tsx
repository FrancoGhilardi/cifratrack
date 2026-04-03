import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { useTransactionsSummary } from "../hooks/useTransactionsSummary";
import type { TransactionSummaryDTO } from "@/entities/transaction/model/transaction-summary.dto";

interface TransactionSummaryCardsProps {
  summary?: TransactionSummaryDTO;
}

/**
 * Widget: Tarjetas de resumen de transacciones del mes
 */
export function TransactionSummaryCards({
  summary: summaryData,
}: TransactionSummaryCardsProps) {
  const { format } = useCurrency();
  const summary = useTransactionsSummary(summaryData);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Total Pagado */}
      <Card className="border shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Pagado</CardTitle>
          <CheckCircle2
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              summary.hasPaidTransactions
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground/50"
            }`}
          />
        </CardHeader>
        <CardContent className="space-y-1">
          {summary.hasPaidTransactions ? (
            <>
              <div className="text-xl font-bold text-green-600 dark:text-green-400 sm:text-2xl">
                {format(summary.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {summary.paidCount}{" "}
                {summary.paidCount === 1
                  ? "movimiento pagado"
                  : "movimientos pagados"}
              </p>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <div className="text-xl font-bold text-muted-foreground/50 sm:text-2xl">
                {format(0)}
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Sin movimientos pagados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Pendiente */}
      <Card className="border shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
          <Clock
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              summary.hasPendingTransactions
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground/50"
            }`}
          />
        </CardHeader>
        <CardContent className="space-y-1">
          {summary.hasPendingTransactions ? (
            <>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 sm:text-2xl">
                {format(summary.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {summary.pendingCount}{" "}
                {summary.pendingCount === 1
                  ? "movimiento pendiente"
                  : "movimientos pendientes"}
              </p>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <div className="text-xl font-bold text-muted-foreground/50 sm:text-2xl">
                {format(0)}
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Sin movimientos pendientes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
